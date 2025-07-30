# Restaurant Assistant

An intelligent conversational assistant that helps users discover restaurants based on specific criteria like location, cuisine type, dietary preferences, and amenities. The assistant uses the [Qloo API](https://www.qloo.com/) to provide accurate, real-time restaurant information across multiple communication channels.

## 🍽️ What This Assistant Does

This assistant specializes in restaurant discovery with advanced filtering capabilities. Users can ask questions like:
- "What Italian restaurants are available in Las Condes?"
- "Find vegan restaurants in Santiago that allow dogs"
- "Show me restaurants with kids menu and free parking in La Florida"
- Multi-channel integration: Twilio (WhatsApp/SMS) and native WhatsApp Business API (WABA)
- Single, extensible webhook for all channels
- SQLite database for local development
- SQL Server or Supabase database for production
- Dynamic and extensible tools system (executed in backend)
- Flexible model and endpoint (baseURL) configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- An OpenAI account or compatible API service
- A Twilio account (for messaging integration)
- A WhatsApp Business API (Meta) account (optional)
- SQL Server or Supabase (production only)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [repo-url]
cd agent
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
# If using an alternative provider, set the endpoint:
# OPENAI_BASE_URL=https://api.your-provider.com/v1

# Maximum number of tokens for agent responses. Default is 512 if not set. 
# MAX_TOKENS=

# Number of previous messages to include as conversation context. Default is 6 if not set.  
# HISTORY_SIZE=

# Model temperature to generate more random or fixed responses
# MODEL_TEMPERATURE=

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database Configuration (production only)
DB_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
# Or for SQL Server:
# DB_TYPE=sqlserver
# DB_USER=sql_server_user
# DB_PASSWORD=sql_server_password
# DB_SERVER=sql_server_host
# DB_NAME=database_name

# Twilio (optional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=...

# WhatsApp Business API (WABA)
WABA_PHONE_NUMBER_ID=...
WABA_ACCESS_TOKEN=...

```

## 🚀 Available Commands

- `npm run setup-db`: Setup the database (generic tables)
- `npm run setup-client-db`: Setup the database with client tables (run after setup-db)
- `npm run start-api`: Start the API server (development mode)
- `npm run compile`: Compile TypeScript code
- `npm start`: Start in a production mode (after compilation)

## 📚 Project Structure

```
src/
├── channels/       # Parsers and senders for each channel (twilio, waba, etc.)
├── clientConfig/   # Prompt, configurations and specific tools for the use case
│   ├── database/   # Client-specific database logic and models
│   │   ├── IClientDb.ts
│   │   ├── SQLiteClientDb.ts
│   │   ├── SQLServerClientDb.ts
│   │   ├── SupabaseClientDb.ts
│   │   ├── clientDbFactory.ts
│   │   ├── userDebt.ts      # Example: client-specific debt logic
│   └── tools/      # Client-specific tools
│   └── scripts/    # Client table initialization scripts
├── controllers/    # API controllers (main webhook)
├── database/       # Database config and models
├── schemas/        # Validation schemas
├── services/       # Common message processing logic
├── utils/          # Utilities
├── config/         # Server configuration
```

## 🌐 Multi-Channel Support & Single Webhook

- The `/assistant` endpoint accepts messages from Twilio and native WhatsApp Business API (and is extensible to more channels).
- The system automatically detects the source channel, normalizes the message, and responds using the appropriate format:
  - **Twilio:** Responds with XML (TwiML) using `ResponseHandler`.
  - **WABA:** Sends the response using Meta's API.
- To add more channels, just create a file in `channels/` and update the dispatcher.

## 🔧 Database Configuration

### Local Development
By default, the app uses SQLite in development. The database is automatically created as `chat.db`.

### Production
In production, you can use **SQL Server** or **Supabase**. Set the following environment variables according to your engine:

#### SQL Server
- DB_TYPE=sqlserver
- DB_USER=sql_server_user
- DB_PASSWORD=sql_server_password
- DB_SERVER=sql_server_host
- DB_NAME=database_name

#### Supabase
- DB_TYPE=supabase
- SUPABASE_URL=https://your-project.supabase.co
- SUPABASE_KEY=your-supabase-service-role-key

##### Table structure for Supabase (Postgres):
```sql
CREATE TABLE global_user (
  id SERIAL PRIMARY KEY,
  name TEXT
);

CREATE TABLE user_provider_identity (
  id SERIAL PRIMARY KEY,
  global_user_id INTEGER NOT NULL REFERENCES global_user(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  UNIQUE (provider, external_id)
);

CREATE TABLE chat_history (
  id SERIAL PRIMARY KEY,
  user_provider_identity_id INTEGER NOT NULL REFERENCES user_provider_identity(id) ON DELETE CASCADE,
  message TEXT,
  role TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_history_user_provider_identity_id ON chat_history(user_provider_identity_id);
CREATE INDEX idx_chat_history_timestamp ON chat_history(timestamp);
```

Switch environments using the `NODE_ENV` variable:
- `development`: Uses SQLite (default)
- `production`: Uses SQL Server or Supabase

## 🏦 Client-Specific Database

If your project requires database tables or logic that are **not generic** (e.g., debts, memberships, etc.), you can isolate them in `src/clientConfig/database/`.

- Each supported engine (SQLite, SQL Server, Supabase) has its own implementation.
- Uses only environment variables for connection, does not depend on the core.
- Example file: `userDebt.ts` (you can create more modules as needed).

### Example structure for a debt table

```
src/clientConfig/database/
  IClientDb.ts              # Common interface for client methods
  SQLiteClientDb.ts         # SQLite implementation
  SQLServerClientDb.ts      # SQL Server implementation
  SupabaseClientDb.ts       # Supabase implementation
  clientDbFactory.ts        # Selects engine based on env variable
  userDebt.ts               # Example: debt logic
src/clientConfig/scripts/
  setupClientDatabase.ts  # Script to create client tables
```

### Client table initialization

To create client-specific tables (e.g., `user_debts`), run:

```bash
npx ts-node src/clientConfig/scripts/setupClientDatabase.ts
```

### Example usage in code

```ts
import { getUserDebt, setUserDebt } from './clientConfig/database/userDebt';

const debt = await getUserDebt('user123');
await setUserDebt('user123', 100);
```

> You can create more modules in `clientConfig/database/` for other client-specific tables or logic.


## 📝 API Usage & Webhook

### Main Endpoint
```http
POST /assistant
Content-Type: application/json or application/x-www-form-urlencoded

// Twilio:
Body=user_message&From=phone_number

// WhatsApp Business API:
{
  "messages": [
    { "from": "phone_number", "text": { "body": "user_message" }, ... }
  ]
}
```

### Identification and message storage flow
- The backend identifies each user by the combination of `provider` and `external_id`.
- If the identity does not exist, a new global user and identity are created.
- All messages are associated with the user-provider identity, allowing unified conversations even if the user switches channels.

### Example Response
- **Twilio:** XML (TwiML)
- **WABA:** Message sent via Meta API
- **Other channels:** Adaptable

## 🔄 Extensibility

### Adding New Channels
1. Create a new file in the `channels/` folder (e.g., `telegram.ts`)
2. Implement the parser and sender for that channel
3. Add the `CHANNEL_TYPE` property to specify the name of the channel to register in the database for conversations (for example WABA and Twilio are registered as `whatsapp`)
4. Register it in the channel dispatcher

### Adding New Tools
1. Create a new file in the `tools/` folder (generic tools, available for all instances)
2. Or create a file in `clientConfig/tools/` (client-specific tools)
3. Register the tool in the corresponding file (`tools/allGeneralTools.ts` for generic, or in the export of `clientConfig/allTools.ts` for specific)
4. In the final export of `clientConfig/allTools.ts`, combine both:

```ts
import { tools as generalTools } from "../tools/allGeneralTools";
import { getStatusTool } from "./tools/getStatus";

export const tools = {
  ...generalTools,
  get_status: getStatusTool,
  // ...other client-specific tools
};
```

- Client-specific tools can overwrite generic ones if they have the same name.
- This way, each instance can have its own tools and the generic ones will always be available.

> **Recommendation:** Every new tool should consider a parameter called `externalId` to receive the user's identifier. This allows for multi-channel identification and proper traceability of user actions.

## 📄 License

MIT

## 👥 Contribution

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request