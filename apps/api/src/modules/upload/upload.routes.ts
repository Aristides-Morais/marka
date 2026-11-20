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

// Aceita o ficheiro no campo "file" ou "image"
const receive = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

uploadRouter.post("/", requireAuth, receive, (req, res) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const file = files?.file?.[0] ?? files?.image?.[0];

  if (!file) {
    return res.status(400).json({ error: { message: "Ficheiro em falta ou inválido" } });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: `marka/${req.business!.slug}`, resource_type: "image" },
    (error, result) => {
      if (error || !result) {
        console.error("Erro no upload da imagem:", error);
        return res.status(500).json({ error: { message: "Erro ao enviar imagem" } });
      }
      // devolve nos dois formatos, para o frontend funcionar com qualquer um
      res.json({ url: result.secure_url, imageUrl: result.secure_url });
    }
  );
  stream.end(file.buffer);
});