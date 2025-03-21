import fs from "fs";
import path from "path";
import { promisify } from "util";
import { randomBytes } from "crypto";

const writeFileAsync = promisify(fs.writeFile);

/**
 * Saves a base64 encoded file to disk
 * @param base64Data - Base64 encoded file data
 * @param directory - Directory to save the file
 * @param filename - Filename to use (optional)
 * @returns Path to the saved file
 */
export async function saveUploadedFile(
  base64Data: string,
  directory: string,
  filename?: string
): Promise<string> {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Generate random filename if not provided
    if (!filename) {
      const randomId = randomBytes(8).toString("hex");
      filename = `upload_${randomId}.wav`;
    }
    
    // Create buffer from base64
    const buffer = Buffer.from(base64Data, "base64");
    
    // Save file
    const filePath = path.join(directory, filename);
    await writeFileAsync(filePath, buffer);
    
    return filePath;
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Failed to save uploaded file");
  }
}

/**
 * Removes a file if it exists
 * @param filePath - Path to the file to remove
 */
export async function removeFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error removing file:", error);
  }
}
