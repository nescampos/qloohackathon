import { getStatusTool } from "./getStatus";

export interface ToolConfig<T = any> {
    /**
     * The definition of the tool.
     */
    definition: {
      type: "function";
      function: {
        name: string;
        description: string;
        parameters: {
          type: "object";
          properties: Record<string, unknown>;
          required: string[];
        };
      };
    };
  
    /**
     * The handler function that will be called when the tool is executed.
     */
    handler: (args: T) => Promise<any>;
  }


  export const tools: Record<string, ToolConfig> = {
    // == READ == \\
    get_status: getStatusTool,
  };
  