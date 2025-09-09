# Monday Signing App

Aplicación para visualizar y firmar documentos PDF en Monday.com.

## Características

- Visualización de PDFs dentro de Monday.com
- Muestra información de los documentos y destinatarios
- Integración completa con Monday SDK

## Desarrollo local

### Requisitos previos

- Node.js 18+
- npm o yarn

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Alexisgonz/monday-signing-app.git
   cd monday-signing-app
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Edita el archivo `.env` y configura:
     - `MONDAY_TOKEN` con tu token personal de Monday
     - `VITE_DEFAULT_ITEM_ID` con un ID de ítem para pruebas

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. La aplicación estará disponible en: `http://localhost:5173`
   - Para probar con un ítem específico: `http://localhost:5173?itemId=12345`

## Despliegue en Monday.com

### Preparación para Producción

1. Actualiza `monday.yaml` con la URL de tu servidor
2. Modifica el archivo `.env` para producción:
   - Cambia `NODE_ENV=production`
   - Comenta o elimina la línea `MONDAY_TOKEN`
   - Comenta o elimina la línea `VITE_DEFAULT_ITEM_ID`
3. Construye la aplicación:
   ```bash
   npm run build
   ```

3. Sube los archivos de la carpeta `dist` a tu servidor web

### Configuración en Monday.com

1. Ve a monday.com/developers/apps
2. Crea una nueva app
3. Configura las URLs en la sección "OAuth & Permissions":
   - URL de la app: `https://tu-dominio.com/`
   - URL de redirección: `https://tu-dominio.com/auth` (si es necesario)
4. Habilita las capacidades necesarias en "Features":
   - Item View
   - Board View (opcional)
   - Item Actions (opcional)
5. Configura los permisos requeridos:
   - boards:read
   - items:read
   - assets:read
   - columns:read
   - boards:write (si necesitas actualizar estados)
6. Instala la app en tu cuenta de Monday

## Estructura del proyecto

- `/src`: Código fuente
  - `/api`: Clientes para API externas
  - `/components`: Componentes React reutilizables
  - `/connector`: Hooks y conectores para integraciones
  - `/services`: Servicios para interactuar con APIs
  - `/utils`: Utilidades varias
- `/public`: Archivos estáticos

## Notas importantes

- El archivo `.env` contiene configuración para ambos entornos (desarrollo y producción)
- En desarrollo se usa el token de la variable `MONDAY_TOKEN` para autenticación
- En producción (dentro de Monday) se usa el contexto y token proporcionados por Monday SDK
- Los IDs de columnas están configurados en `src/services/monday.ts`
- **IMPORTANTE**: Nunca subas el archivo `.env` con información sensible a repositorios Git

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
