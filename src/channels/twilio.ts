import { FastifyReply } from 'fastify';
const twilio = require('twilio');

export function parseTwilioMessage(body: any) {
  return {
    from: body.From,
    text: body.Body,
    provider: 'twilio'
  };
}

export async function sendTwilioMessage(to: string, text: string, reply?: FastifyReply) {
  // Si se pasa el objeto reply, usa ResponseHandler para responder en formato TwiML
  if (reply) {
    sendSuccess(reply, text);
    return;
  }
  // Si no, aquí podrías implementar el envío activo usando la API de Twilio si lo necesitas
} 

function sendSuccess(reply: FastifyReply, message: string): void {
  reply
      .type('text/xml')
      .header('Cache-Control', 'private, no-cache')
      .send(createTwiml(message));
}

function createTwiml(message: string): string {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  return twiml.toString();
}

function sendError(reply: FastifyReply, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  reply
      .type('text/xml')
      .code(500)
      .header('Cache-Control', 'no-store')
      .send(createTwiml(`Error: ${errorMessage}`));
}