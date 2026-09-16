CREATE TABLE IF NOT EXISTS products
(
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    pack_size INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_products_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id),

    CONSTRAINT unique_product_sku_per_company
        UNIQUE (company_id, sku),

    CONSTRAINT positive_pack_size
        CHECK (pack_size > 0)
);