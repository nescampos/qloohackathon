import "dotenv/config";
import OpenAI from "openai";
import { createThread } from "./openai/createThread";
import { createRun } from "./openai/createRun";
import { performRun } from "./openai/performRuns";
import { db } from './database/db';

// Initialize OpenAI client once
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || throwEnvError("OPENAI_API_KEY"),
});

// Validate environment variables at startup
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || throwEnvError("OPENAI_ASSISTANT_ID");

function throwEnvError(varName: string): never {
  throw new Error(`${varName} environment variable is not set.`);
}

/**
 * Processes a chat message and returns the assistant's response
 * @param userId - The user's phone number or identifier
 * @param message - The user's message content
 * @returns A promise that resolves to the assistant's response
 * @throws Error if the message processing fails
 */
export async function chat(userId: string, message: string): Promise<string> {
  // Input validation
  if (!userId?.trim()) {
    throw new Error("User ID is required");
  }
  if (!message?.trim()) {
    throw new Error("Message content is required");
  }

  try {
    // Get existing thread ID from database or create new one
    let threadId = await db.getThreadId(userId);
    let thread;

    if (threadId) {
      // Use existing thread
      thread = await client.beta.threads.retrieve(threadId);
    } else {
      // Create new thread
      thread = await createThread(client, userId);
      // Save new thread ID
      await db.saveThreadId(userId, thread.id);
    }

    // Add user message to thread
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // Create and execute run with user's phone number in metadata
    const run = await createRun(client, thread, ASSISTANT_ID, userId);
    const result = await performRun(run, client, thread);

    // Process and return result
    if (result?.type === "text") {
      return result.text.value;
    }

    throw new Error("Invalid response format from assistant");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Chat processing error: ${errorMessage}`);
    throw new Error(`Failed to process message: ${errorMessage}`);
  }
}
