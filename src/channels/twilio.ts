import { FastifyReply } from 'fastify';
import { ResponseHandler } from '../utils/responseHandler';

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
    ResponseHandler.sendSuccess(reply, text);
    return;
  }
  // Si no, aquí podrías implementar el envío activo usando la API de Twilio si lo necesitas
} 