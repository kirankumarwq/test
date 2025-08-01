-- First, enable Row-Level Security (RLS) for all relevant tables.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Helper function to get the role of the currently authenticated user.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role AS $$
DECLARE
    role public.app_role;
BEGIN
    SELECT p.role INTO role FROM public.profiles p WHERE p.id = auth.uid();
    RETURN role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- POLICIES FOR: profiles
-- 1. Users can view all profiles (as they contain public info).
-- 2. Users can only update their own profile.
CREATE POLICY "Allow authenticated users to view all profiles"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow user to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);


-- POLICIES FOR: specialties
-- 1. Any authenticated user can view the list of specialties.
-- 2. Only service roles (backend) can modify specialties.
CREATE POLICY "Allow authenticated users to view all specialties"
    ON public.specialties FOR SELECT
    USING (auth.role() = 'authenticated');

-- No INSERT, UPDATE, DELETE policies for users. Managed by admins/service role.


-- POLICIES FOR: doctors
-- 1. Any authenticated user can view doctor details.
-- 2. Doctors can insert/update their own records.
CREATE POLICY "Allow authenticated users to view all doctors"
    ON public.doctors FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow doctor to insert their own doctor record"
    ON public.doctors FOR INSERT
    WITH CHECK (public.get_my_role() = 'doctor' AND id = auth.uid());

CREATE POLICY "Allow doctor to update their own doctor record"
    ON public.doctors FOR UPDATE
    USING (public.get_my_role() = 'doctor' AND id = auth.uid());


-- POLICIES FOR: availability
-- 1. Any authenticated user can view availability.
-- 2. Doctors can only create/manage their own availability.
CREATE POLICY "Allow authenticated users to view all availability"
    ON public.availability FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow doctor to create their own availability"
    ON public.availability FOR INSERT
    WITH CHECK (public.get_my_role() = 'doctor' AND doctor_id = auth.uid());

CREATE POLICY "Allow doctor to update/delete their own availability"
    ON public.availability FOR (UPDATE, DELETE)
    USING (public.get_my_role() = 'doctor' AND doctor_id = auth.uid());


-- POLICIES FOR: appointments
-- 1. Patients can only see their own appointments.
-- 2. Doctors can only see appointments scheduled with them.
-- 3. Patients can only create appointments for themselves.
-- 4. Doctors can update appointments scheduled with them (e.g., to confirm).
-- 5. Patients can update their own appointments (e.g., to cancel).
CREATE POLICY "Allow users to see their own appointments"
    ON public.appointments FOR SELECT
    USING (
        (public.get_my_role() = 'patient' AND patient_id = auth.uid()) OR
        (public.get_my_role() = 'doctor' AND doctor_id = auth.uid())
    );

CREATE POLICY "Allow patient to create an appointment"
    ON public.appointments FOR INSERT
    WITH CHECK (public.get_my_role() = 'patient' AND patient_id = auth.uid());

CREATE POLICY "Allow users to update their own appointments"
    ON public.appointments FOR UPDATE
    USING (
        (public.get_my_role() = 'patient' AND patient_id = auth.uid()) OR
        (public.get_my_role() = 'doctor' AND doctor_id = auth.uid())
    );

-- Note: Deletion of appointments is often handled by changing status to 'cancelled',
-- so a DELETE policy might not be needed. We allow updates to status instead.
