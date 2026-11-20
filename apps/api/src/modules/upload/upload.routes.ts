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
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

uploadRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: "Nenhuma imagem enviada." } });
    }
    // Devolve URL COMPLETA: https://marka-api-45bz.onrender.com/uploads/xxx.jpg
    // Assim passa na validação do logoUrl
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: { message: "Erro ao enviar imagem" } });
  }
});