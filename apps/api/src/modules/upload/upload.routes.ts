import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

export const uploadRouter = Router();

// Configura o Cloudinary com as tuas chaves
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Guarda a imagem em memória antes de enviar para a nuvem
const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada." });

    // Converte o ficheiro para Base64 para enviar para o Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "marka_produtos",
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Erro no upload da imagem:", error);
    next(error);
  }
});