import { tools as generalTools } from "../tools/allGeneralTools";
import type { ToolConfig } from "../utils/toolConfig";

export const tools: Record<string, ToolConfig> = {
  ...generalTools,
};
