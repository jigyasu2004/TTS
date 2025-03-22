import { useState, ChangeEvent } from "react";

interface FileUploadProps {
  onFileChange: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  sublabel?: string;
}

export function FileUpload({
  onFileChange,
  accept = "audio/*",
  maxSize = 10 * 1024 * 1024, // 10MB
  label = "Upload Reference Audio",
  sublabel = "MP3, WAV or OGG file",
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check file size
      if (file.size > maxSize) {
        setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
        return;
      }

      setFileName(file.name);
      onFileChange(file);
    }
  };

  return (
    <div className="w-full">
      <p className="block mb-2 font-medium text-gray-200">{label}</p>
      <label className="file-upload-label flex flex-col items-center justify-center border-2 border-dashed border-dark-lighter rounded-lg h-40 hover:border-primary transition-colors overflow-hidden cursor-pointer">
        {/* Relative wrapper moved inside the label */}
        <div className="relative w-full h-full">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="text-center pointer-events-none flex flex-col items-center justify-center h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-400">
              {fileName || "Drag and drop an audio file or click to browse"}
            </p>
            <p className="text-xs text-gray-500 mt-2">{sublabel}</p>
          </div>
        </div>
      </label>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
