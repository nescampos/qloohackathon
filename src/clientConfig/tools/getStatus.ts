import type { ToolConfig } from "../../utils/toolConfig";
import { db } from "../../database/db";


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
    const userDebt = false; //await db.getUserDebt(number);
    
    if (!userDebt) {
      return "No tienes deuda pendiente.";
    }

    /* const today = new Date();
    const dueDate = new Date(userDebt.dueDate);
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue > 0) {
      return `Tienes una deuda de $${userDebt.debtAmount.toFixed(2)} que vence el ${dueDate.toLocaleDateString()} con ${daysOverdue} días de atraso.`;
    } else {
      return `Tienes una deuda de $${userDebt.debtAmount.toFixed(2)} que vence el ${dueDate.toLocaleDateString()}.`;
    } */
  } catch (error) {
    //console.error('Error al consultar la deuda:', error);
    return "Lo siento, hubo un error al consultar tu deuda. Por favor, intenta más tarde.";
  } finally {
    //await db.close();
  }
}
