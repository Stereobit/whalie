import { NextApiRequest, NextApiResponse } from "next";
import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import convertResponseToAudio from "../../utils/convertResponseToAudio";
import cors from "cors";
import { SYSTEM_PROMPT } from "../../utils/prompts";

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["POST"],
  credentials: true,
});

// Store conversations in memory (in production, you'd want to use a proper database)
const conversations: Record<string, Array<HumanMessage | AIMessage>> = {};

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
const getOpenAIResponse = async (message: string, conversationId: string) => {
  const chat = new ChatOpenAI();

  // Initialize conversation if it doesn't exist
  if (!conversations[conversationId]) {
    conversations[conversationId] = [];
  }

  // Get previous messages
  const previousMessages = conversations[conversationId];

  // Construct messages array with system prompt and history
  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    ...previousMessages,
    new HumanMessage(message),
  ];

  const response = await chat.call(messages);

  // Store the new messages
  conversations[conversationId].push(new HumanMessage(message));
  conversations[conversationId].push(new AIMessage(response.text));

  // Keep only last 10 messages to manage context length
  if (conversations[conversationId].length > 10) {
    conversations[conversationId] = conversations[conversationId].slice(-10);
  }

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
    const { text, conversationId } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "No text provided",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: "No conversationId provided",
      });
    }

    // Get OpenAI response using LangChain
    const aiResponse = await getOpenAIResponse(text, conversationId);

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
