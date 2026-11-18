import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

export const uploadRouter = Router();

// Garante que a pasta de uploads existe
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de onde e como a imagem é guardada
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gera um nome único para não haver conflitos
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Rota que recebe a imagem
uploadRouter.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhuma imagem enviada." });
  }
  
  // Devolve o link da imagem para o frontend guardar no Produto
  const imageUrl = `http://localhost:4001/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});