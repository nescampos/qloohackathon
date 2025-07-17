import { getStatusTool } from "./tools/getStatus";
import { getWeatherTool } from "./tools/getWeather";
import type { ToolConfig } from "../utils/toolConfig";

export const tools: Record<string, ToolConfig> = {
  // == READ == \\
  get_status: getStatusTool,
  get_weather: getWeatherTool,
};
  