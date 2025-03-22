import { Router } from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Add ES module-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const upload = multer();

router.post('/api/tts/simple', upload.none(), async (req, res) => {
    let outputPath = '';
    try {
        const { language, voice, gen_text: gene_Text, speed } = req.body;

        // ... (keep existing validation code) ...

        // Generate paths and prepare parameters
        const langCode = language === 'english' ? 'a' : 'h';
        const voice_filter = voice.split(" ")[0];
        const generationText = gene_Text.replace(/\n/g, " ");

        let gender;
        console.log(voice);
        if (["heart", "bella", "alpha", "beta"].includes(voice_filter)) {
            gender = 'f';
        } else {
            gender = 'm';
        }

        const voiceCode = `${langCode}${gender}_${voice_filter}`;
        const outputFileName = `${uuidv4()}.wav`;
        outputPath = path.join(__dirname, '../output', outputFileName);

        // Log the full command for debugging
        const command = `python ${path.join(__dirname, './scripts/generate_tts.py')} --lang ${langCode} ` +
            `--text "${generationText}" --voice ${voiceCode} ` +
            `--speed ${speed} --output "${outputPath}"`;

        console.log('\n[Executing command]:', command);

        // Spawn the Python process
        const pythonProcess = spawn('python', [
            path.join(__dirname, './scripts/generate_tts.py'),
            '--lang', langCode,
            '--text', generationText,
            '--voice', voiceCode,
            '--speed', speed.toString(),
            '--output', outputPath
        ]);

        // Variables to accumulate process output (if needed for error reporting)
        let pythonOutput = '';
        let pythonError = '';

        // Stream stdout continuously to the console
        pythonProcess.stdout.on('data', (data) => {
            const text = data.toString();
            pythonOutput += text;
            process.stdout.write(text);
        });

        // Stream stderr continuously to the console
        pythonProcess.stderr.on('data', (data) => {
            const text = data.toString();
            pythonError += text;
            process.stderr.write(text);
        });

        // Wait for the process to complete
        const exitCode: number = await new Promise((resolve) => {
            pythonProcess.on('close', (code) => {
                console.log(`[Python process] exited with code ${code}`);
                resolve(code || 0);
            });
        });

        console.log('[Command output]:', {
            exitCode,
            stdout: pythonOutput,
            stderr: pythonError,
            outputPath
        });

        if (exitCode !== 0) {
            throw new Error(`TTS generation failed (code ${exitCode}): ${pythonError}`);
        }

        if (!fs.existsSync(outputPath)) {
            throw new Error('Generated audio file not found');
        }

        // Send the generated file and then clean up
        res.setHeader('Content-Type', 'audio/wav');
        res.sendFile(outputPath, (err) => {
            if (err) console.error('File send error:', err);
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
                console.log('Cleaned up temporary file:', outputPath);
            }
        });

    } catch (error) {
        console.error('Full error context:', {
            outputPath,
            error: error instanceof Error ? error.stack : error
        });

        // Cleanup on error
        if (outputPath && fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
});

export default router;
