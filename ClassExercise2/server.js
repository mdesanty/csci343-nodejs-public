const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const app = express();

const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const dbInfo = {
  host: "localhost",
  user: "root",
  password: "",
  database: "SongsDb"
};

const connection = mysql.createConnection(dbInfo);
connection.connect(function(err) {
  if(err) throw err;
});

const sessionOptions = {
  secret: "mike is awesome",
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 600000}
};
app.use(session(sessionOptions));

const http = require("http");
const fs = require("fs");

app.get("/", serveIndex);
app.get("/whoIsLoggedIn", whoIsLoggedIn);
app.get("/register", register);
app.get("/login", login);
app.get("/logout", logout);
app.get("/songs", listSongs);
app.get("/songs/add", addSong);
app.get("/songs/remove", removeSong);
app.get("/songs/clear", clearSongs);
app.listen(3000, "localhost", startHandler);

function startHandler() {
  console.log("Server listening at http://localhost:3000");
}

function serveIndex(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});

  let index = fs.readFileSync("index.html");
  res.end(index);
}

function whoIsLoggedIn(req, res) {
  if(req.session.user == undefined)
    writeResult(res, {user: undefined});
  else
    writeResult(res, {user: req.session.user});
}

function register(req, res) {
  if(!validateEmail(req.query.email)) {
    writeResult(res, {error: "Email is not valid."});
    return;
  }

  if(!validatePassword(req.query.password)) {
    writeResult(res, {error: "Password must be at least eight characters and must contain at least one letter and number."});
    return;
  }

  let email = getEmail(req);
  let password = bcrypt.hashSync(req.query.password, 12);

  connection.query("INSERT INTO Users (Email, Password) VALUES (?, ?)", [email, password], function(err, dbResult) {
    if(err)
      writeResult(res, {error: "Error creating user: " + err.message});
    else {
      connection.query("SELECT Id, Email FROM Users WHERE Email = ?", [email], function(err, dbResult) {
        if(err)
          writeResult(res, {error: err.message});
        else {
          req.session.user = buildUser(dbResult[0]);
          writeResult(res, {user: req.session.user});
        }
      });
    }
  });
}

function login(req, res) {
  if(!req.query.email || !req.query.password) {
    writeResult(res, {error: "Email is required."});
    return;
  }

  let email = getEmail(req);
  connection.query("SELECT Id, Email, Password FROM Users WHERE Email = ?", [email], function(err, dbResult) {
    if(err)
      writeResult(res, {error: err.message});
    else {
      if(dbResult.length == 1 && bcrypt.compareSync(req.query.password, dbResult[0].Password)) {
        req.session.user = buildUser(dbResult[0]);
        writeResult(res, {user: req.session.user});
      }
      else {
        writeResult(res, {error: "Invalid email or password."});
      }
    }
  });
}

function logout(req, res) {
  req.session.user = undefined;
  writeResult(res, {user: undefined});
}

function listSongs(req, res) {
  if(!validateLoggedIn(req, res)) return;
  getAndListSongs(req, res);
}

function addSong(req, res) {
  if(!validateLoggedIn(req, res)) return;
  if(!validateSong(req, res)) return;

  connection.query("INSERT INTO Songs(UserId, Name) VALUES(?, ?)", [req.session.user.id, req.query.song], function(err, dbResult) {
    if(err)
      writeResult(res, {error: "Error creating song: " + err.message});
    else {
      getAndListSongs(req, res);
    }
  });
}

function removeSong(req, res) {
  if(!validateLoggedIn(req, res)) return;
  if(!validateSong(req, res)) return;

  connection.query("DELETE FROM Songs WHERE UserId = ? AND lower(Name) = ?", [req.session.user.id, req.query.song.toLowerCase()], function(err, dbResult) {
    if(err)
      writeResult(res, {error: "Error removing song: " + err.message});
    else {
      getAndListSongs(req, res);
    }
  });
}

function clearSongs(req, res) {
  if(!validateLoggedIn(req, res)) return;

  connection.query("DELETE FROM Songs WHERE UserId = ?", [req.session.user.id], function(err, dbResult) {
    if(err)
      writeResult(res, {error: "Error clearing songs: " + err.message});
    else {
      getAndListSongs(req, res);
    }
  });
}

function writeResult(res, object) {
  res.writeHead(200, {"Content-Type" : "application/json"});
  res.end(JSON.stringify(object));
}

function getEmail(req) {
  return String(req.query.email).toLowerCase();
}

function validateEmail(email) {
  if(!email) return false;
  return emailRegEx.test(email.toLowerCase());
}

function validatePassword(password) {
  if(!password) return false;
  return passwordRegEx.test(password);
}

function buildUser(dbObject) {
  return {id: dbObject.Id, email: dbObject.Email};
}

function validateLoggedIn(req, res) {
  if(!req.session.user) {
    writeResult(res, {error: "Please log in."});
    return false;
  }

  return true;
}

function validateSong(req, res) {
  if(!req.query.song) {
    writeResult(res, {error: "A song is required"});
    return false;
  }

  return true;
}

function getAndListSongs(req, res) {
  connection.query("SELECT Id, Name FROM Songs WHERE UserId = ?", [req.session.user.id], function(err, dbResult) {
    if(err)
      writeResult(res, {error: err.message});
    else {
      let songs = dbResult.map(function(song) {return buildSong(song)});
      writeResult(res, {user: req.session.user, songs: songs});
    }
  });
}

function buildSong(dbObject) {
  return {id: dbObject.Id, userId: dbObject.UserId, name: dbObject.Name};
}


