//src\middlewares\uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Criar as pastas "uploads/images" e "uploads/videos" se não existirem
const imageDir = path.join(__dirname, "../../public/uploads/images/");
const videoDir = path.join(__dirname, "../../public/uploads/videos/");

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// Configuração de armazenamento para imagens e vídeos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "public/uploads/images/"); // Armazena imagens
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "public/uploads/videos/"); // Armazena vídeos
    } else {
      cb(new Error("Tipo de arquivo não suportado!"), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `produto-${uniqueSuffix}${ext}`);
  },
});

// Filtro para aceitar apenas imagens e vídeos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/mkv"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos de imagem ou vídeo são permitidos!"), false);
  }
};

// Middleware para aceitar múltiplos arquivos (imagem e vídeo)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 }, // Limite de 50MB
}).fields([{ name: "imagem", maxCount: 1 }, { name: "video", maxCount: 1 }]);

module.exports = upload;
