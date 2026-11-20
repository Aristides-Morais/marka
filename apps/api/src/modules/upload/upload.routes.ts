import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

export const uploadRouter = Router();

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

uploadRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: { message: "Nenhuma imagem enviada." } });
    // O Render serve isto em https://marka-api-45bz.onrender.com/uploads/nome.jpg
    const url = `/uploads/${req.file.filename}`;
    // Se o frontend precisar de URL completa, ele junta com a base
    res.json({ url });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: { message: "Erro ao enviar imagem" } });
  }
});