import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/firebase";

/**
 * Uploads a file to Firebase Storage and returns the download URL
 * @param file The actual File object from an <input type="file">
 * @param folder The storage folder path (e.g., 'images', 'pdfs')
 * @param onProgress Optional callback to update a progress bar in the UI
 */
export const uploadFile = async (
  file: File, 
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided");
      return;
    }

    // Create a unique filename so we don't overwrite existing files
    const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${uniqueFileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Calculate progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        reject(error);
      },
      async () => {
        // Upload completed successfully, get the URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Deletes a file from Firebase Storage given its full download URL
 */
export const deleteFile = async (fileUrl: string) => {
  if (!fileUrl) return;
  
  try {
    // Extract the file path from the Firebase URL
    const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
    if (!fileUrl.startsWith(baseUrl)) return; // Not a Firebase URL

    let path = fileUrl.replace(baseUrl, "");
    const indexOfFirstSlash = path.indexOf("/");
    path = path.substring(indexOfFirstSlash + 3); // bypass bucket name and /o/
    const indexOfQuestionMark = path.indexOf("?");
    path = path.substring(0, indexOfQuestionMark);
    path = decodeURIComponent(path);

    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};