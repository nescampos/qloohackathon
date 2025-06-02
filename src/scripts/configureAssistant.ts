import "dotenv/config";
import OpenAI from "openai";
import { createAssistant } from "../openai/createAssistant";

async function configureAssistant() {
    try {
        // Validate environment variables
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY environment variable is not set");
        }

        // Initialize OpenAI client
        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        console.log("🤖 Creating assistant...");
        const assistant = await createAssistant(client);
        
        console.log("✅ Assistant created successfully!");
        console.log("Assistant ID:", assistant.id);
        console.log("Please add this ID to your .env file as OPENAI_ASSISTANT_ID");
        
        // Create or update .env file with the new assistant ID
        console.log("\n📝 Add the following line to your .env file:");
        console.log(`OPENAI_ASSISTANT_ID=${assistant.id}`);

    } catch (error) {
        console.error("❌ Error creating assistant:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Execute the configuration
configureAssistant(); 