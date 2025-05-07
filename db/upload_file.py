import os
import psycopg2
from dotenv import load_dotenv

# Load your .env, which should contain:
#    SUPABASE_DB_URL=postgres://postgres:postgres@localhost:54322/postgres
load_dotenv()

def upload_pdf(path: str):
    # Connect to Postgres
    conn = psycopg2.connect(os.getenv("SUPABASE_DB_URL"))
    try:
        with conn:
            with conn.cursor() as cur:
                # Read the PDF file
                with open(path, "rb") as f:
                    pdf_bytes = f.read()

                # Run the INSERT; trigger will set cid = digest(data, 'sha256')
                cur.execute("""
                    INSERT INTO public.pdf_store (data, filename)
                    VALUES (%s, %s)
                    ON CONFLICT (cid) DO NOTHING
                    RETURNING encode(cid, 'hex');
                """, (psycopg2.Binary(pdf_bytes), os.path.basename(path)))

                row = cur.fetchone()
                if row:
                    print(f"✔ Stored new PDF with CID: {row[0]}")
                else:
                    print("ℹ PDF already exists (duplicate CID)")

    finally:
        conn.close()

if __name__ == "__main__":
    # Point this at your PDF
    upload_pdf(input("File path>"))
