import { getStatusTool } from "./tools/getStatus";
import { tools as generalTools } from "../tools/allGeneralTools";
import { getWeatherTool } from "./tools/getWeather";
import type { ToolConfig } from "../utils/toolConfig";

export const tools: Record<string, ToolConfig> = {
  ...generalTools,
  get_status: getStatusTool,
  get_weather: getWeatherTool,
};
