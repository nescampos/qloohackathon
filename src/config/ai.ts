export const aiConfig = {
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS, 10) : 512,
  historySize: process.env.HISTORY_SIZE ? parseInt(process.env.HISTORY_SIZE, 10) : 6,
  modelTemperature: process.env.MODEL_TEMPERATURE ? parseFloat(process.env.MODEL_TEMPERATURE) : 0.2,
  openaiConfig: (() => {
    const config: any = { apiKey: process.env.OPENAI_API_KEY };
    if (process.env.OPENAI_BASE_URL) {
      config.baseURL = process.env.OPENAI_BASE_URL;
    }
    return config;
  })()
}; 