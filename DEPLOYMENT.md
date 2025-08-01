# Deployment Strategy: Vercel & Supabase

This document provides a clear strategy for deploying and hosting the AI-assisted medical booking platform. We will use Vercel for the Next.js frontend and Supabase's hosted platform for the backend and database.

---

## 1. Backend & Database: Supabase

Your Supabase project is the backbone of the application. It's already hosted, but you need to manage the transition from local development to a live, production environment.

### Local Development (`supabase/`)
-   **Setup:** Use the Supabase CLI to run a local instance of the entire Supabase stack.
    -   Run `supabase start` to spin up the local database and services.
    -   The local migration files (`supabase/migrations/*`) are your source of truth for the database schema.
-   **Credentials:** Your local instance will use local-only credentials found in the CLI output.

### Production Environment (Supabase Cloud)
1.  **Create a Project:** Go to [database.new](https://database.new) and create a new Supabase project for your production application. Choose a strong database password and store it securely.
2.  **Apply Migrations:** Do **not** use the Supabase Studio UI to build your production schema. Use the CLI to ensure it perfectly matches your local setup.
    -   Link your local project to the cloud instance: `supabase link --project-ref <your-project-ref>`
    -   Push your migrations to the production database: `supabase db push`
3.  **Production Secrets:**
    -   If you plan to use Supabase Edge Functions that call the Gemini API, you must set the `GEMINI_API_KEY` as a secret in your Supabase project dashboard under `Settings > Edge Functions`. Run `supabase secrets set GEMINI_API_KEY=your_actual_key`.

---

## 2. Frontend Deployment: Vercel

Vercel is the recommended hosting platform for Next.js applications, offering seamless integration and performance optimizations.

### Step-by-Step Deployment
1.  **Push to Git:** Your entire project, including the `src`, `public`, and `supabase` directories, should be in a Git repository (e.g., on GitHub, GitLab, or Bitbucket).
2.  **Create a Vercel Project:**
    -   Sign up or log in to [vercel.com](https://vercel.com).
    -   Click "Add New... > Project".
    -   Import the Git repository you just created.
3.  **Configure the Project:**
    -   Vercel will automatically detect that it's a Next.js project and set the build commands correctly.
    -   The most critical step is configuring the **Environment Variables**.
4.  **Set Environment Variables:**
    -   In your Vercel project settings, navigate to `Settings > Environment Variables`.
    -   You need to add the credentials for **both** your production Supabase project and the Gemini API.
    -   **Client-Side (Public) Variables:** These are exposed to the browser.
        -   `NEXT_PUBLIC_SUPABASE_URL`: The URL of your production Supabase project.
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The `anon` (public) key for your production Supabase project.
    -   **Server-Side (Secret) Variable:** This is only accessible by server-side code (API routes, Server Components).
        -   `GEMINI_API_KEY`: Your Google Gemini API key. **Never** prefix this with `NEXT_PUBLIC_`.

### The CI/CD Workflow
-   Once connected, Vercel's CI/CD pipeline is automatic.
-   Every `git push` to your main branch will trigger a new production deployment.
-   Every `git push` to a pull request branch will trigger a preview deployment, allowing you to test changes on a unique URL before merging them into production.

---

## 3. Connecting the Pieces
-   Your Next.js application, hosted on Vercel, will communicate with your Supabase database using the production environment variables you set.
-   Client-side components will use the `NEXT_PUBLIC_` variables to interact with Supabase for tasks like real-time subscriptions.
-   Server-side API routes (like `/api/ai/*`) will use the server-side `GEMINI_API_KEY` to securely call the AI model without exposing the key to the browser.
-   The Row-Level Security policies you created in `0002_rls_policies.sql` are the primary guardians of your data, ensuring that even with the public URL and key, users can only access what they are permitted to.
