-- Create custom types
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');

-- PROFILES TABLE
-- Stores public-facing profile information for each user.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Public-facing profile information for each user, linked to auth.users.';

-- Function to automatically create a profile for a new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, avatar_url)
    VALUES (new.id, 'patient', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created.
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- SPECIALTIES TABLE
-- Stores the list of medical specialties.
CREATE TABLE public.specialties (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.specialties IS 'List of medical specialties available.';

-- DOCTORS TABLE
-- Stores detailed information about doctors.
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty_id BIGINT NOT NULL REFERENCES public.specialties(id),
    experience_years INT,
    qualifications TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.doctors IS 'Stores detailed information for users with the "doctor" role.';


-- AVAILABILITY TABLE
-- Stores the time slots when doctors are available.
CREATE TABLE public.availability (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_doctor_time_slot UNIQUE (doctor_id, start_time)
);
COMMENT ON TABLE public.availability IS 'Stores doctors available time slots.';


-- APPOINTMENTS TABLE
-- Stores information about scheduled appointments.
CREATE TABLE public.appointments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    availability_id BIGINT REFERENCES public.availability(id) ON DELETE SET NULL, -- Can be null if availability slot is deleted
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    patient_concerns TEXT,
    ai_summary TEXT,
    status appointment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.appointments IS 'Scheduled appointments between patients and doctors.';

-- Function to mark availability as booked when an appointment is confirmed
CREATE OR REPLACE FUNCTION public.handle_appointment_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND NEW.availability_id IS NOT NULL THEN
        UPDATE public.availability
        SET is_booked = TRUE
        WHERE id = NEW.availability_id;
    ELSIF (NEW.status = 'cancelled' OR NEW.status = 'rejected') AND NEW.availability_id IS NOT NULL THEN
        UPDATE public.availability
        SET is_booked = FALSE
        WHERE id = NEW.availability_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for appointment confirmation
CREATE TRIGGER on_appointment_status_change
    AFTER UPDATE OF status ON public.appointments
    FOR EACH ROW EXECUTE PROCEDURE public.handle_appointment_status_change();
