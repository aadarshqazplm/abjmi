import { useState, useRef } from "react";
import {  Loader2, FileText, CheckCircle2 } from "lucide-react";
import { uploadFile } from "../../services/storage";

interface PDFUploaderProps {
  currentPdfUrl?: string;
  onUploadSuccess: (url: string) => void;
  folder?: string;
}

export default function PDFUploader({ 
  currentPdfUrl, 
  onUploadSuccess, 
  folder = "pdfs" 
}: PDFUploaderProps) {
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(currentPdfUrl ? "Current Manuscript Attached" : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setProgress(0);

    try {
      const downloadUrl = await uploadFile(file, folder, (p) => setProgress(p));
      onUploadSuccess(downloadUrl);
    } catch (error) {
      alert(error)
      setFileName(currentPdfUrl ? "Current Manuscript Attached" : null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-stone-700">Manuscript (PDF)</label>
      
      <div className="relative mt-2 flex justify-center rounded-xl border-2 border-dashed border-stone-300 px-6 py-8 transition-colors hover:border-red-950 hover:bg-stone-50">
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden" 
          disabled={isUploading}
        />

        {fileName && !isUploading ? (
          <div className="flex w-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-semibold text-stone-800">{fileName}</p>
            <button
              type="button"
              onClick={() => {
                setFileName(null);
                onUploadSuccess(""); // Clear the URL in parent state
              }}
              className="mt-4 text-xs font-medium text-red-600 hover:text-red-800"
            >
              Remove PDF
            </button>
          </div>
        ) : isUploading ? (
          <div className="flex w-full flex-col items-center justify-center text-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-red-950" />
            <p className="text-sm font-semibold text-stone-800">Uploading...</p>
            
            {/* Progress Bar */}
            <div className="mt-4 w-full max-w-xs overflow-hidden rounded-full bg-stone-200">
              <div 
                className="h-2 rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="mt-2 text-xs font-bold text-red-950">{Math.round(progress)}%</span>
          </div>
        ) : (
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-stone-300" aria-hidden="true" />
            <div className="mt-4 flex justify-center text-sm leading-6 text-stone-600">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer rounded-md bg-transparent font-semibold text-red-950 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-950 focus-within:ring-offset-2 hover:text-red-800"
              >
                <span>Upload a PDF file</span>
              </button>
            </div>
            <p className="text-xs leading-5 text-stone-500">Max size 20MB</p>
          </div>
        )}
      </div>
    </div>
  );
}