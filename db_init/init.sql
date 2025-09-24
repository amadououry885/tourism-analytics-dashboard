-- Create sample tables
CREATE TABLE IF NOT EXISTS posts_raw (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50),
    content TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poi (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    location GEOGRAPHY(Point, 4326)
);

-- Insert dummy data
INSERT INTO posts_raw (platform, content)
VALUES 
('Twitter', 'Loved my trip to Langkawi!'),
('Instagram', 'Best beach in Kedah 🌊');

INSERT INTO poi (name, location)
VALUES 
('Langkawi Beach', ST_GeogFromText('SRID=4326;POINT(99.731 6.349)')),
('Gunung Jerai', ST_GeogFromText('SRID=4326;POINT(100.434 5.792)'));
