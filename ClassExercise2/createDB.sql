DROP DATABASE IF EXISTS SongsDb;

CREATE DATABASE SongsDb;

use SongsDb;

CREATE TABLE Users (
    Id int NOT NULL AUTO_INCREMENT,
    Email varchar(255) UNIQUE NOT NULL,
    Password varchar(60) NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE Songs (
    Id int NOT NULL AUTO_INCREMENT,
    UserId int NOT NULL,
    Name varchar(255) NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    PRIMARY KEY (Id),
    UNIQUE KEY `UniqueUserIdAndName` (`UserId`,`Name`)
);