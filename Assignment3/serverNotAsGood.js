var express = require("express");
var app = express();

const session = require("express-session");
app.use(
  session(
    {
      secret: "happy jungle",
      resave: false,
      saveUninitialized: false,
      cookie: {maxAge: 60000}
    }
  )
);

app.get('/', listSongs);
app.get('/sort', sortSongs);
app.get('/add', addSong);
app.get('/remove', removeSong);
app.get('/clear', clearSongs);

app.listen(3000, process.env.IP, startHandler());

function startHandler()
{
  console.log("Server listerine on port 3000.");
}

function listSongs(req, res)
{
  let result = {};

  try
  {
    if (req.session.songs == undefined) { req.session.songs = []; }
    result = {songs: req.session.songs};

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(JSON.stringify(result));
    res.end('');
  }
  catch(e)
  {
    error = {error: e.message};

    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(error));
    res.end('');
  }
}

function sortSongs(req, res)
{
  let result = {};

  try
  {
    if (req.session.songs == undefined) { req.session.songs = []; }
    result = {songs: req.session.songs.sort()};

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(result));
    res.end('');
  }
  catch(e)
  {
    error = {error: e.message};

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(error));
    res.end('');
  }
}

function addSong(req, res)
{
  let result = {};

  if (req.session.songs == undefined) { req.session.songs = []; }
  let song = req.query.song;

  if(song==undefined)
  {
    if(!req.session.songs.includes(song))
    {
      req.session.songs.push(song);
    }
    else
    {
      throw Error("The song is already there!");
    }
  }

  result = {songs: req.session.songs};

  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
  res.end('');
}

function removeSong(req, res){
  var result = {};

  try{
    var song = req.query.song;

    if(song){
      var index=req.session.songs.indexOf(song);
      if (index !== -1) { req.session.songs.splice(index, 1); }
    }

    result = {songs: req.session.songs};

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(result));
  }
  catch(e){
    error = {error: e.message};

    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(error));
    res.end('');
  }
}

function clearSongs(req, res)
{
  let result = {};

  try
  {
    if (req.session.songs == undefined) { req.session.songs = []; }
    result = {songs: req.session.songs};

    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(result));
    res.end('');
  }
  catch(e)
  {
    error = {error: e.message};

    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(error));
    res.end('');
  }
}