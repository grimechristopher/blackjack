CREATE TABLE seat (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  account_active_id INTEGER,
  account_next_id INTEGER,
  status VARCHAR(64) DEFAULT 'Inactive' NOT NULL
  FOREIGN KEY (room_id) REFERENCES room (id) ON DELETE SET NULL,
  FOREIGN KEY (account_active_id) REFERENCES account (id) ON DELETE SET NULL,
  FOREIGN KEY (account_next_id) REFERENCES account (id) ON DELETE SET NULL
);