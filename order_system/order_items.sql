CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_name VARCHAR(100),
    sku VARCHAR(50),
    quantity INTEGER,
    unit_type VARCHAR(50),
    price NUMERIC(10,2)
);