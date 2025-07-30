import type { ToolConfig } from "../utils/toolConfig";
import { getRestaurantTool } from "./getRestaurant";

export const tools: Record<string, ToolConfig> = {
  get_restaurant: getRestaurantTool,
};
  