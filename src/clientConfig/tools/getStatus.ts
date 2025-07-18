import type { ToolConfig } from "../../utils/toolConfig";
import { getUserDebt } from "../database/userDebt";

/**
 * Arguments for the get_status tool
 */
export interface GetStatusArgs {
  externalId: string;
}

/**
 * Get the status of a user's debt.
 * The phone number (externalId) is automatically provided by the system through metadata.
 */
export const getStatusTool: ToolConfig<GetStatusArgs> = {
  definition: {
    type: "function",
    function: {
      name: "get_status",
      description: "Obtiene el estatus de la deuda del usuario (el número de teléfono se maneja automáticamente)",
      parameters: {
        type: "object",
        properties: {
          externalId: {
            type: "string",
            description: "El número de teléfono del usuario (se maneja automáticamente, no necesitas proporcionarlo)",
          },
        },
        required: [],  // Hacemos que externalId no sea requerido ya que se maneja automáticamente
      },
    },
  },
  handler: async ({ externalId }) => {
    return await getStatus(externalId);
  },
};

async function getStatus(externalId: string) {
  try {
    const amount = await getUserDebt(externalId);
    if (!amount || amount === 0) {
      return "No tienes deuda pendiente.";
    }
    return `Tienes una deuda de $${amount.toFixed(2)} pesos.`;
  } catch (error) {
    return "Lo siento, hubo un error al consultar tu deuda. Por favor, intenta más tarde.";
  }
}
