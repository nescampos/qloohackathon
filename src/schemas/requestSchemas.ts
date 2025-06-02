export const assistantRequestSchema = {
    body: {
        type: 'object',
        required: ['Body', 'From'],
        properties: {
            Body: { type: 'string', minLength: 1 },
            From: { type: 'string', minLength: 1 }
        }
    }
}; 