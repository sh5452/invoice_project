CREATE TABLE return_items(
    id SREIAL PRIMARY KEY,
    return_id INT NOT NULL
    REFERENCES return_items(id),
    order_items_id INT NOT NULL
    REFERENCES order_items(id),
    quantity_returned INT NOT NULL

);