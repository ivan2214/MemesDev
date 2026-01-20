<div align="center">
  <h1>Contributing Guide / Guía de Contribución</h1>
  <p>
    <a href="#-english">🇺🇸 English</a> | <a href="#-español">🇪🇸 Español</a>
  </p>
</div>

---

<a name="-english"></a>
## 🇺🇸 English

Thank you for your interest in contributing to **MemesDev**! This document outlines the guidelines and best practices for contributing to this project.

### Getting Started

#### Prerequisites
- Node.js 18+ (LTS recommended)
- [pnpm](https://pnpm.io/) (We exclusively use pnpm for package management)

#### Installation

1.  Fork the repository.
2.  Clone your fork:
    ```bash
    git clone https://github.com/ivan2214/MemesDev.git
    cd memes-dev
    ```
3.  Install dependencies:
    ```bash
    pnpm install
    ```
4.  Configure environment variables:
    Create a `.env.local` file based on the example file (if available) or contact the administrator to get the necessary development keys (Database, Auth, etc.).

5.  Setup the database:
    ```bash
    pnpm db:generate
    pnpm db:migrate
    # Optional: seed test data
    pnpm db:seed
    ```

6.  Start the development server:
    ```bash
    pnpm dev
    ```

### Workflow

#### Branches
We use a feature-based branch model. Please create a new branch for each feature or fix:

- `feat/feature-name` for new features.
- `fix/bug-name` for bug fixes.
- `docs/change-name` for documentation.
- `chore/task-name` for maintenance tasks.

#### Commits
We follow the **Conventional Commits** convention. Ensure your commit messages follow this structure:

- `feat: add new profile page`
- `fix: fix login form error`
- `style: format code with biome`
- `refactor: optimize database query`

#### Code Quality and Style

We use **Biome** for linting and formatting.

- **Linting**: Run `pnpm lint` to check for errors.
- **Formatting**: Run `pnpm format` to auto-fix styles.
- **Type Checking**: Run `pnpm type-check` to check TypeScript types.

Make sure to run these commands before submitting your Pull Request.

### Database (Drizzle ORM)

If you make changes to the database schema (`db/schemas`):

1.  Modify the necessary schema files.
2.  Generate the migration: `pnpm db:generate`
3.  Apply the migration (locally): `pnpm db:migrate`

Do not upload the `.env` file or credentials to the repository.

### Pull Requests

1.  Ensure your branch is up to date with `main`.
2.  Open a Pull Request describing your changes in detail.
3.  Link any related issues.
4.  Wait for the team's review.

Happy Coding!

---

<a name="-español"></a>
## 🇪🇸 Español

¡Gracias por tu interés en contribuir a **MemesDev**! Este documento describe las pautas y mejores prácticas para contribuir a este proyecto.

### Primeros Pasos

#### Prerrequisitos
- Node.js 18+ (LTS recomendado)
- [pnpm](https://pnpm.io/) (Gestionamos paquetes exclusivamente con pnpm)

#### Instalación

1.  Haz un fork del repositorio.
2.  Clona tu fork:
    ```bash
    git clone https://github.com/ivan2214/MemesDev.git
    cd memes-dev
    ```
3.  Instala las dependencias:
    ```bash
    pnpm install
    ```
4.  Configura las variables de entorno:
    Crea un archivo `.env.local` basado en el archivo de ejemplo (si existe) o contacta con el administrador para obtener las claves de desarrollo necesarias (Base de datos, Autenticación, etc.).

5.  Prepara la base de datos:
    ```bash
    pnpm db:generate
    pnpm db:migrate
    # Opcional: sembrar datos de prueba
    pnpm db:seed
    ```

6.  Inicia el servidor de desarrollo:
    ```bash
    pnpm dev
    ```

### Flujo de Trabajo

#### Ramas (Branches)
Utilizamos un modelo de ramas basado en características. Por favor, crea una nueva rama para cada funcionalidad o corrección:

- `feat/nombre-funcionalidad` para nuevas características.
- `fix/nombre-bug` para corrección de errores.
- `docs/nombre-cambio` para documentación.
- `chore/nombre-tarea` para tareas de mantenimiento.

#### Commits
Seguimos la convención **Conventional Commits**. Asegúrate de que tus mensajes de commit sigan esta estructura:

- `feat: agregar nueva página de perfil`
- `fix: corregir error en formulario de login`
- `style: formatear código con biome`
- `refactor: optimizar consulta de base de datos`

### Calidad de Código y Estilo

Utilizamos **Biome** para linting y formateo.

- **Linting**: Ejecuta `pnpm lint` para verificar errores.
- **Formateo**: Ejecuta `pnpm format` para corregir estilos automáticamente.
- **Tipado**: Ejecuta `pnpm type-check` para verificar tipos de TypeScript.

Asegúrate de ejecutar estos comandos antes de enviar tu Pull Request.

### Base de Datos (Drizzle ORM)

Si realizas cambios en el esquema de la base de datos (`db/schemas`):

1.  Modifica los archivos de esquema necesarios.
2.  Genera la migración: `pnpm db:generate`
3.  Aplica la migración (localmente): `pnpm db:migrate`

No subas el archivo `.env` ni credenciales al repositorio.

### Pull Requests

1.  Asegúrate de que tu rama está actualizada con `main`.
2.  Abre un Pull Request describiendo tus cambios detalladamente.
3.  Vincula cualquier issue relacionado.
4.  Espera la revisión del equipo.

¡Feliz código!
