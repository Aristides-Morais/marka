import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const uploadRouter = Router();

// A biblioteca lê CLOUDINARY_URL sozinha
cloudinary.config({ secure: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype));
  },
});

uploadRouter.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { message: "Ficheiro em falta ou inválido" } });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: `marka/${req.business!.slug}`, resource_type: "image" },
    (error, result) => {
      if (error || !result) {
        console.error("Erro no upload da imagem:", error);
        return res.status(500).json({ error: { message: "Erro ao enviar imagem" } });
      }
      res.json({ url: result.secure_url });
    }
  );
  stream.end(req.file.buffer);
});