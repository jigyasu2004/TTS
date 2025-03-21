import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const execAsync = promisify(exec);

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CloneVoiceParams {
  audioFilePath: string;
  referenceText: string;
  generationText: string;
  language: "english" | "hindi";
  speed: number;
  outputPath: string;
}

export interface CloneVoiceResult {
  success: boolean;
  error?: string;
  outputPath?: string;
}

export class TtsService {
  async cloneVoice({
    audioFilePath,
    referenceText,
    generationText,
    language,
    speed,
    outputPath,
  }: CloneVoiceParams): Promise<CloneVoiceResult> {
    try {
      // Determine the model based on language
      const model = language === "english" ? "F5-TTS" : "F5-TTS-small";
      
      // Build the command
      let command = `f5-tts_infer-cli --model ${model}`;
      command += ` --ref_audio "${audioFilePath}"`;
      
      // Add reference text if provided
      if (referenceText && referenceText.trim() !== "") {
        command += ` --ref_text "${referenceText}"`;
      }
      
      // Add generation text
      command += ` --gen_text "${generationText}"`;
      
      // Add speed parameter
      command += ` --speed ${speed}`;
      
      // Set the output path
      command += ` -o "${path.dirname(outputPath)}"`;
      command += ` -w "${path.basename(outputPath)}"`;
      
      console.log(`Executing command: ${command}`);
      
      // Execute the command
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !fs.existsSync(outputPath)) {
        console.error("Error in TTS command:", stderr);
        return { 
          success: false, 
          error: `Failed to generate audio: ${stderr}` 
        };
      }
      
      return { 
        success: true,
        outputPath
      };
    } catch (error) {
      console.error("TTS service error:", error);
      
      // For demo purposes, since we can't actually run the F5-TTS command,
      // we'll create a sample audio file as a placeholder
      const demoMode = process.env.DEMO_MODE === "true";
      if (demoMode) {
        // This is a fallback for demo purposes only
        const samplePath = path.join(__dirname, "sample.wav");
        if (fs.existsSync(samplePath)) {
          fs.copyFileSync(samplePath, outputPath);
          return { success: true, outputPath };
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }
}
