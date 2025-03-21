import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { AnimatedCard } from "@/components/ui/animated-card";
import { FileUpload } from "@/components/ui/file-upload";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/ui/waveform";
import { AudioPlayer } from "@/components/ui/audio-player";
import { fileToBase64, isValidAudioFile } from "@/lib/audio-utils";

// Define the form schema
const voiceCloningSchema = z.object({
  language: z.enum(["english", "hindi"]),
  referenceText: z.string().optional().refine(
    (text, ctx) => {
      // Reference text is required for Hindi
      if (ctx.path[0] === "hindi" && (!text || text.trim() === "")) {
        return false;
      }
      return true;
    },
    { message: "Reference text is required for Hindi language" }
  ),
  generationText: z.string().min(1, { message: "Text to generate is required" }),
  speed: z.number().min(0.5).max(2).default(1.0),
});

type VoiceCloningValues = z.infer<typeof voiceCloningSchema>;

export default function VoiceCloning() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewVisible, setAudioPreviewVisible] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [commandPreview, setCommandPreview] = useState("");
  const { toast } = useToast();

  // Form setup
  const form = useForm<VoiceCloningValues>({
    resolver: zodResolver(voiceCloningSchema),
    defaultValues: {
      language: "english",
      referenceText: "",
      generationText: "",
      speed: 1.0,
    }
  });

  // Update command preview
  useEffect(() => {
    const values = form.getValues();
    const model = values.language === "english" ? "F5-TTS" : "F5-TTS-small";
    const fileName = audioFile ? audioFile.name : "uploaded_audio.wav";
    const refText = values.referenceText || "\"The content, subtitle or transcription of reference audio.\"";
    const genText = values.generationText || "\"Some text you want TTS model generate for you.\"";
    const speed = values.speed;
    
    setCommandPreview(
      `f5-tts_infer-cli --model ${model} --ref_audio "${fileName}" --ref_text ${refText} --gen_text ${genText} --speed ${speed}`
    );
  }, [form.watch(), audioFile]);

  // Handle audio file upload
  const handleFileChange = async (file: File) => {
    const valid = await isValidAudioFile(file, 15);
    if (!valid) {
      toast({
        title: "Invalid audio file",
        description: "Audio must be less than 15 seconds",
        variant: "destructive",
      });
      return;
    }
    
    setAudioFile(file);
    setAudioPreviewVisible(true);
  };

  // Mutation for voice generation
  const generateMutation = useMutation({
    mutationFn: async (data: VoiceCloningValues & { audioBase64: string }) => {
      const response = await apiRequest("POST", "/api/tts/clone", data);
      const audioBuffer = await response.arrayBuffer();
      return audioBuffer;
    },
    onSuccess: (audioBuffer) => {
      // Create a blob URL from the audio buffer
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);
      
      toast({
        title: "Voice Generated",
        description: "Your cloned voice is ready to play!",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = async (values: VoiceCloningValues) => {
    if (!audioFile) {
      toast({
        title: "Missing Audio",
        description: "Please upload a reference audio file",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const audioBase64 = await fileToBase64(audioFile);
      generateMutation.mutate({ ...values, audioBase64 });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process audio file",
        variant: "destructive",
      });
    }
  };

  // Reset the generation
  const handleReset = () => {
    setGeneratedAudioUrl(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-orbitron font-bold mb-6 text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6C63FF] to-[#00D1FF]">Voice Cloning</span>
      </h1>
      
      <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
        Clone any voice with our advanced F5-TTS technology. Upload a reference audio, provide the text, and generate speech in the same voice.
      </p>

      {!generatedAudioUrl ? (
        <div className="glass-effect rounded-2xl p-6 md:p-8 glow-border mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Language Selection */}
              <AnimatedCard>
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Select Language</FormLabel>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div 
                          className={`bg-dark-lighter rounded-lg p-4 relative cursor-pointer border ${field.value === "english" ? "border-[#6C63FF]" : "border-transparent"}`}
                          onClick={() => form.setValue("language", "english")}
                        >
                          <div className="flex items-center">
                            <span className={`w-4 h-4 mr-2 rounded-full border border-[#6C63FF] flex items-center justify-center`}>
                              <span className={`w-2 h-2 rounded-full ${field.value === "english" ? "bg-[#6C63FF]" : ""}`}></span>
                            </span>
                            English (F5-TTS)
                          </div>
                        </div>
                        <div 
                          className={`bg-dark-lighter rounded-lg p-4 relative cursor-pointer border ${field.value === "hindi" ? "border-[#6C63FF]" : "border-transparent"}`}
                          onClick={() => form.setValue("language", "hindi")}
                        >
                          <div className="flex items-center">
                            <span className={`w-4 h-4 mr-2 rounded-full border border-[#6C63FF] flex items-center justify-center`}>
                              <span className={`w-2 h-2 rounded-full ${field.value === "hindi" ? "bg-[#6C63FF]" : ""}`}></span>
                            </span>
                            Hindi (F5-TTS-small)
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </AnimatedCard>
              
              {/* Audio Upload */}
              <AnimatedCard>
                <FileUpload onFileChange={handleFileChange} />
                
                {audioPreviewVisible && (
                  <div className="mt-4">
                    <Waveform audioUrl={audioFile ? URL.createObjectURL(audioFile) : undefined} />
                    <div className="flex justify-between items-center mt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="bg-dark-lighter hover:bg-dark-accent rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </Button>
                      <span className="text-sm text-gray-400">Audio uploaded</span>
                    </div>
                  </div>
                )}
              </AnimatedCard>
              
              {/* Reference Text */}
              <AnimatedCard>
                <FormField
                  control={form.control}
                  name="referenceText"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-gray-200">Reference Text</FormLabel>
                        {form.watch("language") === "hindi" && (
                          <span className="text-sm font-medium text-gray-400">(Required for Hindi)</span>
                        )}
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the transcript of your reference audio" 
                          className="bg-dark-lighter border-dark-accent input-glow focus:border-primary resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        For best results, enter the exact transcript of your reference audio
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </AnimatedCard>
              
              {/* Generation Text */}
              <AnimatedCard>
                <FormField
                  control={form.control}
                  name="generationText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Text to Generate</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the text you want to convert to speech" 
                          className="bg-dark-lighter border-dark-accent input-glow focus:border-primary resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </AnimatedCard>
              
              {/* Speed Control */}
              <AnimatedCard>
                <FormField
                  control={form.control}
                  name="speed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 block mb-4">Speed Adjustment</FormLabel>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">0.5x</span>
                        <div className="flex-1">
                          <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            className="w-full"
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </div>
                        <span className="text-sm text-gray-400">2.0x</span>
                        <span className="w-12 text-center font-medium text-[#6C63FF]">{field.value}x</span>
                      </div>
                    </FormItem>
                  )}
                />
              </AnimatedCard>
              
              {/* Generate Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#00D1FF] text-white font-bold py-4 px-6 rounded-xl transition-all hover:opacity-90 animate-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 font-orbitron"
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'GENERATING...' : 'GENERATE VOICE'}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className="glass-effect rounded-2xl p-6 md:p-8 glow-border mt-10">
          <h2 className="text-2xl font-orbitron font-bold mb-4">Generated Audio</h2>
          <div className="bg-dark-surface rounded-xl p-5 border border-dark-lighter">
            <AudioPlayer audioUrl={generatedAudioUrl} allowDownload onBack={handleReset} />
          </div>
        </div>
      )}
      
      {/* Command Preview */}
      <div className="mt-16 glass-effect rounded-2xl p-6 glow-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron font-bold text-lg">Command Preview</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#00D1FF] hover:text-[#6C63FF] transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(commandPreview);
              toast({
                title: "Copied",
                description: "Command copied to clipboard",
              });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Command
          </Button>
        </div>
        <div className="bg-dark-surface rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <code className="text-gray-300">
            <span className="text-[#00D1FF]">{commandPreview.split(' ')[0]}</span> 
            {commandPreview.split(' ').slice(1).join(' ').split('--').map((part, index) => {
              if (index === 0) return ' ';
              const paramName = part.split(' ')[0];
              const paramValue = part.substring(paramName.length + 1);
              return (
                <span key={index}>
                  <span className="text-[#6C63FF]">--{paramName}</span> 
                  {paramValue}
                </span>
              );
            })}
          </code>
        </div>
        <p className="text-xs text-gray-500 mt-2">This is the CLI command that will be executed on our servers.</p>
      </div>
      
      {/* Loading Overlay */}
      {generateMutation.isPending && (
        <div className="fixed inset-0 bg-dark-surface bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-[#6C63FF] border-r-[#00D1FF] border-b-[#6C63FF] border-l-[#00D1FF] rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-orbitron text-xl">Processing...</p>
            <p className="text-gray-400 mt-2">Generating voice with F5-TTS model</p>
          </div>
        </div>
      )}
    </div>
  );
}
