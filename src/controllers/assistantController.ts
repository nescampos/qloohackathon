import { FastifyRequest, FastifyReply } from 'fastify';
import { chat } from '../chat';
import { db } from '../database/db';
import { ResponseHandler } from '../utils/responseHandler';

export class AssistantController {
    static async handleMessage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const { Body, From } = (request.body as { Body: string; From: string });
        
        try {
            // Get thread ID first
            const threadId = await db.getThreadId(From);
            
            // Process message
            const assistantMessage = await chat(From, Body);

            // Save messages sequentially
            await db.saveMessage(From, threadId || '', Body, 'user');
            await db.saveMessage(From, threadId || '', assistantMessage, 'assistant');

            ResponseHandler.sendSuccess(reply, assistantMessage);
        } catch (error) {
            console.error('Error processing request:', error);
            ResponseHandler.sendError(reply, error);
        }
    }
} 