// server/tts-service.ts
import { exec } from "child_process";
import path from "path";
import util from "util";


const execPromise = util.promisify(exec);

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
   * It uses the --output_dir and --output_file flags to specify where the generated file is saved.
   */
  async cloneVoice({
    audioFilePath,
    language,
    generationText,
    speed,
    referenceText = "",
  }: CloneVoiceParams): Promise<{ success: boolean; error?: string; outputPath?: string }> {
    try {
      // Select the model based on language:
      // If language is Hindi, use "F5-TTS-small", otherwise "F5TTS_v1_Base"
      const model = language.toLowerCase() === "hindi" ? "F5-TTS-small" : "F5-TTS";
      const cleanRefText = referenceText.replace(/\n/g, " ").trim();
      const cleanGenText = generationText.replace(/\n/g, " ").trim();

      // Build the command string.
      // Note: if any parameter might include quotes or special characters, additional escaping might be necessary.
      const cmd = `f5-tts_infer-cli --model "${model}" --ref_audio "${audioFilePath}" --gen_text "${cleanGenText}" --ref_text "${cleanRefText}" --speed "${speed}"`;

      console.log("Executing command:", cmd);

      // Execute the command with environment variable set for UTF-8 encoding
      const { stdout, stderr } = await execPromise(cmd, {
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });
      
      console.log("Command stdout:", stdout);
      if (stderr) {
        console.error("Command stderr:", stderr);
      }
      
      // Construct the output path
      const outputPath ="C:\\Users\\jigya\\OneDrive\\Desktop\\Jigyasu\\voice generator\\hindi\\VoiceCloneCLI\\VoiceCloneCLI\\tests\\infer_cli_out.wav";
      
      return { success: true, outputPath };
    } catch (error) {
      console.error("TTS Service error:", error);
      return { success: false, error: (error as Error).message };
    }
  }
}
