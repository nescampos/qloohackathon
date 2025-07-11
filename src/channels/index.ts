import { parseTwilioMessage, sendTwilioMessage } from './twilio';
import { parseWabaMessage, sendWabaMessage } from './waba';

export function detectChannel(body: any) {
  if (body.From && body.Body) return 'twilio';
  if (body.messages && body.messages[0]?.type === 'text') return 'waba';
  return null;
}

export function parseMessage(body: any) {
  const channel = detectChannel(body);
  if (channel === 'twilio') return parseTwilioMessage(body);
  if (channel === 'waba') return parseWabaMessage(body);
  throw new Error('Unknown channel');
}

export async function sendMessage(provider: string, to: string, text: string, reply?: any) {
  if (provider === 'twilio') return sendTwilioMessage(to, text, reply);
  if (provider === 'waba') return sendWabaMessage(to, text);
  throw new Error('Unknown provider');
} 