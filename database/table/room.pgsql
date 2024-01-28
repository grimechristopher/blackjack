CREATE TABLE room (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    seat_amount INTEGER DEFAULT 8,  
    deck_amount INTEGER DEFAULT 8, 
    status VARCHAR(255) DEFAULT 'Inactive'
);