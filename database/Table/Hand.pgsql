DROP TABLE IF EXISTS hand;
CREATE TABLE hand
(
    id              SERIAL PRIMARY KEY,
    seat_id         INTEGER NOT NULL,
    FOREIGN KEY (seat_id) REFERENCES seat (id)
);