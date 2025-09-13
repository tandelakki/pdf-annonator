import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import pdfRoutes from './routes/pdfs.js';
import highlightRoutes from './routes/highlights.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ensure upload dir exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// connect mongo
mongoose.connect(process.env.MONGODB_URI)
  .then(()=> console.log('Connected to MongoDB'))
  .catch(err => { console.error(err); process.exit(1) });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/highlights', highlightRoutes);

// serve uploaded pdfs statically under /uploads (optional)
app.use('/uploads', express.static(UPLOAD_DIR));

app.listen(PORT, ()=> console.log(`Server listening on port ${PORT}`));
