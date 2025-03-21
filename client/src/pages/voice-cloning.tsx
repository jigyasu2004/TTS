import { useState } from "react";
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
import { fileToBase64, isValidAudioFile, createAudioBlobUrl } from "@/lib/audio-utils";

// Define the form schema
const voiceCloningSchema = z.object({
  language: z.enum(["english", "hindi"]),
  referenceText: z.string().optional(),
  generationText: z.string().min(1, { message: "Text to generate is required" }),
  speed: z.number().min(0.5).max(2).default(1.0),
}).refine(
  (data) => {
    // Reference text is required for Hindi
    if (data.language === "hindi" && (!data.referenceText || data.referenceText.trim() === "")) {
      return false;
    }
    return true;
  },
  {
    message: "Reference text is required for Hindi language",
    path: ["referenceText"]
  }
);

type VoiceCloningValues = z.infer<typeof voiceCloningSchema>;

export default function VoiceCloning() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewVisible, setAudioPreviewVisible] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedAudioBuffer, setGeneratedAudioBuffer] = useState<ArrayBuffer | null>(null);
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

  // Watch language change to enforce Hindi validation
  const selectedLanguage = form.watch("language");
  
  // Debug language changes
  console.log("Current language:", selectedLanguage);

  // Handle audio file upload
  const handleFileChange = async (file: File) => {
    try {
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
      
      toast({
        title: "File Uploaded",
        description: "Audio file uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Could not process the audio file",
        variant: "destructive",
      });
    }
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
      setGeneratedAudioBuffer(audioBuffer);
      
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
    setGeneratedAudioBuffer(null);
  };

  // Download the generated audio
  const handleDownload = () => {
    if (!generatedAudioBuffer) return;
    
    const blob = new Blob([generatedAudioBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_voice_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Your audio file is being downloaded",
    });
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
                        <button 
                          type="button"
                          className={`bg-gray-900 rounded-lg p-4 relative cursor-pointer border-2 ${field.value === "english" ? "border-[#6C63FF]" : "border-gray-800"} text-left w-full`}
                          onClick={() => {
                            field.onChange("english");
                            form.setValue("language", "english", { 
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true 
                            });
                          }}
                        >
                          <div className="flex items-center">
                            <span className={`w-4 h-4 mr-2 rounded-full border-2 border-[#6C63FF] flex items-center justify-center`}>
                              <span className={`w-2 h-2 rounded-full ${field.value === "english" ? "bg-[#6C63FF]" : ""}`}></span>
                            </span>
                            English (F5-TTS)
                          </div>
                        </button>
                        <button 
                          type="button"
                          className={`bg-gray-900 rounded-lg p-4 relative cursor-pointer border-2 ${field.value === "hindi" ? "border-[#6C63FF]" : "border-gray-800"} text-left w-full`}
                          onClick={() => {
                            field.onChange("hindi");
                            form.setValue("language", "hindi", { 
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true 
                            });
                          }}
                        >
                          <div className="flex items-center">
                            <span className={`w-4 h-4 mr-2 rounded-full border-2 border-[#6C63FF] flex items-center justify-center`}>
                              <span className={`w-2 h-2 rounded-full ${field.value === "hindi" ? "bg-[#6C63FF]" : ""}`}></span>
                            </span>
                            Hindi (F5-TTS-small)
                          </div>
                        </button>
                      </div>
                    </FormItem>
                  )}
                />
              </AnimatedCard>
              
              {/* Audio Upload */}
              <AnimatedCard>
                <FileUpload 
                  onFileChange={handleFileChange} 
                  accept="audio/*"
                  label="Upload Reference Audio"
                  sublabel="Upload a clear voice sample (max 15 seconds)"
                />
                
                {audioPreviewVisible && (
                  <div className="mt-4">
                    <Waveform audioUrl={audioFile ? URL.createObjectURL(audioFile) : undefined} isPlaying={false} />
                    <div className="flex justify-between items-center mt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </Button>
                      <span className="text-sm text-gray-400">Reference audio ready</span>
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
                        {selectedLanguage === "hindi" && (
                          <span className="text-sm font-medium text-red-400">* Required for Hindi</span>
                        )}
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the transcript of your reference audio" 
                          className="bg-gray-900 border-gray-700 focus:border-[#6C63FF] resize-none"
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
                          className="bg-gray-900 border-gray-700 focus:border-[#6C63FF] resize-none"
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
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <AudioPlayer audioUrl={generatedAudioUrl} allowDownload onBack={handleReset} />
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleDownload}
                className="bg-gradient-to-r from-[#6C63FF] to-[#00D1FF] text-white font-bold py-3 px-6 rounded-lg transition-all hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Audio
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              Generate Another
            </Button>
          </div>
        </div>
      )}
      
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
