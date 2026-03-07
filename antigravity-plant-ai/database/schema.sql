-- SQLite schema for Antigravity Plant AI

CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    species TEXT,
    status TEXT DEFAULT 'Healthy',
    moisture REAL,
    light REAL,
    temp REAL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER,
    moisture REAL,
    light REAL,
    temp REAL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(plant_id) REFERENCES plants(id)
);

CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_readings_plant_id ON sensor_readings(plant_id);
