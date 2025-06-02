import { FastifyReply } from 'fastify';
const twilio = require('twilio');

export class ResponseHandler {
    static createTwiml(message: string): string {
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(message);
        return twiml.toString();
    }

    static sendSuccess(reply: FastifyReply, message: string): void {
        reply
            .type('text/xml')
            .header('Cache-Control', 'private, no-cache')
            .send(this.createTwiml(message));
    }

    static sendError(reply: FastifyReply, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        reply
            .type('text/xml')
            .code(500)
            .header('Cache-Control', 'no-store')
            .send(this.createTwiml(`Error: ${errorMessage}`));
    }
} 