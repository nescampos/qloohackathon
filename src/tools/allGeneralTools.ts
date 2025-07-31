import type { ToolConfig } from "../utils/toolConfig";
import { getRestaurantTool } from "./getRestaurant";
import { getPlacesTool } from "./getPlaces";

export const tools: Record<string, ToolConfig> = {
  get_restaurant: getRestaurantTool,
  get_places: getPlacesTool,
};
  