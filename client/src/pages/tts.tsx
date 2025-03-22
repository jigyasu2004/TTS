import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

import { AnimatedCard } from "@/components/ui/animated-card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";

const englishVoices = ["heart (female)", "bella (female)", "adam (male)", "echo (male)"];
const hindiVoices = ["alpha (female)", "beta (female)", "omega (male)", "psi (male)"];

const voiceCloningSchema = z
  .object({
    language: z.enum(["english", "hindi"]),
    voice: z.enum([...englishVoices, ...hindiVoices] as [string, ...string[]]),
    generationText: z.string().min(1, { message: "Text to generate is required" }),
    speed: z.number().min(0.5).max(2).default(1.0),
  })
  .superRefine((values, ctx) => {
    if (values.language === "english" && !englishVoices.includes(values.voice)) {
      ctx.addIssue({
        code: "custom",
        path: ["voice"],
        message: "Invalid voice for English language",
      });
    }
    if (values.language === "hindi" && !hindiVoices.includes(values.voice)) {
      ctx.addIssue({
        code: "custom",
        path: ["voice"],
        message: "Invalid voice for Hindi language",
      });
    }
  });

type VoiceCloningValues = z.infer<typeof voiceCloningSchema>;

export default function VoiceCloning() {
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedAudioBuffer, setGeneratedAudioBuffer] = useState<ArrayBuffer | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<VoiceCloningValues>({
    resolver: zodResolver(voiceCloningSchema),
    defaultValues: {
      language: "english",
      voice: "heart (female)",
      generationText: "",
      speed: 1.0,
    },
  });

  const selectedLanguage = form.watch("language");

  useEffect(() => {
    if (selectedLanguage === "hindi") {
      form.setValue("voice", hindiVoices[0]);
    } else {
      form.setValue("voice", englishVoices[0]);
    }
  }, [selectedLanguage, form]);

  const generateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/tts/simple", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to generate audio");
      }

      return response.arrayBuffer();
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (audioBuffer) => {
      const blob = new Blob([audioBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);
      setGeneratedAudioBuffer(audioBuffer);
      setIsLoading(false);

      toast({
        title: "Voice Generated",
        description: "Your cloned voice is ready to play!",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: VoiceCloningValues) => {
    const formData = new FormData();
    formData.append("language", values.language);
    formData.append("voice", values.voice);
    formData.append("gen_text", values.generationText);
    formData.append("speed", values.speed.toString());

    // Save the input text to display later
    setGeneratedText(values.generationText);

    generateMutation.mutate(formData);
  };

  const handleReset = () => {
    setGeneratedAudioUrl(null);
    setGeneratedAudioBuffer(null);
    setGeneratedText(null);
  };

  const handleDownload = () => {
    if (!generatedAudioBuffer) return;

    const blob = new Blob([generatedAudioBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
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
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6C63FF] to-[#00D1FF]">
          Text To Speech
        </span>
      </h1>

      {!generatedAudioUrl ? (
        <div className="glass-effect rounded-2xl p-6 md:p-8 glow-border mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AnimatedCard>
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Select Language</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="bg-gray-900 border-gray-700 focus:border-[#6C63FF] text-white p-2 rounded-md w-full"
                        >
                          <option value="english">English</option>
                          <option value="hindi">Hindi</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </AnimatedCard>

              <AnimatedCard>
                <FormField
                  control={form.control}
                  name="voice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Select Voice</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="bg-gray-900 border-gray-700 focus:border-[#6C63FF] text-white p-2 rounded-md w-full"
                        >
                          {(selectedLanguage === "hindi" ? hindiVoices : englishVoices).map((voice) => (
                            <option key={voice} value={voice}>
                              {voice.charAt(0).toUpperCase() + voice.slice(1)}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </AnimatedCard>

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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#00D1FF] text-white font-bold py-4 px-6 rounded-xl transition-all hover:opacity-90 animate-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 font-orbitron"
                disabled={generateMutation.isPending || isLoading}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <span className="loader mr-2"></span> GENERATING...
                  </div>
                ) : (
                  "GENERATE VOICE"
                )}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className="glass-effect rounded-2xl p-6 md:p-8 glow-border mt-10">
          <h2 className="text-2xl font-orbitron font-bold mb-4">Generated Audio</h2>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <AudioPlayer
              audioUrl={generatedAudioUrl!}
              allowDownload
              onBack={handleReset}
            />
            {/* Section to display the text used for generation */}
            {generatedText && (
              <div className="mt-6 p-4 bg-gray-800 rounded-md">
                <h1 className="text-sm font-semibold text-white mb-1">Text Used for Generation:</h1>
                <p className="text-gray-300 text-xs">{generatedText}</p>
              </div>
            )}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-[#6C63FF] to-[#00D1FF] text-white font-bold py-3 px-6 rounded-lg transition-all hover:opacity-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
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
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-500 ease-in-out">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-[#6C63FF] border-r-[#00D1FF] border-b-[#6C63FF] border-l-[#00D1FF] rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-orbitron text-xl text-white">Processing...</p>
            <p className="text-gray-400 mt-2">Generating voice</p>
          </div>
        </div>
      )}
    </div>
  );
}
