# WhatsApp AI Assistant API

Una API que proporciona un asistente virtual inteligente para consultas utilizando la API de OpenAI o cualquier servicio compatible con el SDK de OpenAI (configurable por baseURL), ahora con soporte multi-canal (Twilio y WhatsApp Business API nativa) y estructura extensible para más canales.

## 🚀 Características

- Asistente virtual inteligente usando OpenAI o servicios compatibles
- Manejo automático de conversaciones por usuario
- Integración multi-canal: Twilio (WhatsApp/SMS) y WhatsApp Business API nativa (WABA)
- Webhook único y extensible para más canales
- Base de datos SQLite para desarrollo local
- Base de datos SQL Server o Supabase para producción
- Sistema de tools dinámico y extensible (ejecutadas en backend)
- Configuración flexible de modelo y endpoint (baseURL)

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Una cuenta en OpenAI o servicio compatible con su API
- Una cuenta en Twilio (para la integración de mensajería)
- Una cuenta de WhatsApp Business API (opcional, Meta)
- SQL Server o Supabase (solo para producción)

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone [url-del-repositorio]
cd agent
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto:
```env
# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_de_openai
OPENAI_MODEL=gpt-3.5-turbo
# Si usas un proveedor alternativo, configura el endpoint:
# OPENAI_BASE_URL=https://api.tu-proveedor.com/v1

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database Configuration (solo necesario en producción)
DB_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
# O para SQL Server:
# DB_TYPE=sqlserver
# DB_USER=usuario_sql_server
# DB_PASSWORD=contraseña_sql_server
# DB_SERVER=host_sql_server
# DB_NAME=nombre_base_datos

# Twilio (opcional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=...

# WhatsApp Business API (WABA)
WABA_PHONE_NUMBER_ID=...
WABA_ACCESS_TOKEN=...
```

## 🚀 Comandos Disponibles

- `npm run setup-db`: Configura la base de datos
- `npm run start-api`: Inicia el servidor API (en modo developer)
- `npm run compile`: Compila el código TypeScript
- `npm start`: Inicia en modo producción (después de la compilación)

## 📚 Estructura del Proyecto

```
src/
├── channels/       # Parsers y envío para cada canal (twilio, waba, etc.)
├── constants/      # Constantes y configuraciones
├── controllers/    # Controladores de la API (webhook principal)
├── database/       # Configuración y modelos de la base de datos
├── schemas/        # Esquemas de validación
├── services/       # Lógica común de procesamiento de mensajes
├── utils/          # Utilidades
├── config/         # Configuración del servidor
└── tools/          # Tools dinámicas del asistente
```

## 🌐 Soporte Multi-Canal y Webhook Único

- El endpoint `/assistant` acepta mensajes de Twilio y WhatsApp Business API nativa (y es extensible a más canales).
- El sistema detecta automáticamente el canal de origen, normaliza el mensaje y responde usando el formato adecuado:
  - **Twilio:** Responde con XML (TwiML) usando `ResponseHandler`.
  - **WABA:** Envía la respuesta usando la API de Meta.
- Para agregar más canales, solo crea un archivo en `channels/` y actualiza el dispatcher.

## 🔧 Configuración de Base de Datos

### Desarrollo Local
Por defecto, la aplicación usa SQLite en desarrollo. La base de datos se crea automáticamente como `chat.db`.

### Producción
En producción, puedes usar **SQL Server** o **Supabase**. Configura las siguientes variables de entorno según el motor:

#### SQL Server
- DB_TYPE=sqlserver
- DB_USER=usuario_sql_server
- DB_PASSWORD=contraseña_sql_server
- DB_SERVER=host_sql_server
- DB_NAME=nombre_base_datos

#### Supabase
- DB_TYPE=supabase
- SUPABASE_URL=https://your-project.supabase.co
- SUPABASE_KEY=your-supabase-service-role-key

##### Estructura de tablas para Supabase (Postgres):
```sql
-- Tabla de hilos de usuario
CREATE TABLE user_threads (
  phone_number VARCHAR PRIMARY KEY,
  thread_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_interaction TIMESTAMP DEFAULT NOW()
);

-- Historial de mensajes
CREATE TABLE chat_history (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR REFERENCES user_threads(phone_number),
  thread_id VARCHAR,
  message TEXT,
  role VARCHAR,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabla de deudas de usuario
CREATE TABLE user_debt (
  phone_number VARCHAR PRIMARY KEY,
  name VARCHAR,
  debt_amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Cambia de entorno usando la variable `NODE_ENV`:
- `development`: Usa SQLite (por defecto)
- `production`: Usa SQL Server o Supabase

## 📝 Uso de la API y Webhook

### Endpoint Principal
```http
POST /assistant
Content-Type: application/json o application/x-www-form-urlencoded

// Twilio:
Body=mensaje_del_usuario&From=numero_telefono

// WhatsApp Business API:
{
  "messages": [
    { "from": "numero_telefono", "text": { "body": "mensaje_del_usuario" }, ... }
  ]
}
```

### Ejemplo de Respuesta
- **Twilio:** XML (TwiML)
- **WABA:** Mensaje enviado vía API de Meta
- **Otros canales:** Adaptable

## 🔄 Extensibilidad

### Agregar Nuevos Canales
1. Crea un nuevo archivo en la carpeta `channels/` (ej: `telegram.ts`)
2. Implementa el parser y el sender para ese canal
3. Regístralo en el dispatcher de canales

### Agregar Nuevas Tools
1. Crea un nuevo archivo en la carpeta `tools/`
2. Define la tool siguiendo el formato existente
3. Registra la tool en `tools/allTools.ts`
4. La tool se integrará automáticamente en el prompt del asistente

## 📄 Licencia

MIT

## 👥 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

# WhatsApp AI Assistant API (English)

An API that provides a smart virtual assistant for queries using the OpenAI API or any service compatible with the OpenAI SDK (configurable via baseURL), now with multi-channel support (Twilio and native WhatsApp Business API) and an extensible structure for more channels.

## 🚀 Features

- Smart virtual assistant using OpenAI or compatible services
- Automatic per-user conversation management
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

- `npm run setup-db`: Setup the database
- `npm run start-api`: Start the API server (development mode)
- `npm run compile`: Compile TypeScript code
- `npm start`: Start in a production mode (after compilation)

## 📚 Project Structure

```
src/
├── channels/       # Parsers and senders for each channel (twilio, waba, etc.)
├── constants/      # Constants and configuration
├── controllers/    # API controllers (main webhook)
├── database/       # Database config and models
├── schemas/        # Validation schemas
├── services/       # Common message processing logic
├── utils/          # Utilities
├── config/         # Server configuration
└── tools/          # Assistant dynamic tools
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
-- User threads table
CREATE TABLE user_threads (
  phone_number VARCHAR PRIMARY KEY,
  thread_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_interaction TIMESTAMP DEFAULT NOW()
);

-- Message history
CREATE TABLE chat_history (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR REFERENCES user_threads(phone_number),
  thread_id VARCHAR,
  message TEXT,
  role VARCHAR,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- User debt table
CREATE TABLE user_debt (
  phone_number VARCHAR PRIMARY KEY,
  name VARCHAR,
  debt_amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
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

### Example Response
- **Twilio:** XML (TwiML)
- **WABA:** Message sent via Meta API
- **Other channels:** Adaptable

## 🔄 Extensibility

### Adding New Channels
1. Create a new file in the `channels/` folder (e.g., `telegram.ts`)
2. Implement the parser and sender for that channel
3. Register it in the channel dispatcher

### Adding New Tools
1. Create a new file in the `tools/` folder
2. Define the tool following the existing format
3. Register the tool in `tools/allTools.ts`
4. The tool will be automatically integrated into the assistant's prompt

## 📄 License

MIT

## 👥 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 