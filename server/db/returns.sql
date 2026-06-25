CREATE TABLE returns(
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()

);