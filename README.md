# Traveler Assistant

An intelligent conversational assistant that helps users discover both restaurants and a wide variety of other places (such as parks, hotels, shopping malls, markets, cultural centers, etc.) based on specific criteria like location, type, amenities, and preferences. The assistant uses the [Qloo API](https://www.qloo.com/) to provide accurate, real-time information across multiple communication channels.

## 🍽️🗺️ What This Assistant Does

This assistant specializes in:
- Restaurant discovery with advanced filtering capabilities.
- Discovery of other places of interest (parks, hotels, shopping malls, markets, cultural centers, etc.) with flexible filters.
- Remembering your preferences and previous queries thanks to its conversation memory, so you don't have to repeat information in long or multi-turn conversations.

It understands natural language queries and can filter results by a wide range of criteria.

### 🏙️ Examples of Searches

#### Restaurant Searches
- "Restaurants in Providencia"
- "What restaurants are there in Las Condes?"
- "Places to eat in downtown Santiago"

### 🍕 Cuisine Types
- "Italian restaurants in Vitacura"
- "Mexican food in Ñuñoa"
- "Where is Chinese food in Santiago"

### 🐾 Pet-Friendly Options
- "Pet-friendly places in Providencia"
- "Restaurants that accept dogs in Las Condes"
- "Places to go with pets in Vitacura"

### 👨‍👩‍👧‍👦 Family-Friendly Features
- "Restaurants with children's menu in La Reina"
- "Places with games for children in Lo Barnechea"
- "Family-friendly places in Providencia"

### 🌱 Dietary Preferences
- "Vegan restaurants in Santiago"
- "Vegetarian options in Las Condes"
- "Gluten-free food in Providencia"

### 🚗 Services & Amenities
- "Free parking restaurants in Vitacura"
- "Delivery places in Ñuñoa"
- "Restaurants with bar in Providencia"
- "Places that accept cards in Santiago"

### ☕ Meal Types
- "Where to have breakfast in Las Condes"
- "Places to have lunch in Providencia"
- "Restaurants for dinner in Vitacura"
- "Where to have brunch on Sunday in Santiago"
- "Places to have once in Ñuñoa"

---

### 🏢 Other Places (get_places)

#### 🛍️ Shopping & Markets
- "Shopping malls with free parking in Las Condes"
- "Markets with restrooms in Vitacura"
- "Shops with wifi in Santiago"
- "Tourist shopping centers in Providencia"

#### 🌳 Parks & Outdoor
- "Parks with playgrounds for kids in Ñuñoa"
- "Dog parks in Lo Barnechea"
- "Smoke-free parks with free admission in Las Condes"
- "Parks with restrooms and coffee in Providencia"

#### 🏨 Hotels
- "Hotels that are smoke-free in Providencia"
- "Hotels with wifi and free parking in Santiago"
- "Hotels that accept credit card in Ñuñoa"

#### 🏛️ Cultural & Tourist
- "Cultural centers with free admission in Santiago"
- "Tourist attractions with restrooms in Vitacura"
- "Cultural centers with coffee and wifi in Las Condes"

#### 🚻 Amenities & Filters
- "Places with restrooms and free admission in Providencia"
- "Dog parks with playgrounds for kids in Ñuñoa"
- "Markets with coffee and free parking in Vitacura"
- "Shopping malls that accept credit card and have wifi in Santiago"
- "Tourist places with alcohol in Las Condes"
- "Hotels with playgrounds for kids and smoke-free in Lo Barnechea"
- "Cultural centers with parking, coffee, and restrooms in Santiago"
- "Restaurants that accept dogs in Las Condes"
- "Places to go with pets in Vitacura"

### 👨‍👩‍👧‍👦 Family-Friendly Features
- "Restaurants with children's menu in La Reina"
- "Places with games for children in Lo Barnechea"
- "Family-friendly places in Providencia"

### 🌱 Dietary Preferences
- "Vegan restaurants in Santiago"
- "Vegetarian options in Las Condes"
- "Gluten-free food in Providencia"

### 🚗 Services & Amenities
- "Free parking restaurants in Vitacura"
- "Delivery places in Ñuñoa"
- "Restaurants with bar in Providencia"
- "Places that accept cards in Santiago"

### ☕ Meal Types
- "Where to have breakfast in Las Condes"
- "Places to have lunch in Providencia"
- "Restaurants for dinner in Vitacura"
- "Where to have brunch on Sunday in Santiago"
- "Places to have once in Ñuñoa"


## Configuration and channels

- Multi-channel integration: Twilio (WhatsApp/SMS), WhatsApp Business API (WABA), and Telegram
- Dedicated webhook for Telegram (`/webhook/telegram`) and a single extensible webhook for other channels
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
- A Telegram account and a bot created with @BotFather (optional)
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
# Qloo Configuration
QLOO_ENDPOINT=
QLOO_API_KEY=

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

# Telegram (optional)
TELEGRAM_BOT_TOKEN=...
```

## 📱 Supported Messaging Channels

### Telegram
- Create a bot with [@BotFather](https://t.me/BotFather) and obtain the token.
- Add the token as `TELEGRAM_BOT_TOKEN` in your `.env`.
- Expose your server to the internet (e.g., using [ngrok](https://ngrok.com/)) and configure the Telegram webhook pointing to:
  
  `https://<your-domain>/webhook/telegram`

- The Telegram channel supports text messages and displays detailed restaurant responses, just like WhatsApp and Twilio.

### Twilio (WhatsApp/SMS)
- Configure your Twilio credentials and number in the `.env`.
- Point the Twilio webhook to `/assistant`.

### WhatsApp Business API (WABA)
- Configure your WABA credentials and number in the `.env`.
- Point the WABA webhook to `/assistant`.

## 🧠 Assistant Behavior

- The assistant analyzes each message and, if applicable, executes the `get_restaurant` tool using structured tool-calling.
- Tool responses now display **all details of each restaurant**: name, status (open/closed), address, phone, web, and cuisine type.
- If no restaurants are found, the assistant explicitly indicates this.
- The prompt forces displaying the information as returned by the tool, without summarizing or paraphrasing.
- Supports natural language queries about city, food type, filters (vegan, children's menu, pets, etc.), services (delivery, bar, parking, etc.), and meal types (breakfast, brunch, etc.).

## 📝 Example Detailed Response

```
1. Boragó
   Estado: Abierto
   Dirección: Av. Nueva Costanera 3467, Vitacura
   Teléfono: +56 2 2953 8893
   Web: https://www.borago.cl
   Tipo de cocina: Contemporánea, Chilena

2. La Mar
   Estado: Abierto
   Dirección: Av. Nueva Costanera 4076, Vitacura
   Teléfono: +56 2 2218 0100
   Web: https://www.lamarcebicheria.cl
   Tipo de cocina: Peruana, Mariscos
```

## ⚙️ Environment Variables (.env)

Make sure to define in your `.env`:
- QLOO_ENDPOINT, QLOO_API_KEY
- OPENAI_API_KEY, OPENAI_MODEL
- TELEGRAM_BOT_TOKEN
- (Optional) Twilio and WABA credentials
- DB_TYPE, SUPABASE_URL, SUPABASE_KEY or SQL Server

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