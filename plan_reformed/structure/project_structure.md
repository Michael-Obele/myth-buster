### Project Structure

The Myth Buster application follows a standard SvelteKit directory structure, designed for clarity and organization. This structure separates concerns, with page and endpoint routes defined in `src/routes/`, reusable components and utility logic in `src/lib/`, and static assets in `static/`.

The key directories and their purposes are as follows:

*   `src/routes/`: Contains all the route-specific files for pages (`+page.svelte`), server-side logic (`+page.server.ts`), and API endpoints (`+server.ts`). Subdirectories within `routes` are used to define nested routes and route groups (like `(auth)`).
*   `src/lib/`: Houses reusable code, including Svelte components, utility functions, stores, and server-side modules that are shared across routes. This promotes code reusability and maintainability.
*   `static/`: Stores static assets that are served directly by the web server, such as images, fonts, and external libraries like Lottie JSON files.
*   `tests/`: (Based on the original plan) Intended for housing various types of test files, including unit tests, component tests, and end-to-end tests.
*   `.svelte-kit/`: Generated build output and development server files. This directory is managed by SvelteKit and should not be manually edited.
*   `tailwind.config.ts`, `vite.config.ts`, `tsconfig.json`, `package.json`: Configuration files for Tailwind CSS, Vite, TypeScript, and npm/bun package management, respectively.

Here is a simplified representation of the project directory tree:

```
myth-buster/
├── .svelte-kit/         # SvelteKit build output (generated)
├── src/
│   ├── lib/               # Reusable application code
│   │   ├── components/    # Svelte components
│   │   ├── server/        # Server-side modules (auth, db, etc.)
│   │   ├── api/           # API client logic
│   │   ├── stores/        # Svelte stores / Runed state
│   │   └── utils/         # Utility functions
│   ├── routes/            # Application routes (pages and endpoints)
│   │   ├── (auth)/        # Authentication route group
│   │   │   ├── profile/
│   │   │   ├── signin/
│   │   │   ├── signout/
│   │   │   └── signup/
│   │   ├── api/           # Custom API endpoints
│   │   │   └── community/ # Community API logic
│   │   ├── app/           # Main myth verification page
│   │   ├── about/         # About page
│   │   ├── community/     # Community page
│   │   ├── game/          # Game page
│   │   └── +layout.svelte # Root layout (e.g., Navbar)
│   │   └── +page.svelte   # Landing page
│   └── app.css          # Global styles
├── static/                # Static assets (images, fonts, lottie, etc.)
├── tests/                 # Test files (unit, e2e, etc.)
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── package.json           # Project dependencies and scripts
├── README.md              # Project README
└── ... (other configuration files)
```

This structure facilitates modularity, simplifies navigation between related files, and aligns with SvelteKit's conventions.