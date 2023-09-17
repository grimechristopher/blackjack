DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE account
(
    id                  SERIAL PRIMARY KEY,
    username            VARCHAR(255) NOT NULL,
    -- password            VARCHAR(255) NOT NULL,
    room_id             INTEGER,
    count_wins          INTEGER DEFAULT 0,
    count_losses        INTEGER DEFAULT 0,
    count_draws         INTEGER DEFAULT 0,
    count_blackjacks    INTEGER DEFAULT 0,
    count_busts         INTEGER DEFAULT 0,

    FOREIGN KEY (room_id) REFERENCES room (id)
);