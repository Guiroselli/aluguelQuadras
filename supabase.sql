-- Supabase schema for the condominium booking system.
-- This script recreates the rentals table and resets existing reservations.
-- Run it in the Supabase SQL Editor for the target project.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS public.rentals CASCADE;

CREATE TABLE public.rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    court VARCHAR(50) NOT NULL CHECK (court IN ('tennis-blue', 'tennis-red', 'soccer')),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    house_street VARCHAR(255) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.rentals
    ADD CONSTRAINT check_one_hour_duration
        CHECK (end_time = start_time + interval '1 hour'),
    ADD CONSTRAINT check_exact_hour
        CHECK (EXTRACT(MINUTE FROM start_time) = 0 AND EXTRACT(SECOND FROM start_time) = 0),
    ADD CONSTRAINT check_operating_window
        CHECK (start_time >= TIME '06:00' AND end_time <= TIME '23:00'),
    ADD CONSTRAINT unique_court_booking
        UNIQUE (court, date, start_time);

CREATE INDEX idx_rentals_user_lookup ON public.rentals (user_id, date, start_time);
CREATE INDEX idx_rentals_unit_lookup ON public.rentals (date, house_number, house_street);

CREATE OR REPLACE FUNCTION public.get_authenticated_resident()
RETURNS TABLE (
    resident_name TEXT,
    resident_street TEXT,
    resident_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    auth_user auth.users;
BEGIN
    SELECT *
      INTO auth_user
      FROM auth.users
     WHERE id = auth.uid();

    IF auth_user.id IS NULL THEN
        RAISE EXCEPTION 'Voce precisa estar autenticado para usar o sistema.';
    END IF;

    resident_name := trim(COALESCE(
        auth_user.raw_user_meta_data ->> 'user_name',
        auth_user.raw_user_meta_data ->> 'userName',
        ''
    ));
    resident_street := trim(COALESCE(
        auth_user.raw_user_meta_data ->> 'house_street',
        auth_user.raw_user_meta_data ->> 'houseStreet',
        ''
    ));
    resident_number := trim(COALESCE(
        auth_user.raw_user_meta_data ->> 'house_number',
        auth_user.raw_user_meta_data ->> 'houseNumber',
        ''
    ));

    IF resident_name = '' OR resident_street = '' OR resident_number = '' THEN
        RAISE EXCEPTION 'Sua conta nao possui os dados obrigatorios do morador. Atualize o cadastro e tente novamente.';
    END IF;

    RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_rental_owner_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    resident RECORD;
BEGIN
    SELECT *
      INTO resident
      FROM public.get_authenticated_resident();

    NEW.user_id := auth.uid();
    NEW.user_name := resident.resident_name;
    NEW.house_street := resident.resident_street;
    NEW.house_number := resident.resident_number;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_rental_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    current_local_ts TIMESTAMP := timezone('America/Sao_Paulo', now());
    booking_start_ts TIMESTAMP := NEW.date::timestamp + NEW.start_time;
    has_reservation_same_day BOOLEAN;
BEGIN
    IF booking_start_ts <= current_local_ts THEN
        RAISE EXCEPTION 'Nao e possivel reservar um horario que ja comecou ou passou.';
    END IF;

    IF NEW.date > (current_local_ts::date + 7) THEN
        RAISE EXCEPTION 'As reservas so podem ser feitas com ate 7 dias de antecedencia.';
    END IF;

    SELECT EXISTS (
        SELECT 1
          FROM public.rentals rentals
         WHERE rentals.date = NEW.date
           AND lower(trim(rentals.house_street)) = lower(trim(NEW.house_street))
           AND trim(rentals.house_number) = trim(NEW.house_number)
           AND (TG_OP <> 'UPDATE' OR rentals.id <> NEW.id)
    )
      INTO has_reservation_same_day;

    IF has_reservation_same_day THEN
        IF NEW.date > current_local_ts::date THEN
            RAISE EXCEPTION 'Voce ja possui uma reserva antecipada para este dia. So e permitida uma reserva antecipada por dia para a mesma unidade.';
        END IF;

        IF booking_start_ts > current_local_ts + interval '1 hour' THEN
            RAISE EXCEPTION 'Voce ja possui uma reserva para hoje. Uma nova reserva so pode ser feita com no maximo 1 hora de antecedencia do horario desejado.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_rental_cancellation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    current_local_ts TIMESTAMP := timezone('America/Sao_Paulo', now());
    booking_start_ts TIMESTAMP := OLD.date::timestamp + OLD.start_time;
BEGIN
    IF booking_start_ts <= current_local_ts THEN
        RAISE EXCEPTION 'Nao e possivel cancelar uma reserva que ja comecou ou terminou.';
    END IF;

    IF booking_start_ts < current_local_ts + interval '2 hours' THEN
        RAISE EXCEPTION 'O cancelamento so pode ser feito com pelo menos 2 horas de antecedencia.';
    END IF;

    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_rentals_set_owner_data ON public.rentals;
CREATE TRIGGER trg_rentals_set_owner_data
BEFORE INSERT ON public.rentals
FOR EACH ROW
EXECUTE FUNCTION public.set_rental_owner_data();

DROP TRIGGER IF EXISTS trg_rentals_validate_insert ON public.rentals;
CREATE TRIGGER trg_rentals_validate_insert
BEFORE INSERT ON public.rentals
FOR EACH ROW
EXECUTE FUNCTION public.validate_rental_rules();

DROP TRIGGER IF EXISTS trg_rentals_validate_delete ON public.rentals;
CREATE TRIGGER trg_rentals_validate_delete
BEFORE DELETE ON public.rentals
FOR EACH ROW
EXECUTE FUNCTION public.validate_rental_cancellation();

ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read rentals" ON public.rentals;
CREATE POLICY "Authenticated users can read rentals"
    ON public.rentals
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create their own rentals" ON public.rentals;
CREATE POLICY "Authenticated users can create their own rentals"
    ON public.rentals
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can delete their own rentals" ON public.rentals;
CREATE POLICY "Authenticated users can delete their own rentals"
    ON public.rentals
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

REVOKE ALL ON public.rentals FROM anon;
GRANT SELECT, INSERT, DELETE ON public.rentals TO authenticated;
