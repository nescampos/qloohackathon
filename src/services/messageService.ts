import { AssistantController } from '../controllers/assistantController';

export const messageService = {
  async processUserMessage(from: string, text: string) {
    // Usa el flujo real de IA/tool-calling
    // Llama al método que procesa el mensaje y devuelve la respuesta final
    // Aquí asumimos que AssistantController tiene un método estático para procesar mensajes y devolver solo el texto
    // Si no existe, implementa uno similar
    return await AssistantController.processAIMessage(from, text);
  }
}; 