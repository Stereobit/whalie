import voice from "elevenlabs-node";
import fs from "fs";

const convertResponseToAudio = async (text: string) => {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  const voiceID = "04sfw7YctY8FqVfgMEIt";
  const fileName = `${Date.now()}.mp3`;
  console.log("Converting response to audio...");
  const audioStream = await voice.textToSpeechStream(apiKey, voiceID, text);
  const fileWriteStream = fs.createWriteStream("./public/audio/" + fileName);
  audioStream.pipe(fileWriteStream);
  return new Promise((resolve, reject) => {
    fileWriteStream.on("finish", () => {
      console.log("Audio conversion done...");
      resolve(fileName);
    });
    audioStream.on("error", reject);
  });
};

export default convertResponseToAudio;
