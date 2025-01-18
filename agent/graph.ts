import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AgentState, AgentInput } from "./types";
import { DEFAULT_CONFIG, SYSTEM_PROMPT } from "./config";

const createPrompt = () => {
  return ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    new MessagesPlaceholder("messages"),
    ["human", "{input}"],
  ]);
};

export const createAgentChain = () => {
  const prompt = createPrompt();
  const model = new ChatOpenAI({
    modelName: DEFAULT_CONFIG.model,
    temperature: DEFAULT_CONFIG.temperature,
  });
  const outputParser = new StringOutputParser();

  const chain = RunnableSequence.from([prompt, model, outputParser]);

  return async (input: AgentInput, state: AgentState) => {
    return chain.invoke({
      input: input.input,
      messages: state.messages,
    });
  };
};
