
<div align="center">
  <h1>MemesDev</h1>
  <p>
    <a href="#-english">🇺🇸 English</a> | <a href="#-español">🇪🇸 Español</a>
  </p>
</div>

---

<a name="-english"></a>
## 🇺🇸 English

**MemesDev** is an open-source platform designed for developers to share, discover, and enjoy programming-related memes. Built with modern web technologies, it aims to offer a premium and fluid user experience.

### 🚀 Tech Stack

This project uses a modern and efficient stack:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Neon](https://neon.tech/) (Postgres Serverless)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Validation**: Zod
- **UI Components**: Shadcn UI, Radix UI, Lucide Icons
- **Linting/Formatting**: Biome

### 📂 Architecture

The project follows a Feature-First Architecture ("Screaming Architecture") adapted for the Next.js App Router:

- **`app/`**: Contains route logic and main features (`/hot`, `/upload`, `/search`, etc.). Each route folder groups its specific components and logic.
- **`shared/`**: Contains code reusable across the application, such as base UI components (`shared/components`), global hooks (`shared/hooks`), and utilities.
- **`db/`**: Database configuration and Drizzle schema definitions (`db/schemas`).
- **`drizzle/`**: Database migrations.
- **`emails/`**: Transactional email templates (React Email).

### 🛠️ Getting Started

To run this project locally:

#### 1. Clone and Prepare

```bash
git clone https://github.com/ivan2214/MemesDev.git
cd memes-dev
pnpm install
```

#### 2. Configure Environment

You will need to configure environment variables for the database and authentication. Create a `.env.local` file with the necessary keys (check with the dev team to get them).

#### 3. Database

The project uses Drizzle and Neon. To sync your local DB:

```bash
# Generate SQL artifacts
pnpm db:generate

# Migrate the database
pnpm db:migrate

# (Optional) Seed test data
pnpm db:seed
```

#### 4. Development

```bash
pnpm dev
```
The application will be available at `http://localhost:3000`.

### 📜 Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm lint`: Runs Biome to check code quality.
- `pnpm format`: Automatically formats code with Biome.
- `pnpm db:*`: Commands related to Drizzle ORM.

### 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on how to get started, our code standards, and the Pull Request process.

### 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<a name="-español"></a>
## 🇪🇸 Español

**MemesDev** es una plataforma de código abierto diseñada para que los desarrolladores compartan, descubran y disfruten de memes relacionados con la programación. Construida con tecnologías web modernas, busca ofrecer una experiencia de usuario premium y fluida.

### 🚀 Tecnologías

Este proyecto utiliza un stack moderno y eficiente:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Lenguaje**: TypeScript
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Base de Datos**: [Neon](https://neon.tech/) (Postgres Serverless)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Autenticación**: [Better Auth](https://better-auth.com/)
- **Validación**: Zod
- **UI Components**: Shadcn UI, Radix UI, Lucide Icons
- **Linting/Formatting**: Biome

### 📂 Arquitectura

El proyecto sigue una arquitectura orientada a características ("Screaming Architecture") adaptada al App Router de Next.js:

- **`app/`**: Contiene la lógica de las rutas y las características principales (`/hot`, `/upload`, `/search`, etc.). Cada carpeta de ruta agrupa sus componentes y lógica específica.
- **`shared/`**: Contiene código reutilizable en toda la aplicación, como componentes UI base (`shared/components`), hooks globales (`shared/hooks`) y utilidades.
- **`db/`**: Configuración de la base de datos y definición de esquemas Drizzle (`db/schemas`).
- **`drizzle/`**: Migraciones de base de datos.
- **`emails/`**: Plantillas de correo transaccionales (React Email).

### 🛠️ Comenzando

Para ejecutar este proyecto localmente:

#### 1. Clonar y preparar

```bash
git clone https://github.com/ivan2214/MemesDev.git
cd memes-dev
pnpm install
```

#### 2. Configurar Entorno

Necesitarás configurar las variables de entorno para la base de datos y la autenticación. Crea un archivo `.env.local` con las claves necesarias (mira el equipo de desarrollo para obtenerlas).

#### 3. Base de Datos

El proyecto utiliza Drizzle y Neon. Para sincronizar tu BD local:

```bash
# Generar artefactos sql
pnpm db:generate

# Migrar la base de datos
pnpm db:migrate

# (Opcional) Sembrar datos de prueba
pnpm db:seed
```

#### 4. Desarrollo

```bash
pnpm dev
```
La aplicación estará disponible en `http://localhost:3000`.

### 📜 Scripts Disponibles

- `pnpm dev`: Inicia el servidor de desarrollo.
- `pnpm build`: Construye la aplicación para producción.
- `pnpm lint`: Ejecuta Biome para verificar la calidad del código.
- `pnpm format`: Formatea el código automáticamente con Biome.
- `pnpm db:*`: Comandos relacionados con Drizzle ORM.

### 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, lee nuestro [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles sobre cómo empezar, nuestras normas de código y el proceso de Pull Request.

### 📄 Licencia

Este proyecto está bajo la Licencia [MIT](./LICENSE).
