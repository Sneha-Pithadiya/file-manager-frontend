

import { MdFolder, MdInsertDriveFile, MdImage, MdPictureAsPdf, MdImageAspectRatio, MdSettingsApplications, MdFolderZip, MdMusicNote, MdVideoFile, MdDescription, MdTableChart } from "react-icons/md";
import { FaFileWord, FaFileExcel, FaFolder, FaFile, FaFilePowerpoint, FaFilePdf, FaFileAlt, FaImage, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFileContract, FaCogs } from "react-icons/fa";

export const getFileIcon = (file, size = 40) => {
  // if (file.is_folder ) return <MdFolder size={size} color="#fbbf24" />; 
  const filename = file.original_name   || file.name || "";
  const ext = filename.split(".").pop().toLowerCase();
  if (file.is_folder ) {
    switch (ext){
      case "zip":
      case "rar":
      case "7z":
         return <FaFileArchive size={size} color="#795548" />;
      default :
          return <MdFolder size={size} color="#fbbf24" />; 

    }
  }
  switch (ext) {
    case "pdf":
      return <FaFilePdf size={size} color="#e06464" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FaFileImage size={size} color="#9c27b0" />;
    case "exe":
    case "iso":
      return <FaCogs size={size} color="#b71c1c"/>;
    case "wav":
    case "mp3":
    case "falc" :
      return <FaFileAudio size={size} color="#009688" />
    case "mp4":
    case "avi":
    case "mkv":
    case "mov":
      return <FaFileVideo size={size} color="#1565c0" />
    case "doc":
    case "docx":
    case "odt":
      return <FaFileWord size={size} color="#1976d2" />;
    case "xls":
    case "xlsx":
    case "csv":
      return <FaFileExcel size={size} color="#388e3c" />;
    case "ppt":
    case "pptx":
      return <FaFilePowerpoint size={size} color="#f57c00"/>
    case "txt":
    case "rtf":
      return <FaFileAlt size={size} color="#757575" />
    case "js":
    case "html":
    case "ts":
    case "py":
    case "java":
    case "jsx":
    case "css":
      return <FaFileCode size={size} color="#fbc02d" />
    case "json":
    case "xml":
    case "yml":
      return <FaFileContract size={size} color="#03a9f4" />
    case "zip":
    case "rar":
    case "7z":
         return <FaFileArchive size={size} color="#795548" />;
    default:
       return <FaFile size={size} color="#9e9e9e" />; 
    }
};
