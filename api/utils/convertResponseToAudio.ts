import { ElevenLabsClient, play } from "elevenlabs";
import fs from "fs";

const voice = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
});

const convertResponseToAudio = async (text: string) => {
  try {
    const fileName = `${Date.now()}.mp3`;

    // Using "Rachel" voice ID which is a default voice
    const audioFile = await voice.generate({
      text,
      voice: "htzOzB5OEdUz6rqw1dez",
    });

    // Convert the readable stream to a buffer before writing
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioFile) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Ensure the directory exists
    const dir = "./public/audio";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dir + "/" + fileName, buffer);
    return fileName;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};

export default convertResponseToAudio;
