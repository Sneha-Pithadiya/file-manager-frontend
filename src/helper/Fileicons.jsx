

import { MdFolder, MdInsertDriveFile, MdImage, MdPictureAsPdf } from "react-icons/md";
import { FaFileWord, FaFileExcel } from "react-icons/fa";

export const getFileIcon = (file, size = 40) => {
  if (file.is_folder) return <MdFolder size={size} color="#fbbf24" />; 
   const ext = file.original_name.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return <MdPictureAsPdf size={size} color="#ef4444" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <MdImage size={size} color="#3b82f6" />;
    case "doc":
    case "docx":
      return <FaFileWord size={size} color="#2563eb" />;
    case "xls":
    case "xlsx":
      return <FaFileExcel size={size} color="#16a34a" />;
    default:
      return <MdInsertDriveFile size={size} color="#6b7280" />; 
    }
};
