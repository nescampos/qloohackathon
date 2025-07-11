import { parseMessage, sendMessage } from '../channels';
import { FastifyRequest, FastifyReply } from 'fastify';
import { messageService } from '../services/messageService';
import { db } from '../database/db';
import { tools } from '../tools/allTools';
import { assistantPrompt } from '../constants/prompt';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { v4 as uuidv4 } from 'uuid';

const openaiConfig: any = {
    apiKey: process.env.OPENAI_API_KEY
};
if (process.env.OPENAI_BASE_URL) {
    openaiConfig.baseURL = process.env.OPENAI_BASE_URL;
}
const openai = new OpenAI(openaiConfig);
const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

export class AssistantController {
  static async handleMessage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { from, text, provider } = parseMessage(request.body);
      const responseText = await messageService.processUserMessage(from, text);
      await sendMessage(provider, from, responseText, reply);
      // Solo responde aquí si no es Twilio (Twilio ya respondió en sendTwilioMessage)
      if (provider !== 'twilio') {
        reply.send({ success: true });
      }
    } catch (error) {
      reply.status(500).send({ error: (error as Error).message });
    }
  }

  // Nuevo método para el flujo de IA/tool-calling puro
  static async processAIMessage(from: string, text: string): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: assistantPrompt },
      { role: 'user', content: text }
    ];
    let response = await openai.chat.completions.create({
      model,
      messages
    });
    let content = response.choices[0].message?.content ?? '';
    // Detectar tool-call
    const toolCallMatch = content.match(/^\[TOOL_CALL\]\s*(\w+)\((.*)\)$/);
    if (toolCallMatch) {
      const [, toolName, paramsRaw] = toolCallMatch;
      const tool = tools[toolName];
      if (!tool) throw new Error(`Tool ${toolName} not found`);
      const params = { number: from };
      const toolResult = await tool.handler(params);
      messages.push({ role: 'assistant', content });
      messages.push({ role: 'function', name: toolName, content: toolResult });
      response = await openai.chat.completions.create({
        model,
        messages
      });
      content = response.choices[0].message?.content ?? '';
    }
    // Guardar mensajes en la base de datos
    let threadId = await db.getThreadId(from);
    if (!threadId) {
      threadId = uuidv4();
      await db.saveThreadId(from, threadId);
    }
    await db.saveMessage(from, threadId, text, 'user');
    await db.saveMessage(from, threadId, content, 'assistant');
    return content;
  }
} 