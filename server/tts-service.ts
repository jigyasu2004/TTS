// server/tts-service.ts
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CloneVoiceParams {
  audioFilePath: string;
  language: string;
  generationText: string;
  speed: number;
  referenceText?: string;
}

export class TtsService {
  /**
   * cloneVoice executes the f5-tts_infer-cli command with the provided parameters.
   * It continuously streams stdout and stderr to the console as the command executes.
   */
  async cloneVoice({
    audioFilePath,
    language,
    generationText,
    speed,
    referenceText = "",
  }: CloneVoiceParams): Promise<{ success: boolean; error?: string; outputPath?: string }> {
    return new Promise((resolve) => {
      // Select the model based on language:
      // If language is Hindi, use "F5-TTS-small", otherwise "F5-TTS"
      const model = language.toLowerCase() === "hindi" ? "F5-TTS-small" : "F5-TTS";
      const cleanRefText = referenceText.replace(/\n/g, " ").trim();
      const cleanGenText = generationText.replace(/\n/g, " ").trim();

      // Prepare command arguments
      const args = [
        "--model", model,
        "--ref_audio", audioFilePath,
        "--gen_text", cleanGenText,
        "--ref_text", cleanRefText,
        "--speed", speed.toString()
      ];

      console.log("Executing command: f5-tts_infer-cli", args.join(" "));

      // Spawn the command with UTF-8 encoding for the output
      const child = spawn("f5-tts_infer-cli", args, {
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });

      // Stream the stdout data continuously
      child.stdout.on("data", (data: Buffer) => {
        process.stdout.write(data.toString());
      });

      // Stream the stderr data continuously
      child.stderr.on("data", (data: Buffer) => {
        process.stderr.write(data.toString());
      });

      // Listen for the process to complete
      child.on("close", (code) => {
        if (code === 0) {
          // Build an absolute path for the output file relative to the current file
          const outputPath = join(__dirname, "../tests/infer_cli_out.wav");
          resolve({ success: true, outputPath });
        } else {
          resolve({ success: false, error: `Process exited with code ${code}` });
        }
      });

      // Handle error if spawn fails
      child.on("error", (error) => {
        console.error("TTS Service error:", error);
        resolve({ success: false, error: error.message });
      });
    });
  }
}
