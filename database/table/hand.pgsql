CREATE TABLE card (
	id SERIAL PRIMARY KEY,
	seat_id INTEGER, 
	final_value INTEGER,
	round_result VARCHAR(16),
	FOREIGN KEY (seat_id) REFERENCES seat (id) ON DELETE SET NULL
);