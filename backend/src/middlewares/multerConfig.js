//src\middlewares\multerConfig.js
const multer = require("multer");
const path = require("path");

// Configuração do armazenamento dos arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "public/uploads"; // Diretório padrão

    if (file.mimetype.startsWith("image/")) {
      folder = "public/uploads/images";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "public/uploads/videos";
    }

    cb(null, path.join(__dirname, "..", folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `produto-${uniqueSuffix}${ext}`);
  },
});

// Filtro para tipos de arquivos aceitos (imagem ou vídeo) – independente do nome do campo
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos de imagem ou vídeo são permitidos"), false);
  }
};

// Configuração do Multer para aceitar qualquer campo de arquivo
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limite de 50MB
});

module.exports = upload;
