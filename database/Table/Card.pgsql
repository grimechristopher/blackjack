DROP TABLE IF EXISTS card;
CREATE TABLE card
(
    id              SERIAL PRIMARY KEY,
    value           INTEGER NOT NULL,
    suit            VARCHAR(12) NOT NULL,
    face            VARCHAR(2) NOT NULL,
    hand_id         INTEGER,
    room_id         INTEGER NOT NULL,
    FOREIGN KEY (hand_id) REFERENCES hand (id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES room (id) ON DELETE CASCADE
);