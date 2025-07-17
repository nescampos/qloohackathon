import type { ToolConfig } from "../../utils/toolConfig";

export interface GetWeatherArgs {
  city: string;
  date?: string;
}

export const getWeatherTool: ToolConfig<GetWeatherArgs> = {
  definition: {
    type: "function",
    function: {
      name: "get_weather",
      description: "Obtiene el clima para una ciudad y fecha dada.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Ciudad a consultar" },
          date: { type: "string", description: "Fecha (opcional)" }
        },
        required: ["city"]
      }
    }
  },
  handler: async ({ city, date }) => {
    // Lógica simulada para ejemplo
    return `El clima en ${city} para ${date ?? "hoy"} es soleado.`;
  }
}; 