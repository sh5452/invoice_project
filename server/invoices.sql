CREATE TABLE invioces(
id SERIAL PRIMARY KEY,
id_order INTEGER REFERENCES orders(id),
file_url TEXT,
invoice_number VARCHAR(50),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);