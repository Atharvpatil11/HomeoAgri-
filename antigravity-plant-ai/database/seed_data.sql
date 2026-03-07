INSERT INTO plants (name, species, status, moisture, light, temp, image_url) VALUES 
('Monstera Deliciosa', 'Araceae', 'Healthy', 65.0, 8.0, 24.0, 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80'),
('Fiddle Leaf Fig', 'Moraceae', 'Warning', 40.0, 6.0, 22.0, 'https://images.unsplash.com/photo-1615456485078-43d56d788e04?auto=format&fit=crop&w=600&q=80'),
('Snake Plant', 'Asparagaceae', 'Healthy', 30.0, 4.0, 26.0, 'https://images.unsplash.com/photo-1599818815330-90c79e6dcaa9?auto=format&fit=crop&w=600&q=80');

INSERT INTO sensor_readings (plant_id, moisture, light, temp) VALUES
(1, 64.5, 7.8, 23.9),
(1, 65.0, 8.0, 24.0),
(2, 40.0, 6.0, 22.0),
(3, 30.0, 4.0, 26.0);
