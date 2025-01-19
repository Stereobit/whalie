import { NextApiRequest, NextApiResponse } from "next";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import convertResponseToAudio from "../../utils/convertResponseToAudio";
import cors from "cors";
import { SYSTEM_PROMPT } from "../../utils/prompts";

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["POST"],
  credentials: true,
});

// Helper function to run middleware
const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Helper function to get OpenAI response
const getOpenAIResponse = async (message: string) => {
  const chat = new ChatOpenAI();
  const response = await chat.call([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(message),
  ]);
  return response.text;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run the CORS middleware
  await runMiddleware(req, res, corsMiddleware);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "No text provided",
      });
    }

    // Get OpenAI response using LangChain
    const aiResponse = await getOpenAIResponse(text);

    // Convert response to audio using ElevenLabs
    const audioFileName = await convertResponseToAudio(aiResponse);

    // Return the results
    return res.status(200).json({
      success: true,
      aiResponse,
      audioFile: audioFileName,
    });
  } catch (error) {
    console.error("Error processing text request:", error);
    return res.status(500).json({
      success: false,
      error: "Error processing text request",
    });
  }
}
