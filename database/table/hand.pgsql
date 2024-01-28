CREATE TABLE card (
	id SERIAL PRIMARY KEY,
	suit VARCHAR(8) NOT NULL,
	value INTEGER NOT NULL,
	room_id INTEGER NOT NULL,
	hand_id INTEGER,
	FOREIGN KEY (room_id) REFERENCES room (id) ON DELETE CASCADE,
  FOREIGN KEY (hand_id) REFERENCES hand (id) ON DELETE SET NULL
);	