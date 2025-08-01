# Next.js Frontend Folder Structure

This document outlines a recommended folder structure for the AI-assisted medical booking platform, built with Next.js (App Router) and TypeScript. This structure is designed for scalability and separation of concerns.

```
.
├── .next/                  # Next.js build output
├── .vscode/                # VSCode settings
├── node_modules/           # Project dependencies
├── public/                 # Static assets (images, fonts, etc.)
├── supabase/               # Supabase migration scripts
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql
│   │   └── 0002_rls_policies.sql
│   └── ...
├── src/                    # Main source code directory (optional, but recommended)
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Route group for auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (main)/         # Route group for the main app after login
│   │   │   ├── patient/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx  # Patient-specific layout
│   │   │   ├── doctor/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx  # Doctor-specific layout
│   │   │   └── ...
│   │   ├── api/              # API Routes
│   │   │   ├── ai/
│   │   │   │   ├── symptom-triage/
│   │   │   │   │   └── route.ts
│   │   │   │   └── generate-summary/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── supabase/
│   │   │           └── route.ts
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   │
│   ├── components/         # React components
│   │   ├── auth/             # Components for login, signup forms
│   │   │   └── AuthForm.tsx
│   │   ├── doctor/           # Components for the doctor view
│   │   │   ├── AvailabilityManager.tsx
│   │   │   └── AppointmentRequests.tsx
│   │   ├── patient/          # Components for the patient view
│   │   │   ├── DoctorSearch.tsx
│   │   │   └── BookAppointmentModal.tsx
│   │   ├── shared/           # Components used across the app
│   │   │   ├── AppointmentCard.tsx
│   │   │   ├── Calendar.tsx
│   │   │   └── Navbar.tsx
│   │   └── ui/               # Generic UI elements (from Shadcn/UI, etc.)
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   │
│   ├── lib/                  # Library files, helpers, SDKs
│   │   ├── supabase/
│   │   │   ├── client.ts     # Supabase client for browser
│   │   │   └── server.ts     # Supabase client for server components/actions
│   │   ├── gemini.ts         # Google Gemini API client setup
│   │   ├── utils.ts          # Utility functions (e.g., date formatting)
│   │   └── constants.ts      # App-wide constants
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── useUserProfile.ts # Fetches user profile data
│   │
│   ├── styles/               # Global styles
│   │   └── globals.css
│   │
│   └── types/                # TypeScript type definitions
│       └── index.ts          # Main types file (e.g., Appointment, Doctor)
│
├── .env.local              # Environment variables (local)
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Key Concepts Explained:

-   **`src/` Directory:** Encapsulating the source code in `src/` is a common practice that separates your code from project configuration files at the root.
-   **App Router `(route-groups)`:** Using parentheses for folder names (e.g., `(auth)`, `(main)`) creates route groups. This allows you to share specific layouts within a group without affecting the URL path. For example, `(main)/patient/dashboard` will have the URL `/patient/dashboard` but can use the layout defined in `(main)/layout.tsx`.
-   **Component Organization:** Splitting components into `auth`, `doctor`, `patient`, `shared`, and `ui` makes the component tree easy to navigate and promotes reusability. `ui` components are "dumb" and style-agnostic, while `shared` components might contain business logic.
-   **`lib/` vs. `hooks/`:**
    -   `lib/` is for non-React code: SDK clients, utility functions, constants.
    -   `hooks/` is specifically for custom React hooks (`use...`) that encapsulate stateful logic.
-   **Supabase Clients (`client.ts` vs. `server.ts`):** It's a best practice to have separate Supabase client initializations for the browser (client components) and the server (server components, API routes, server actions) to manage authentication and environment variables securely.
