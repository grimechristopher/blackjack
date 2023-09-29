DROP TABLE IF EXISTS room;
CREATE TABLE room
(
    id              SERIAL PRIMARY KEY,
    -- created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    current_turn    INTEGER NOT NULL DEFAULT 0,
    loop_status     VARCHAR(255) NOT NULL DEFAULT 'Inactive',
    current_action  VARCHAR(255) NOT NULL DEFAULT 'Start',
    round_count     INTEGER NOT NULL DEFAULT 0;
);