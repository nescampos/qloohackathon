import fastifyModule from 'fastify';
import formbody from '@fastify/formbody';
import { serverConfig, serverListenConfig } from './config/server';
import { assistantRequestSchema } from './schemas/requestSchemas';
import { ServerLifecycle } from './utils/serverLifecycle';
import { AssistantController } from './controllers/assistantController';

async function startServer() {
    // Initialize Fastify with configuration
    const fastify = fastifyModule(serverConfig);

    // Register plugins
    await fastify.register(formbody);

    // Initialize database
    await ServerLifecycle.initializeDatabase();

    // Register routes
    fastify.post('/assistant', { schema: assistantRequestSchema }, AssistantController.handleMessage);

    // Dedicated Telegram webhook (no schema, always 200 OK)
    fastify.post('/webhook/telegram', async (request, reply) => {
        try {
            await AssistantController.handleMessage(request, reply);
        } catch (err) {
            console.error('Error in Telegram webhook:', err);
            // Always respond 200 OK to Telegram
        }
        //reply.send({ success: true });
    });

    // Register shutdown handlers
    ServerLifecycle.registerShutdownHandlers(fastify);

    try {
        await fastify.listen(serverListenConfig);
        console.log(`Server running at http://${serverListenConfig.host}:${serverListenConfig.port}/`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

// Start the server
startServer();