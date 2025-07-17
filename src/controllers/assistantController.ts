import { parseMessage, sendMessage } from '../channels';
import { FastifyRequest, FastifyReply } from 'fastify';
import { messageService } from '../services/messageService';
import { db } from '../database/db';
import { tools } from '../clientConfig/allTools';
import { assistantPrompt } from '../clientConfig/prompt';
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
const maxTokens = process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS, 10) : 512; // Valor por defecto
const historySize = process.env.HISTORY_SIZE ? parseInt(process.env.HISTORY_SIZE, 10) : 6; // Por defecto 6
const modelTemperature = process.env.MODEL_TEMPERATURE ? parseFloat(process.env.MODEL_TEMPERATURE) : 0.2;

// Utilidad para parsear los parámetros del string tipo key="value", key2="value2"
function parseParams(paramsRaw: string): Record<string, any> {
  const regex = /(\w+)\s*=\s*"(.*?)"/g;
  const params: Record<string, string> = {};
  let match;
  while ((match = regex.exec(paramsRaw)) !== null) {
    params[match[1]] = match[2];
  }
  return params;
}

export class AssistantController {
  static async handleMessage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { from, text, provider } = parseMessage(request.body);
      const responseText = await messageService.processUserMessage(provider, from, text);
      await sendMessage(provider, from, responseText, reply);
      if (provider !== 'twilio') {
        reply.send({ success: true });
      }
    } catch (error) {
      reply.status(500).send({ error: (error as Error).message });
    }
  }

  static async processAIMessage(provider: string, externalId: string, text: string, name?: string): Promise<string> {
    // Recuperar historial reciente
    const recentMessages = await db.getRecentMessagesByProvider(provider, externalId, historySize);
    const history: ChatCompletionMessageParam[] = recentMessages
      .reverse()
      .map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.message }));
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: assistantPrompt },
      ...history,
      { role: 'user', content: text }
    ];
    let response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: modelTemperature
    });
    let content = response.choices[0].message?.content ?? '';
    const toolCallMatch = content.match(/^\[TOOL_CALL\]\s*(\w+)\((.*)\)$/);
    if (toolCallMatch) {
      const [, toolName, paramsRaw] = toolCallMatch;
      const tool = tools[toolName];
      if (!tool) throw new Error(`Tool ${toolName} not found`);
      let params = parseParams(paramsRaw);
      if (tool.definition.function.parameters.properties.externalId && !params.externalId) {
        params.externalId = externalId;
      }
      const required = tool.definition.function.parameters.required || [];
      for (const req of required) {
        if (!(req in params)) {
          throw new Error(`Falta el parámetro requerido: ${req}`);
        }
      }
      const toolResult = await tool.handler(params);
      messages.push({ role: 'assistant', content });
      messages.push({ role: 'function', name: toolName, content: toolResult });
      response = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: modelTemperature
      });
      content = response.choices[0].message?.content ?? '';
    }
    // Guardar mensajes en la base de datos
    await db.saveMessageByProvider(provider, externalId, text, 'user', name);
    await db.saveMessageByProvider(provider, externalId, content, 'assistant', name);
    return content;
  }
} 