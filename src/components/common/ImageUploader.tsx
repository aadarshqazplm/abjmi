import { useState, useRef } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadFile } from "../../services/storage"; 

interface ImageUploaderProps {
  currentImageUrl: string;
  onUploadSuccess: (url: string) => void;
  folder?: string;
}

export default function ImageUploader({ 
  currentImageUrl, 
  onUploadSuccess, 
  folder = "images" 
}: ImageUploaderProps) {
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentImageUrl);
  const [lastPropUrl, setLastPropUrl] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIXED: "Adjusting state during render" 
  // This replaces the useEffect and prevents the cascading render error.
  if (currentImageUrl !== lastPropUrl) {
    setLastPropUrl(currentImageUrl);
    setPreview(currentImageUrl);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Start upload
    setIsUploading(true);
    setProgress(0);

    try {
      const downloadUrl = await uploadFile(file, folder, (p) => setProgress(p));
      onUploadSuccess(downloadUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload image.");
      setPreview(currentImageUrl); // Revert preview on failure
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview("");
    onUploadSuccess(""); // Important: tell the parent form that the image is gone!
  };

  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-stone-700">Cover Image / Photo</label>
      
      <div className="relative mt-2 flex justify-center rounded-xl border-2 border-dashed border-stone-300 px-6 py-8 transition-colors hover:border-red-950 hover:bg-stone-50">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden" 
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative flex flex-col items-center">
            <img 
              src={preview} 
              alt="Preview" 
              className={`h-40 w-40 rounded-lg object-cover shadow-sm transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
            />
            
            {isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/60 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-red-950" />
                <span className="mt-2 text-xs font-bold text-red-950">{Math.round(progress)}%</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -right-3 -top-3 rounded-full bg-red-100 p-1.5 text-red-600 shadow-sm transition-colors hover:bg-red-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-stone-300" aria-hidden="true" />
            <div className="mt-4 flex text-sm leading-6 text-stone-600 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer rounded-md bg-transparent font-semibold text-red-950 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-950 focus-within:ring-offset-2 hover:text-red-800"
              >
                <span>Upload a file</span>
              </button>
            </div>
            <p className="text-xs leading-5 text-stone-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
}