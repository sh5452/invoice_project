CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,

    company VARCHAR(150) NOT NULL,

    customer_company VARCHAR(150),

    role VARCHAR(50) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    is_active BOOLEAN DEFAULT TRUE,

    password_hash TEXT,

    company_id INTEGER,

    customer_company_id INTEGER,

    CONSTRAINT fk_users_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id),

    CONSTRAINT fk_users_customer_company
        FOREIGN KEY (customer_company_id)
        REFERENCES companies(id)
);