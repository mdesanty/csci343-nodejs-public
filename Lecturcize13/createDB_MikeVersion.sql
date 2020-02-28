DROP DATABASE IF EXISTS SongsDb;

CREATE DATABASE SongsDb;

use SongsDb;

CREATE TABLE Songs (
    Id int NOT NULL AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    PRIMARY KEY (Id)
);

INSERT INTO Songs (Name) VALUES ('Happy Birthday');
INSERT INTO Songs (Name) VALUES ('Mary Had A Little Lamb');
INSERT INTO Songs (Name) VALUES ('Here Comes The Sun');