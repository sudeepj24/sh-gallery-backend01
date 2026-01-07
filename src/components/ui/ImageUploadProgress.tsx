interface ImageUploadProgressProps {
  progress: number;
  message: string;
  show: boolean;
}

export default function ImageUploadProgress({ progress, message, show }: ImageUploadProgressProps) {
  if (!show) return null;

  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-blue-700">{message}</span>
            <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}