const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🚀 Garante que os diretórios 'images' e 'videos' existam
const createUploadFolders = () => {
  const uploadPath = path.join(__dirname, "..", "public", "uploads");
  const imagePath = path.join(uploadPath, "images");
  const videoPath = path.join(uploadPath, "videos");

  if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
  if (!fs.existsSync(imagePath)) fs.mkdirSync(imagePath);
  if (!fs.existsSync(videoPath)) fs.mkdirSync(videoPath);
};

createUploadFolders();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, "..", "public", "uploads");
    if (file.mimetype.startsWith("image/")) {
      uploadPath = path.join(uploadPath, "images");
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath = path.join(uploadPath, "videos");
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `produto-${uniqueSuffix}${ext}`);
  },
});

// Filtro de arquivos suportados – permite qualquer campo com arquivo de imagem ou vídeo
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado!"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limite de 50MB
});
