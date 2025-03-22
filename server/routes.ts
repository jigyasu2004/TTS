import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { TtsService } from "./tts-service";

// Derive __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer to store files in the "uploads" directory
const upload = multer({ dest: "uploads/" });

// Ensure that the output directory exists
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize TTS service
  const ttsService = new TtsService();

  // API route for voice cloning (multipart/form-data)
  app.post("/api/tts/clone", upload.single("audio"), async (req, res) => {
    try {
      // Ensure the file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      // Extract additional form fields
      // Your client sends 'model' (either "F5-TTS" or "F5-TTS-small")
      // and 'gen_text', 'ref_text', and 'speed'
      const model = req.body.model;
      if (!model) {
        return res.status(400).json({ error: "Model is required" });
      }
      // Determine language from the model value
      const language = model === "F5-TTS" ? "english" : "hindi";

      const referenceText = req.body.ref_text || "";

      const generationText = req.body.gen_text;
      if (!generationText) {
        return res.status(400).json({ error: "Generation text is required" });
      }
      const speed = parseFloat(req.body.speed);
      if (isNaN(speed)) {
        return res.status(400).json({ error: "Speed is invalid" });
      }

      // // (Optional) Retrieve reference text if needed
      // const referenceText = req.body.ref_text || "";

      // Call TTS service to process the file (currently copies the file)
      const result = await ttsService.cloneVoice({
        audioFilePath: req.file.path,
        language,
        referenceText,
        generationText,
        speed,
      });

      if (!result.success || !result.outputPath) {
        return res.status(500).json({ error: result.error || "Voice cloning failed" });
      }

      // Return the stored audio file to the client
      res.sendFile(result.outputPath);
    } catch (error) {
      console.error("Voice cloning error:", error);
      res.status(500).json({ error: "An error occurred during voice cloning" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
