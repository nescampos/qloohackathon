export function parseWabaMessage(body: any) {
  const msg = body.messages?.[0];
  return {
    from: msg?.from,
    text: msg?.text?.body,
    provider: 'waba'
  };
}

export async function sendWabaMessage(to: string, text: string) {
  const phoneNumberId = process.env.WABA_PHONE_NUMBER_ID;
  const accessToken = process.env.WABA_ACCESS_TOKEN;
  await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    })
  });
} 