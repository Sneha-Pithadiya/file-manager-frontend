import { useState , useEffect } from "react";

export const ProgressBar = ({ initial = 0, speed = 500 }) => {
  const [progress, setProgress] = useState(initial);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div className="w-full bg-gray-200 mt-2 rounded-full dark:bg-gray-700">
        {progress !== 100 && (<div
        className="bg-green-800 text-xs font-medium text-green-100 text-center p-0.5 leading-none rounded"
        style={{ width: `${progress}%` }}
      >
        {progress}%
      </div>)}
        
    
    </div>
  );
};
