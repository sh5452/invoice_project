CREATE TABLE return_items(
    id SERIAL PRIMARY KEY,
    return_id INT NOT NULL
    REFERENCES returns(id),
    order_item_id INT NOT NULL
    REFERENCES order_items(id),
    quantity_returned INT NOT NULL

);