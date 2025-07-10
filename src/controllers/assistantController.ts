import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../database/db';
import { ResponseHandler } from '../utils/responseHandler';
import { tools } from '../tools/allTools';
import { assistantPrompt } from '../constants/prompt';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import 'dotenv/config';
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
    static async handleMessage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const { Body, From } = (request.body as { Body: string; From: string });
        try {
            // Historial de mensajes (puedes expandir esto si tienes historial real)
            const messages: ChatCompletionMessageParam[] = [
                { role: 'system', content: assistantPrompt },
                { role: 'user', content: Body }
            ];

            // 1. Primer llamada al modelo
            let response = await openai.chat.completions.create({
                model,
                messages
            });
            let content = response.choices[0].message?.content ?? '';

            // 2. Detectar tool-call (formato: [TOOL_CALL] tool_name({ ... }))
            const toolCallMatch = content.match(/^\[TOOL_CALL\]\s*(\w+)\((.*)\)$/);
            if (toolCallMatch) {
                const [, toolName, paramsRaw] = toolCallMatch;
                const tool = tools[toolName];
                if (!tool) throw new Error(`Tool ${toolName} not found`);
                // El número se maneja automáticamente
                const params = { number: From };
                const toolResult = await tool.handler(params);

                // 3. Añadir resultado de tool y volver a llamar al modelo
                messages.push({ role: 'assistant', content });
                messages.push({ role: 'function', name: toolName, content: toolResult });

                response = await openai.chat.completions.create({
                    model,
                    messages
                });
                content = response.choices[0].message?.content ?? '';
            }

            // Asegurar que siempre exista un threadId
            let threadId = await db.getThreadId(From);
            if (!threadId) {
                threadId = uuidv4();
                await db.saveThreadId(From, threadId);
            }
            await db.saveMessage(From, threadId, Body, 'user');
            await db.saveMessage(From, threadId, content, 'assistant');

            ResponseHandler.sendSuccess(reply, content);
        } catch (error) {
            //('Error processing request:', error);
            ResponseHandler.sendError(reply, error);
        }
    }
} 