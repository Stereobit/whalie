interface AudioResponse {
  success: boolean;
  transcription?: string;
  aiResponse?: string;
  audioFile?: string;
  error?: string;
}

const API_BASE_URL = "http://localhost:3000";

export const processText = async (text: string): Promise<AudioResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/process-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  return response.json();
};

export const processAudio = async (audioBlob: Blob): Promise<AudioResponse> => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");

  const response = await fetch(`${API_BASE_URL}/api/process-audio`, {
    method: "POST",
    body: formData,
  });
  return response.json();
};

export const playAudioResponse = async (audioFile: string): Promise<void> => {
  const audio = new Audio(`${API_BASE_URL}/audio/${audioFile}`);
  await audio.play();
};
