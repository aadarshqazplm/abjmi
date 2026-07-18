import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Make sure this points to your firebase config file

/**
 * Fetches content for a specific section from the 'site' collection
 */
export const getSectionData = async (sectionId: string) => {
  try {
    const docRef = doc(db, "site", sectionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log(`No data found for section: ${sectionId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${sectionId}:`, error);
    return null;
  }
};

/**
 * Saves or updates content for a specific section
 * Uses { merge: true } so it updates existing fields without wiping out others
 */
export const saveSectionData = async <T extends Record<string, any>>(sectionId: string, data: T): Promise<boolean> => {
  try {
    const docRef = doc(db, "site", sectionId);
    // TypeScript now knows 'data' is guaranteed to be an object acceptable by Firestore
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error saving ${sectionId}:`, error);
    return false;
  }
};