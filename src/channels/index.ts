import * as twilio from './twilio';
import * as waba from './waba';
import * as telegram from './telegram';

export const CHANNEL_META_MAP: Record<string, { CHANNEL_TYPE: string }> = {
  twilio: { CHANNEL_TYPE: twilio.CHANNEL_TYPE },
  waba: { CHANNEL_TYPE: waba.CHANNEL_TYPE },
  telegram: { CHANNEL_TYPE: telegram.CHANNEL_TYPE },
};

export function detectChannel(body: any) {
  if (body.From && body.Body) return 'twilio';
  if (body.messages && body.messages[0]?.type === 'text') return 'waba';
  if (body.message || body.edited_message) return 'telegram';
  return null;
}

export function parseMessage(body: any) {
  const channel = detectChannel(body);
  if (channel === 'twilio') return twilio.parseTwilioMessage(body);
  if (channel === 'waba') return waba.parseWabaMessage(body);
  if (channel === 'telegram') return telegram.parseTelegramMessage(body);
  throw new Error('Unknown channel');
}

const senders: Record<string, (to: string, text: string, reply?: any) => Promise<any>> = {
  twilio: twilio.sendTwilioMessage,
  waba: (to, text) => waba.sendWabaMessage(to, text),
  telegram: telegram.sendTelegramMessage,
};

export async function sendMessage(provider: string, to: string, text: string, reply?: any) {
  const sender = senders[provider];
  if (!sender) throw new Error('Unknown provider');
  return sender(to, text, reply);
} 