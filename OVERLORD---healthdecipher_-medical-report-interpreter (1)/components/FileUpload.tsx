
import React, { useRef } from 'react';
import { Spinner } from './Spinner';
import { DocumentIcon } from './icons/DocumentIcon';

interface FileUploadProps {
  onFileUpload: (files: FileList) => void;
  isLoading: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  isLoading, 
  loadingText = "Processing...",
  icon = <DocumentIcon className="w-12 h-12 mb-4" />,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
    if(event.target) {
        event.target.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
        disabled={isLoading}
        multiple
      />
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-gray-500 h-[132px]">
            <div className="w-10 h-10">
              <Spinner />
            </div>
            <span className="mt-4 text-lg font-medium">{loadingText}</span>
            <span className="text-sm">Please wait...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 hover:text-primary">
            {icon}
            <span className="font-semibold">Click to upload file(s)</span>
            <span className="text-sm mt-1">or drag and drop</span>
            <p className="text-xs text-gray-400 mt-2">PDF, PNG, JPG supported</p>
          </div>
        )}
      </button>
    </div>
  );
};
