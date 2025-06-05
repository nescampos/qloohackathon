# WhatsApp Assistant API

Una API que proporciona un asistente virtual inteligente para consultas utilizando la API de OpenAI.

## 🚀 Características

- Asistente virtual inteligente usando OpenAI
- Manejo automático de conversaciones por usuario
- Integración con Twilio para mensajería
- Base de datos SQLite para desarrollo local
- Base de datos SQL Server para producción
- Sistema de tools dinámico y extensible

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Una cuenta en OpenAI con API key
- Una cuenta en Twilio (para la integración de mensajería)
- SQL Server (solo para producción)

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone [url-del-repositorio]
cd demoapi
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto basado en `env.example`:
```env
# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_de_openai
OPENAI_ASSISTANT_ID=id_del_asistente
OPENAI_MODEL=gpt-4-1106-preview
OPENAI_ASSISTANT_NAME=nombre_del_asistente

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database Configuration (solo necesario en producción)
DB_USER=usuario_sql_server
DB_PASSWORD=contraseña_sql_server
DB_SERVER=host_sql_server
DB_NAME=nombre_base_datos
```

## 🚀 Comandos Disponibles

- `npm run start-api`: Inicia el servidor API
- `npm run compile`: Compila el código TypeScript
- `npm run configure-assistant`: Configura el asistente en OpenAI
- `npm run setup-db`: Inicializa la base de datos

## 📚 Estructura del Proyecto

```
src/
├── constants/     # Constantes y configuraciones
├── controllers/   # Controladores de la API
├── database/      # Configuración y modelos de la base de datos
├── openai/        # Integraciones con OpenAI
├── schemas/       # Esquemas de validación
├── types/         # Tipos TypeScript
├── utils/         # Utilidades
└── tools/         # Tools dinámicas del asistente
```

## 🔧 Configuración de Base de Datos

### Desarrollo Local
En desarrollo, la aplicación utiliza SQLite por defecto. La base de datos se crea automáticamente en el archivo `chat.db`.

### Producción
En producción, la aplicación utiliza SQL Server. Asegúrate de configurar las siguientes variables de entorno:
- `DB_USER`: Usuario de SQL Server
- `DB_PASSWORD`: Contraseña de SQL Server
- `DB_SERVER`: Host del servidor SQL Server
- `DB_NAME`: Nombre de la base de datos

Para cambiar entre entornos, usa la variable `NODE_ENV`:
- `development`: Usa SQLite (por defecto)
- `production`: Usa SQL Server

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

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request 