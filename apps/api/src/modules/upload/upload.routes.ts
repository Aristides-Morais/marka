import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

export const uploadRouter = Router();

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Guarda a imagem na memória temporariamente
const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada." });

    // Envia para o Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "marka_uploads", // Cria uma pasta na tua conta Cloudinary
    });

    res.json({ url: result.secure_url }); // Devolve o link da imagem
  } catch (error) {
    next(error);
  }
});