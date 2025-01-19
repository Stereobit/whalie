import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import convertResponseToAudio from "../../utils/convertResponseToAudio";
import { Fields, Files, formidable } from "formidable";
import fs from "fs";

// Configure API to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI();

// Helper function to handle file upload
const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable();
    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

// Helper function to transcribe audio using Whisper
const transcribeAudio = async (audioPath: string) => {
  // Check if file exists and is readable
  try {
    await fs.promises.access(audioPath, fs.constants.R_OK);
    const stats = await fs.promises.stat(audioPath);

    // Check if file is empty
    if (stats.size === 0) {
      throw new Error("Audio file is empty");
    }

    // Create a ReadStream with an explicit filename
    const audioStream = fs.createReadStream(audioPath);
    Object.defineProperty(audioStream, "name", {
      value: "audio.wav",
    });

    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
    });
    return transcriptionResponse.text;
  } catch (error) {
    throw error;
  }
};

// Helper function to get OpenAI response
const getOpenAIResponse = async (message: string) => {
  const chat = new ChatOpenAI();
  const response = await chat.call([
    new SystemMessage("You are a helpful voice assistant"),
    new HumanMessage(message),
  ]);
  return response.text;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse the incoming form data
    const { files } = await parseForm(req);
    const audioFile = files.audio?.[0];

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: "No audio file provided",
      });
    }

    // 1. Transcribe the audio using Whisper
    const transcription = await transcribeAudio(audioFile.filepath);

    // 2. Get OpenAI response using LangChain
    const aiResponse = await getOpenAIResponse(transcription);

    // 3. Convert response to audio using ElevenLabs
    const audioFileName = await convertResponseToAudio(aiResponse);

    // Return the results
    return res.status(200).json({
      success: true,
      transcription,
      aiResponse,
      audioFile: audioFileName,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error processing audio request",
    });
  }
}
