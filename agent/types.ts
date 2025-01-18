export interface AgentState {
  messages: string[];
  current_input?: string;
}

export interface AgentConfig {
  model: string;
  temperature: number;
}

export type AgentInput = {
  input: string;
  config?: Partial<AgentConfig>;
};
