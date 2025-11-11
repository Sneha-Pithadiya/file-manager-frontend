

import { MdFolder, MdInsertDriveFile, MdImage, MdPictureAsPdf, MdImageAspectRatio, MdSettingsApplications, MdFolderZip, MdMusicNote, MdVideoFile, MdDescription, MdTableChart } from "react-icons/md";
import { FaFileWord, FaFileExcel, FaFolder, FaFile, FaFilePowerpoint, FaFilePdf, FaFileAlt, FaImage, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFileContract, FaCogs, FaVectorSquare, FaPencilRuler, FaDraftingCompass } from "react-icons/fa";

export const getFileIcon = (file, size = 10) => {
  // if (file.is_folder ) return <MdFolder size={size} color="#fbbf24" />; 
  const filename = file.filename   || file.name || "";
  const ext = filename.split(".").pop().toLowerCase();
  if (file.is_folder ) {
    switch (ext){
      case "zip":
      case "rar":
      case "7z":
         return <FaFileArchive size={size} color="#795548" />;
      default :
          return <MdFolder size={size} color="#FED45F" />; 

    }
  }
  switch (ext) {
    case "pdf":
      return <FaFilePdf size={size} color="#D93025" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FaFileImage size={size} color="#9B51E0 " />;
    case "svg":
    case "eps":
      return <FaDraftingCompass size={size} color="#2ACFCF " />;
    case "exe":
    case "iso":
      return <FaCogs size={size} color="#4B4B4B"/>;
    case "wav":
    case "mp3":
    case "falc" :
      return <FaFileAudio size={size} color="#F2C94C" />
    case "mp4":
    case "avi":
    case "mkv":
    case "mov":
      return <FaFileVideo size={size} color="#B41F1F" />
    case "doc":
    case "docx":
    case "odt":
      return <FaFileWord size={size} color="#1C3D72" />;
    case "xls":
    case "xlsx":
    case "csv":
      return <FaFileExcel size={size} color="#34A853" />;
    case "ppt":
    case "pptx":
      return <FaFilePowerpoint size={size} color="#F2994A"/>
    
    case "js":
    case "html":
    case "ts":
    case "py":
    case "java":
    case "jsx":
    case "css":
      return <FaFileCode size={size} color="#5A67F2" />
    case "json":
    case "xml":
    case "yml":
      return <FaFileContract size={size} color="#17A2B8" />
    case "zip":
    case "rar":
    case "7z":
         return <FaFileArchive size={size} color="#A0522D" />;
    case "txt":
    case "md":
         return <FaFileAlt size={size} color="#4A90E2" />;
    default:
       return <FaFile size={size} color="#9e9e9e" />; 
    }
};
