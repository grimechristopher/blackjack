DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE account
(
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(255) NOT NULL,
    -- password        VARCHAR(255) NOT NULL,
    room_id         INTEGER,
    FOREIGN KEY (room_id) REFERENCES room (id)
);