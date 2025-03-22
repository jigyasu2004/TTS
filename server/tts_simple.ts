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

        // Generate paths
        const langCode = language === 'english' ? 'a' : 'h';
        const voice_filter = voice.split(" ")[0];
        const generationText = gene_Text.replace(/\n/g, " ");

        let gender;
        console.log(voice)
        if (["heart", "bella", "alpha", "beta"].includes(voice_filter)) {
            gender = 'f';
        } else {
            gender = 'm';
        }

        const voiceCode = `${langCode}${gender}_${voice_filter}`;
        const outputFileName = `${uuidv4()}.wav`;
        outputPath = path.join(__dirname, '../output', outputFileName);

        // Create the full command string for logging
        const command = `python ./scripts/generate_tts.py --lang ${langCode} ` +
            `--text "${generationText}" --voice ${voiceCode} ` +
            `--speed ${speed} --output "${outputPath}"`;

        console.log('\n[Executing command]:', command);

        // Execute Python script
        const pythonProcess = spawn('python', [
            path.join(__dirname, './scripts/generate_tts.py'),
            '--lang', langCode,
            '--text', generationText,
            '--voice', voiceCode,
            '--speed', speed.toString(),
            '--output', outputPath
        ]);
        

        // Capture output

        let pythonOutput = '';
        let pythonError = '';

        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
            console.log(`[Python stdout]: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            pythonError += data.toString();
            console.error(`[Python stderr]: ${data}`);
        });

        // Wait for process completion
        const exitCode = await new Promise((resolve) => {
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

        // Send and clean up
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