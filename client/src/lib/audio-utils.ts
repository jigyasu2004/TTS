/**
 * Utility functions for audio processing
 */

/**
 * Creates an audio blob URL from an array buffer
 * @param arrayBuffer - The audio data as ArrayBuffer
 * @param mimeType - The MIME type of the audio
 * @returns A blob URL
 */
export function createAudioBlobUrl(arrayBuffer: ArrayBuffer, mimeType = 'audio/wav'): string {
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Checks if an audio file is valid and less than maxDuration
 * @param file - The audio file to check
 * @param maxDuration - Maximum duration in seconds (default 15s)
 * @returns Promise that resolves to a boolean
 */
export async function isValidAudioFile(file: File, maxDuration = 15): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(audio.duration <= maxDuration);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    });
    
    audio.src = objectUrl;
  });
}

/**
 * Converts a File to a Base64 string
 * @param file - The file to convert
 * @returns Promise that resolves to the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}
