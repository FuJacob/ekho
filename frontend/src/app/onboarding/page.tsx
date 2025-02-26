"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("record");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const router = useRouter();

  const handleNextStep = () => {
    setStep(2);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRecordedBlob(file);
    }
  };

  const handleSubmit = async () => {
    if (!recordedBlob) {
      alert("Please provide both your voice recording");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", recordedBlob, ".wav");
      formData.append("name", name);

      const response = await fetch("http://localhost:5500/api/clone-voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      const responseData = await response.json();

      await fetch("http://localhost:5500/api/selected-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId: responseData.voiceId }),
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Failed to upload audio. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center text-center justify-center">
      <div className="space-y-6">
        <h1 className="text-7xl font-bold">Ekho</h1>
        <div className="mb-2">
          <p className="text-lg">Let's begin by cloning your voice.</p>
        </div>
        {step === 1 && (
          <div>
            <Button onClick={handleNextStep}>Next</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-4">
              Record your voice to create a custom cloned voice model
            </div>

            <div className="mb-4">
              <div className="flex mb-2">
                <button
                  onClick={() => setActiveTab("record")}
                  className={`flex-1 p-2 ${
                    activeTab === "record" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  Record Voice
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 p-2 ${
                    activeTab === "upload" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  Upload Audio
                </button>
              </div>

              {activeTab === "record" && (
                <div>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full p-2 mb-4 ${
                      isRecording ? "bg-red-600" : "bg-blue-600"
                    } text-white rounded`}
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </button>
                  {recordedBlob && !isRecording && (
                    <audio
                      src={URL.createObjectURL(recordedBlob)}
                      controls
                      className="w-full"
                    />
                  )}
                </div>
              )}

              {activeTab === "upload" && (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-500">
                      Upload audio file (MP3, WAV)
                    </p>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                  </div>
                  {recordedBlob && (
                    <audio
                      src={URL.createObjectURL(recordedBlob)}
                      controls
                      className="w-full mt-4"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="w-full p-2 bg-gray-200 rounded"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!recordedBlob}
                className={`w-full p-2 ${
                  !recordedBlob ? "bg-gray-400" : "bg-blue-600"
                } text-white rounded`}
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
