# Manual Testing Guide

This document provides instructions for manually testing the core features of the application.

## 1. Prerequisites

Before you begin, ensure you have completed the following steps:

1.  **Install Dependencies:** Open your terminal in the project root and run:
    ```bash
    npm install
    ```
    *(Note: This assumes you are using npm. If you use yarn or pnpm, use the corresponding command.)*

2.  **Set Up Environment Variables:**
    -   Create a file named `.env.local` in the project root.
    -   Add your Supabase project URL and anon key to this file. You can get these from your Supabase project dashboard under `Settings > API`.

    ```
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application should now be running at `http://localhost:3000`.

---

## 2. Authentication Flow Testing

### Test Case 2.1: User Sign-Up

**Objective:** Verify that a new user can create an account and receives a confirmation email.

**Steps:**

1.  Open your browser and navigate to `http://localhost:3000/signup`.
2.  The form defaults to "Sign In" mode. Click the **"Need an account?"** link at the bottom right of the form. The button text should change to "Sign Up".
3.  Enter a valid email address that you have access to.
4.  Enter a secure password (Supabase requires a minimum of 6 characters).
5.  Click the **"Sign Up"** button.

**Expected Result:**
-   You should be redirected to the home page with a message in the URL, like `/?message=Check-email-to-confirm-account`.
-   Go to your Supabase project dashboard and check the `Authentication > Users` section. You should see the new user with the email you provided, waiting for verification.
-   Check your email inbox for the confirmation email from Supabase.

### Test Case 2.2: User Sign-In

**Objective:** Verify that a confirmed user can successfully log in.

**Prerequisite:** You must have a confirmed user. Either click the link in the confirmation email from the previous test case or manually confirm the user in your Supabase dashboard.

**Steps:**
1.  Navigate to `http://localhost:3000/login`.
2.  The form should be in "Sign In" mode by default.
3.  Enter the email and password of the **confirmed** user.
4.  Click the **"Sign In"** button.

**Expected Result:**
-   You should be successfully redirected to the patient dashboard page at `http://localhost:3000/patient/dashboard`. Although this page is currently a placeholder, the redirect itself confirms that the login was successful.
-   Subsequent visits to protected pages should work without requiring a new login, as Supabase sets a session cookie.

---

## 3. Doctor's Availability Management

### Prerequisite: Create a Doctor User

This feature is only accessible to users with the `doctor` role. To create one for testing:

1.  **Sign up a new user** using the flow described in Test Case 2.1 and confirm their email.
2.  Go to your **Supabase Dashboard**.
3.  Navigate to **Table Editor > `profiles`**.
4.  Find the new user's profile and change their `role` from `patient` to `doctor`.
5.  Navigate to **Table Editor > `doctors`**.
6.  Click **"+ Insert row"**.
7.  Set the `id` to be the same user ID from the `profiles` table.
8.  Choose a `specialty_id` (you may need to add a specialty in the `specialties` table first if it's empty).
9.  Click **Save**. You now have a doctor account.

### Test Case 3.1: Add an Availability Slot

**Objective:** Verify that a logged-in doctor can add a new availability slot to their schedule.

**Steps:**

1.  Log in to the application using the **doctor account** you just configured. You should be redirected to the patient dashboard.
2.  Manually navigate to the doctor's dashboard at `http://localhost:3000/doctor/dashboard`.
3.  On the left side, you'll see the **"Manage Your Availability"** form.
4.  Select a future date and a valid start/end time (e.g., 10:00 AM to 11:00 AM).
5.  Click the **"Add Availability"** button.

**Expected Result:**
-   A success message should appear below the form (e.g., "Successfully added availability for...").
-   The page will refresh, and the new time slot will appear in the **"Your Upcoming Availability"** list on the right side.
-   You can verify in your Supabase Dashboard under **Table Editor > `availability`** that a new row has been created with the correct `doctor_id`, `start_time`, and `end_time`.
