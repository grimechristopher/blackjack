DROP TABLE IF EXISTS room;
CREATE TABLE room
(
    id              SERIAL PRIMARY KEY,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    current_turn    INTEGER DEFAULT NULL,
);