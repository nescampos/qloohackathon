import OpenAI from "openai";
import type { Assistant } from "openai/resources/beta/assistants";
import { tools } from "../../tools/allTools";
import { assistantPrompt } from "../constants/prompt";

/**
 * Creates a new assistant with the specified model, name, instructions and tools.
 * @param client The OpenAI client to use to create the assistant.
 * @returns The newly created assistant.
 */
export async function createAssistant(client: OpenAI): Promise<Assistant> {
    // Validate environment variables
    if (!process.env.OPENAI_MODEL) {
        throw new Error("OPENAI_MODEL environment variable is not set");
    }
    if (!process.env.OPENAI_ASSISTANT_NAME) {
        throw new Error("OPENAI_ASSISTANT_NAME environment variable is not set");
    }

    // Create the assistant with the specified configuration
    return await client.beta.assistants.create({
        name: process.env.OPENAI_ASSISTANT_NAME,
        instructions: assistantPrompt,
        model: process.env.OPENAI_MODEL,
        tools: Object.values(tools).map((tool) => tool.definition),
    });
}
