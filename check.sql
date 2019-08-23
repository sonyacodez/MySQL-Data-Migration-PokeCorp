USE sql_testing;

-- CREATE TABLE pokemon_type(
--     id INT NOT NULL AUTO_INCREMENT,
--     name VARCHAR(20),
--     PRIMARY KEY (id)
-- );

-- CREATE TABLE pokemon(
--     id INT NOT NULL AUTO_INCREMENT,
--     name VARCHAR(20),
--     height SMALLINT,
--     weight INT,
--     type INT,
--     FOREIGN KEY(type) REFERENCES pokemon_type (id),
--     PRIMARY KEY (id)
-- );

-- CREATE TABLE town(
--     id INT NOT NULL AUTO_INCREMENT,
--     name VARCHAR(20),
--     PRIMARY KEY (id)
-- );

-- CREATE TABLE trainer(
--     id INT NOT NULL AUTO_INCREMENT,
--     name VARCHAR(20),
--     town INT,
--     FOREIGN KEY(town) REFERENCES town (id),
--     PRIMARY KEY (id)
-- );

-- CREATE TABLE pokemon_trainer(
--     pokemon INT,
--     trainer INT,
--     FOREIGN KEY(pokemon) REFERENCES pokemon (id),
--     FOREIGN KEY(trainer) REFERENCES trainer (id)
-- );

-- SELECT p.id FROM pokemon AS p;
-- SELECT p.name FROM pokemon AS p WHERE p.id = 2115;
-- SELECT COUNT(*) FROM pokemon_trainer;

-- SELECT * FROM pokemon_type;
-- SELECT * FROM town;
-- SELECT * FROM pokemon;
-- SELECT * FROM trainer;
-- SELECT * FROM pokemon_trainer;

-- DELETE FROM pokemon_type;
-- DELETE FROM pokemon;
-- DELETE FROM town;
-- DELETE FROM trainer;
-- DELETE FROM pokemon_trainer;

-- DROP TABLE pokemon;
-- DROP TABLE pokemon_type;
-- DROP TABLE town;
-- DROP TABLE trainer;
-- DROP TABLE pokemon_trainer;
