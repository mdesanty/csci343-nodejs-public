const express = require("express");
const app = express();

const session = require("express-session");
app.use(
  session(
    {
      secret: "happy jungle",
      resave: false,
      saveUninitialized: false,
      cookie: {maxAge: 600000}
    }
  )
);

const http = require("http");
const fs = require("fs");

app.get("/", serveIndex);
app.get("/finished", serveBetterIndex);
app.get("/songs", listSongs);
app.get("/songs/add", addSong);
app.get("/songs/remove", removeSong);
app.get("/songs/clear", clearSongs);
app.listen(3000, "localhost", startHandler());

function startHandler()
{
  console.log("Server listening on port 3000.");
}

function serveIndex(req, res)
{
  res.writeHead(200, {"Content-Type": "text/html"});

  let index = fs.readFileSync("index.html");
  res.end(index);
}

function serveBetterIndex(req, res)
{
  res.writeHead(200, {"Content-Type": "text/html"});

  let index = fs.readFileSync("index-reference.html");
  res.end(index);
}

function listSongs(req, res)
{
  let result = {};

  try
  {
    initializeSessionSongs(req);
    result = {result: req.session.songs.sort()};
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function addSong(req, res)
{
  let result = {};

  try
  {
    initializeSessionSongs(req);
    let song = req.query.song;

    if(song)
    {
      let lowerCaseSong = lowerCaseString(song);
      let lowerCaseSongs = lowerCaseArray(req.session.songs);

      if(!lowerCaseSongs.includes(lowerCaseSong)) {
        req.session.songs.push(song);
        result = {result: req.session.songs.sort()};
      }
      else {
        result = {error: "Song is already in the list."};
      }
    }
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function removeSong(req, res)
{
  let result = {};

  try
  {
    initializeSessionSongs(req);
    let song = req.query.song;

    if(song)
    {
      let lowerCaseSong = lowerCaseString(song);
      let lowerCaseSongs = lowerCaseArray(req.session.songs);

      let index = lowerCaseSongs.indexOf(lowerCaseSong);
      if (index !== -1) { req.session.songs.splice(index, 1); }
    }

    result = {result: req.session.songs.sort()};
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function clearSongs(req, res)
{
  let result = {};

  try
  {
    req.session.songs = [];
    result = {result: req.session.songs};
  }
  catch(e)
  {
    result = handleError(e);
  }
  finally
  {
    writeResult(res, result);
  }
}

function initializeSessionSongs(req)
{
  if (req.session.songs == undefined) { req.session.songs = []; }
}

function writeResult(res, result)
{
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
}

function handleError(e)
{
  console.log(e.stack);
  return {error: e.message};
}

function lowerCaseString(string)
{
  return string.toString().trim().toLowerCase()
}

function lowerCaseArray(array)
{
  return array.map(i => i.toString().toLowerCase())
}