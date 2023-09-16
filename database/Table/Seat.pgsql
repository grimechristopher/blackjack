DROP TABLE IF EXISTS seat CASCADE;
CREATE TABLE seat
(
    id              SERIAL PRIMARY KEY,
    room_id         INTEGER NOT NULL,
    number          INTEGER NOT NULL,
    account_id      INTEGER,
    account_id_next INTEGER,
    status          INTEGER,
    FOREIGN KEY (room_id) REFERENCES room (id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE SET NULL,
    FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE SET NULL
);