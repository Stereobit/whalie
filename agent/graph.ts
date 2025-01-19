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

  // model.bindTools()

  const outputParser = new StringOutputParser();

  const chain = RunnableSequence.from([prompt, model, outputParser]);

  return async (input: AgentInput, state: AgentState) => {
    return chain.invoke({
      input: input.input,
      messages: state.messages,
    });
  };
};

const workflow = new StateGraph(State)
  // Nodes
  .addNode("init_chat", cleanUpHumanInstructionsNode)
  .addNode("create_research_report", createResearchReportNode)
  .addNode("email_writer", emailWriterNode)
  .addNode("linkedin_message_writer", linkedInMessageWriterNode)
  .addNode("researcher_tools", researcherToolsNode)
  .addNode("researcher", researcherNode)
  .addNode("return_to_supervisor", returnToSupervisorNode)
  .addNode("start_create_research_report", startCreateResearchReportNode)
  .addNode("start_email_writer", startEmailWriterNode)
  .addNode("start_linkedin_message_writer", startLinkedInMessageWriterNode)
  .addNode("start_researcher", startResearcherNode)
  .addNode("start_write_email", startWriteEmailNode)
  .addNode("start_write_linkedin_message", startWriteLinkedInMessageNode)
  .addNode("supervisor", supervisorNode)
  .addNode("write_email", writeEmailNode)
  .addNode("write_linkedin_message", writeLinkedInMessageNode)
  .addNode("write_subject", writeSubjectNode)
  // Edges
  .addEdge(START, "clean_up_human_instructions")
  .addEdge("clean_up_human_instructions", "supervisor")
  .addEdge("start_email_writer", "email_writer")
  .addEdge("start_linkedin_message_writer", "linkedin_message_writer")
  .addEdge("start_researcher", "researcher")
  .addEdge("start_write_email", "write_email")
  .addEdge("start_write_linkedin_message", "write_linkedin_message")
  .addEdge("start_create_research_report", "create_research_report")
  .addEdge("researcher_tools", "researcher")
  .addEdge("return_to_supervisor", "supervisor")
  .addEdge("create_research_report", "supervisor")
  .addEdge("write_email", "email_writer")
  .addEdge("write_linkedin_message", "linkedin_message_writer")
  .addEdge("write_subject", "email_writer")
  // Conditional edges
  .addConditionalEdges("write_email", routeWriteEmailNodeOutput, [
    "write_subject",
    "email_writer",
  ])

  .addConditionalEdges("supervisor", routeSupervisorNodeOutput, [
    "start_researcher",
    "start_email_writer",
    "start_linkedin_message_writer",
    END,
  ])
  .addConditionalEdges("researcher", routeResearcherNodeOutput, [
    "return_to_supervisor",
    "researcher_tools",
    "start_create_research_report",
  ])
  .addConditionalEdges("email_writer", routeEmailWriterNodeOutput, [
    "return_to_supervisor",
    "start_write_email",
  ])
  .addConditionalEdges(
    "linkedin_message_writer",
    routeLinkedInMessageWriterNodeOutput,
    ["return_to_supervisor", "start_write_linkedin_message"]
  );

// This makes it so that, by default, the graph has recursion limit of 50.
export const graph = workflow.compile().withConfig({
  recursionLimit: 75,
});
