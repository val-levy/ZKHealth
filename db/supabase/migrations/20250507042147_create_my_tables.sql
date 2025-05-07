-- 1) enable pgcrypto so we can use digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) our PDF store table
CREATE TABLE public.pdf_store (
  cid          BYTEA        PRIMARY KEY,        -- content ID = SHA256 of data
  filename     TEXT         NOT NULL,           -- original file name
  data         BYTEA        NOT NULL,           -- raw PDF bytes
  uploaded_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 3) trigger function to auto-compute cid before insert
CREATE OR REPLACE FUNCTION public.set_pdf_cid()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.cid := digest(NEW.data, 'sha256');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) fire it on every insert
CREATE TRIGGER trg_set_pdf_cid
  BEFORE INSERT ON public.pdf_store
  FOR EACH ROW EXECUTE FUNCTION public.set_pdf_cid();
