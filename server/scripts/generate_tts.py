import argparse
from kokoro import KPipeline
import soundfile as sf

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--lang', type=str, required=True, help="Language code ('a' for English, 'b' for Hindi)")
    parser.add_argument('--text', type=str, required=True, help="Text to generate speech")
    parser.add_argument('--voice', type=str, required=True, help="Voice code (e.g., 'af_heart')")
    parser.add_argument('--speed', type=float, required=True, help="Speed multiplier (0.5-2.0)")
    parser.add_argument('--output', type=str, required=True, help="Output .wav file path")
    args = parser.parse_args()

    pipeline = KPipeline(args.lang)
    generator = pipeline(args.text, args.voice, args.speed)
    
    # Process the first generated audio segment
    for _, _, audio in generator:
        sf.write(args.output, audio, 24000)
        break  # Exit after first segment

if __name__ == "__main__":
    main()