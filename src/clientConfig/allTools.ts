import { getStatusTool } from "./tools/getStatus";
import type { ToolConfig } from "../utils/toolConfig";




  export const tools: Record<string, ToolConfig> = {
    // == READ == \\
    get_status: getStatusTool,
  };
  