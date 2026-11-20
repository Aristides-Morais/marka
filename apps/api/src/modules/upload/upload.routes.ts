import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const uploadRouter = Router();

const dir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype));
  },
});

uploadRouter.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { message: "Ficheiro em falta ou inválido" } });
  }
  const base = process.env.PUBLIC_API_URL || "https://marka-api-45bz.onrender.com";
  res.json({ url: `${base}/uploads/${req.file.filename}` });
});