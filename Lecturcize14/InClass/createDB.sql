DROP DATABASE IF EXISTS Lecturcize14Db;

CREATE DATABASE Lecturcize14Db;
USE Lecturcize14Db;

CREATE TABLE Users (
  Id int NOT NULL AUTO_INCREMENT,
  Email varchar(255) UNIQUE NOT NULL,
  Password varchar(60) NOT NULL,
  PRIMARY KEY(id)
);