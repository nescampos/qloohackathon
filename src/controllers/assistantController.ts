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
    // Recuperar historial reciente
    const recentMessages = await db.getRecentMessages(from, historySize);
    // Convertir historial a formato OpenAI
    const history: ChatCompletionMessageParam[] = recentMessages
      .reverse() // Para que estén en orden cronológico
      .map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.message }));
    // Construir mensajes con historial + mensaje actual
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
    // Detectar tool-call
    const toolCallMatch = content.match(/^\[TOOL_CALL\]\s*(\w+)\((.*)\)$/);
    if (toolCallMatch) {
      const [, toolName, paramsRaw] = toolCallMatch;
      const tool = tools[toolName];
      if (!tool) throw new Error(`Tool ${toolName} not found`);
      // 1. Parsear los parámetros del string
      let params = parseParams(paramsRaw);
      // 2. Si la tool requiere el número de usuario, añadirlo automáticamente
      if (tool.definition.function.parameters.properties.number && !params.number) {
        params.number = from;
      }
      // 3. Validar contra el schema de la tool
      const required = tool.definition.function.parameters.required || [];
      for (const req of required) {
        if (!(req in params)) {
          throw new Error(`Falta el parámetro requerido: ${req}`);
        }
      }
      // 4. Ejecutar la tool con los parámetros normalizados
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