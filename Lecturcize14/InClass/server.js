const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const app = express();

const connectionInfo = {
  host: "localhost",
  user: "root",
  password: "",
  database: "Lecturcize14Db"
};

const sessionOptions = {
  secret: "Mike is awesome. Wow best teacher! - From some students.",
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 600000}
};
app.use(session(sessionOptions));

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

app.get("/", whoIsLoggedIn);
app.get("/register", register);
app.get("/login", login);
app.get("/logout", logout);
app.listen(3000, "localhost", startHandler);

function startHandler() {
  console.log("Server listening at http://localhost:3000");
}

function whoIsLoggedIn(req, res) {
  let result = {};
  if(req.session.user == undefined)
    result = {message: "No one is logged in."};
  else
    result = {user: req.session.user};

  writeResult(res, result);
}

function register(req, res) {
  if(!validateEmail(req.query.email)) {
    writeResult(res, {error: "Email is invalid."});
    return;
  }

  if(!validatePassword(req.query.password)) {
    writeResult(res, {error: "Password must be at least eight characters long and must contain at least one letter and number."});
    return;
  }

  let connection = mysql.createConnection(connectionInfo);
  connection.connect(function(err) {
    if(err)
      writeResult(res, {error: "Error connecting to the database: " + err.message});
    else {
      let hash = bcrypt.hashSync(req.query.password, 12);
      connection.query("INSERT INTO Users (Email, Password) VALUES (?, ?)", [req.query.email, hash], function(err, dbResult) {
        if(err)
          writeResult(res, {error: "Error creating user: " + err.message});
        else {
          connection.query("SELECT Id, Email FROM Users WHERE Email = ?", [req.query.email], function(err, dbResult) {
            if(err)
              writeResult(res, {error: err.message});
            else {
              req.session.user = {id: dbResult[0].Id, email: dbResult[0].Email};
              writeResult(res, {user: req.session.user});
            }
          });
        }
      });
    }
  });
}

function login(req, res) {
  if(!req.query.email || !req.query.password) {
    writeResult(res, {error: "Email and password are required."});
    return;
  }

  let connection = mysql.createConnection(connectionInfo);
  connection.connect(function(err) {
    if(err)
      writeResult(res, {error: "Error connecting to the database: " + err.message});
    else {
      connection.query("SELECT Id, Email, Password FROM Users WHERE Email = ?", [req.query.email], function(err, dbResult) {
        if(err)
          writeResult(res, {error: err.message});
        else {
          let result = {};
          if(dbResult.length == 1 && bcrypt.compareSync(req.query.password, dbResult[0].Password)) {
            req.session.user = {id: dbResult[0].Id, email: dbResult[0].Email};
            result = {user: req.session.user};
          }
          else {
            result = {error: "Invalid email or password."};
          }
          writeResult(res, result);
        }
      });
    }
  });
}

function logout(req, res) {
  req.session.user = undefined;
  writeResult(res, {message: "No one is logged in."});
}

function writeResult(res, object) {
  res.writeHead(200, {"Content-Type" : "application/json"});
  res.end(JSON.stringify(object));
}

function validateEmail(email) {
  if(!email) return false;
  return emailRegex.test(email.toLowerCase());
}

function validatePassword(password) {
  if(!password) return false;
  return passwordRegex.test(password);
}










