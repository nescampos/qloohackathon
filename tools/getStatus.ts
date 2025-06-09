import type { ToolConfig } from "./allTools";
import type { GetStatusArgs } from "./toolInterfaces";

/**
 * Get the status of a user's debt.
 * The phone number is automatically provided by the system through metadata.
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
          number: {
            type: "string",
            description: "El número de teléfono del usuario (se maneja automáticamente, no necesitas proporcionarlo)",
          },
        },
        required: [],  // Hacemos que number no sea requerido ya que se maneja automáticamente
      },
    },
  },
  handler: async ({ number }) => {
    return await getStatus(number);
  },
};

async function getStatus(number: string) {
  if (number === "whatsapp:+56982505514") {
    return `Tienes una deuda que está asociado al vehículo XXXXXX para el mes de febrero 2025 con 4 días de atraso.`;
  } else {
    return `No tienes deuda pendiente.`;
  }
}
