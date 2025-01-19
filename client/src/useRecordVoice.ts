import { useEffect, useState, useRef } from "react";

interface AudioResponse {
  success: boolean;
  transcription?: string;
  aiResponse?: string;
  audioFile?: string;
  error?: string;
}

// Helper function to convert audio buffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const result = new Int16Array(length);
  let offset = 0;
  const channels: Float32Array[] = [];

  // Extract channels
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  // Interleave channels and convert to 16-bit PCM
  while (offset < length) {
    for (let i = 0; i < numOfChan; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset / numOfChan]));
      result[offset++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
  }

  // Create WAV file
  const buffer1 = new ArrayBuffer(44 + result.length * 2);
  const view = new DataView(buffer1);
  const sampleRate = buffer.sampleRate;

  // Write WAV header
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + result.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2 * numOfChan, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, result.length * 2, true);

  const typedArray = new Int16Array(buffer1, 44, result.length);
  typedArray.set(result);

  return new Blob([buffer1], { type: "audio/wav" });
};

export const useRecordVoice = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const chunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const initialMediaRecorder = (stream: MediaStream) => {
    // Initialize AudioContext
    audioContext.current = new AudioContext();
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (ev: BlobEvent) => {
      chunks.current.push(ev.data);
    };

    mediaRecorder.onstop = async () => {
      setProcessing(true);
      try {
        // Convert recorded audio to WAV
        const blob = new Blob(chunks.current);
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.current!.decodeAudioData(
          arrayBuffer
        );
        const wavBlob = audioBufferToWav(audioBuffer);
        const formData = new FormData();
        formData.append("audio", wavBlob, "recording.wav");

        // Send to API
        const response = await fetch(
          "http://localhost:3000/api/process-audio",
          {
            method: "POST",
            body: formData,
          }
        );

        const data: AudioResponse = await response.json();

        if (data.success && data.audioFile) {
          const audio = new Audio(
            "http://localhost:3000/audio/" + data.audioFile
          );
          await audio.play();
        }
      } catch (error) {
        console.error("Error processing audio request");
      } finally {
        setProcessing(false);
      }
    };

    setMediaRecorder(mediaRecorder);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder)
        .catch((err) => console.error("Error accessing microphone:", err));
    }

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  return { recording, processing, startRecording, stopRecording };
};
