import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { TtsService } from "./tts-service";
import { saveUploadedFile } from "./utils/file-utils";
import { processVoiceCloning } from "@shared/schema";

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max file size
  },
});

// Create a directory for uploads if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a directory for outputs if it doesn't exist
const outputsDir = path.join(__dirname, "outputs");
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize TTS service
  const ttsService = new TtsService();

  // API route for voice cloning
  app.post("/api/tts/clone", async (req, res) => {
    try {
      const validatedData = processVoiceCloning.parse(req.body);
      
      // Decode base64 audio to file
      const audioFilePath = await saveUploadedFile(
        validatedData.audioBase64,
        uploadsDir,
        "reference_audio.wav"
      );
      
      // Generate a unique output filename
      const outputFilename = `output_${Date.now()}.wav`;
      const outputPath = path.join(outputsDir, outputFilename);
      
      // Process the voice cloning request
      const result = await ttsService.cloneVoice({
        audioFilePath,
        referenceText: validatedData.referenceText || "",
        generationText: validatedData.generationText,
        language: validatedData.language,
        speed: validatedData.speed,
        outputPath,
      });
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }
      
      // Send the generated audio file
      res.sendFile(outputPath);
    } catch (error) {
      console.error("Voice cloning error:", error);
      
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
