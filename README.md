# WhatsApp Assistant API

Una API que proporciona un asistente virtual inteligente para consultas utilizando la API de OpenAI o cualquier servicio compatible con el SDK de OpenAI (configurable por baseURL).

## 🚀 Características

- Asistente virtual inteligente usando OpenAI o servicios compatibles
- Manejo automático de conversaciones por usuario
- Integración con Twilio para mensajería
- Base de datos SQLite para desarrollo local
- Base de datos SQL Server para producción
- Sistema de tools dinámico y extensible (ejecutadas en backend)
- Configuración flexible de modelo y endpoint (baseURL)

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Una cuenta en OpenAI o servicio compatible con su API
- Una cuenta en Twilio (para la integración de mensajería)
- SQL Server (solo para producción)

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
NODE_ENV=development | production

# Database Configuration (para producción)
DB_TYPE=supabase | sqlserver

# Database Configuration (solo necesario en producción)
DB_USER=usuario_sql_server
DB_PASSWORD=contraseña_sql_server
DB_SERVER=host_sql_server
DB_NAME=nombre_base_datos

# Supabase Configuration (solo necesario en producción, éste o SQL Server)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
```

## 🚀 Comandos Disponibles

- `npm run setup-db`: Configura la base de datos
- `npm run start-api`: Inicia el servidor API
- `npm run compile`: Compila el código TypeScript
- `npm start`: Inicia en modo producción (después de la compilación)

## 📚 Estructura del Proyecto

```
src/
├── constants/     # Constantes y configuraciones
├── controllers/   # Controladores de la API
├── database/      # Configuración y modelos de la base de datos
├── schemas/       # Esquemas de validación
├── utils/         # Utilidades
├── config/        # Configuración del servidor
└── tools/         # Tools dinámicas del asistente
```

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

## 🛡️ Seguridad

- Las credenciales sensibles se manejan a través de variables de entorno
- Los números de teléfono se procesan internamente
- Las transacciones de base de datos son atómicas
- Se implementan prácticas de seguridad para la API

## 📝 Uso de la API

### Endpoint Principal
```http
POST /assistant
Content-Type: application/x-www-form-urlencoded

Body=mensaje_del_usuario&From=numero_telefono
```

### Ejemplo de Respuesta
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Respuesta del asistente</Message>
</Response>
```

## 🔄 Extensibilidad

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

# WhatsApp Assistant API (English)

An API that provides a smart virtual assistant for queries using the OpenAI API or any service compatible with the OpenAI SDK (configurable via baseURL).

## 🚀 Features

- Smart virtual assistant using OpenAI or compatible services
- Automatic per-user conversation management
- Twilio integration for messaging
- SQLite database for local development
- SQL Server database for production
- Dynamic and extensible tools system (executed in backend)
- Flexible model and endpoint (baseURL) configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- An OpenAI account or compatible API service
- A Twilio account (for messaging integration)
- SQL Server (production only)

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
NODE_ENV=development | production

# Database Configuration (production only)
DB_TYPE=supabase | sqlserver

# Database Configuration (production only)
DB_USER=sql_server_user
DB_PASSWORD=sql_server_password
DB_SERVER=sql_server_host
DB_NAME=database_name

# Supabase Configuration (production only, this one or SQL Server)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
```

## 🚀 Available Commands

- `npm run setup-db`: Setup the database
- `npm run start-api`: Start the API server
- `npm run compile`: Compile TypeScript code
- `npm start`: Start in a production mode (after compilation)

## 📚 Project Structure

```
src/
├── constants/     # Constants and configuration
├── controllers/   # API controllers
├── database/      # Database config and models
├── schemas/       # Validation schemas
├── utils/         # Utilities
├── config/        # Server configuration
└── tools/         # Assistant dynamic tools
```

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

## 🛡️ Security

- Sensitive credentials are managed via environment variables
- Phone numbers are processed internally
- Database transactions are atomic
- Security best practices are implemented for the API

## 📝 API Usage

### Main Endpoint
```http
POST /assistant
Content-Type: application/x-www-form-urlencoded

Body=user_message&From=phone_number
```

### Example Response
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Assistant response</Message>
</Response>
```

## 🔄 Extensibility

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