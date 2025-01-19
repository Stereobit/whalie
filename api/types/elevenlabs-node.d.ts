declare module "elevenlabs-node" {
  export function textToSpeechStream(
    apiKey: string | undefined,
    voiceId: string,
    text: string
  ): Promise<NodeJS.ReadableStream>;

  export default {
    textToSpeechStream,
  };
}
