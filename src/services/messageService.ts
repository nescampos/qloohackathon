import { AssistantController } from '../controllers/assistantController';

export const messageService = {
  async processUserMessage(provider: string, externalId: string, text: string, name?: string) {
    return await AssistantController.processAIMessage(provider, externalId, text, name);
  }
}; 