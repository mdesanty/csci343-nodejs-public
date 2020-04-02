const express = require("express");
const app = express();

// install mysql module first using "npm install mysql"
const mysql = require("mysql");

// added so we can serve index.html...
const http = require("http");
const fs = require("fs");

const conInfo =
{
    host: "localhost",
    user: "root",
    password: "",
    database: "SONGDB"
};

const session = require("express-session");
const sessionOptions =
{
  secret: "happy jungle",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}
app.use(session(sessionOptions));

app.get("/", serveIndex);
app.get("/list", list);
app.get("/add", add);
app.get("/remove", remove);
app.get("/clear", clear);

app.listen(3000, "localhost", startHandler());

function startHandler()
{
  console.log("Server listening on port 3000");
}

function list(req, res)
{
  let con = mysql.createConnection(conInfo);
  con.connect(function(err)
  {
    if (err)
      writeResult(req, res, {error: err});
    else
    {
      con.query("SELECT * FROM SONG ORDER BY SONG_NAME", function (err, result)
      {
        if (err)
          writeResult(req, res, {error: err});
        else
          writeResult(req, res, {result: result});
      });
    }
  });
}

function add(req, res)
{
  if (req.query.song == undefined)
    writeResult(req, res, {error: "add requires you to enter a song"});
  else
  {
    let con = mysql.createConnection(conInfo);
    con.connect(function(err)
    {
      if (err)
        writeResult(req, res, {error: err});
      else
      {
        con.query("INSERT INTO SONG (SONG_NAME) VALUES (?)", [req.query.song], function (err, result)
        {
          if (err)
            writeResult(req, res, {error : err});
          else
          {
            con.query("SELECT * FROM SONG ORDER BY SONG_NAME", function (err, result)
            {
              if (err)
                writeResult(req, res, {error: err});
              else
                writeResult(req, res, {result: result});
            });
          }
        });
      }
    });
  }
}

function remove(req, res)
{
  if (req.query.song == undefined)
    writeResult(req, res, {error: "add requires you to enter a song"});
  else
  {
    let con = mysql.createConnection(conInfo);
    con.connect(function(err)
    {
      if (err)
        writeResult(req, res, {error: err});
      else
      {
        con.query("DELETE FROM SONG WHERE SONG_NAME = ?", [req.query.song], function (err, result)
        {
          if (err)
            writeResult(req, res, {error: err});
          else
          {
            con.query("SELECT * FROM SONG ORDER BY SONG_NAME", function (err, result)
            {
              if (err)
                writeResult(req, res, {error: err});
              else
                writeResult(req, res, {result: result});
            });
          }
        });
      }
    });
  }
}

function clear(req, res)
{
  let con = mysql.createConnection(conInfo);
  con.connect(function(err)
  {
    if (err)
      writeResult(req, res, {error: err});
    else
    {
      con.query("DELETE FROM SONG", function (err, result)
      {
        if (err)
          writeResult(req, res, {error: err});
        else
        {
          con.query("SELECT * FROM SONG ORDER BY SONG_NAME", function (err, result)
          {
            if (err)
              writeResult(req, res, {error: err});
            else
              writeResult(req, res, {result: result});
          });
        }
      });
    }
  });
}

function writeResult(req, res, obj)
{
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(obj));
}

// added so we can serve index.html...
function serveIndex(req, res)
{
  res.writeHead(200, {"Content-Type": "text/html"});
  var index = fs.readFileSync("index.html");
  res.end(index);
}