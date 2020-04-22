const express = require("express");
const session = require("express-session");

const http = require("http");
const fs = require("fs");

const app = express();

const sessionOptions = {
  secret: "mike is awesome",
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 600000}
};
app.use(session(sessionOptions));

app.get("/", serveIndex);
app.get("/game", game);
app.listen(3000,  "localhost", startHandler());

function startHandler() {
  console.log("Server listening on port 3000");
}

function serveIndex(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});
  var index = fs.readFileSync("index.html");
  res.end(index);
}

function game(req, res) {
  let result = {};

  try {
    if (!req.session.answer) { resetGame(req); }

    if (req.query.guess == undefined) {
      resetGame(req);
      result = {gameStatus: "Pick a number from 1 to 100.", guesses: req.session.guesses, gameOver: false};
      //result = {error: "test error."};
    }
    else {
      result = evaluateGuess(req, res);
    }
  }
  catch (e) {
    result = handleError(e);
  }

  if(result) { writeResult(res, result); }
}

function resetGame(req) {
  let max = req.query.max || 100;

  req.session.guesses = 0;
  req.session.answer = Math.floor(Math.random() * max) + 1;
}

function evaluateGuess(req, res) {
  validateGuess(req);

  if(isGuessCorrect(req)) {
    incrementGuesses(req);
    result = winGame(req, res);
  }
  else if(isGuessTooHigh(req)) {
    incrementGuesses(req);
    result = {gameStatus: "Too high. Guess again!", guesses: req.session.guesses, gameOver: false};
  }
  else {
    incrementGuesses(req);
    result = {gameStatus: "Too low. Guess again!", guesses: req.session.guesses, gameOver: false};
  }

  return result;
}

function validateGuess(req) {
  let guess = parseInt(req.query.guess);
  let message = `Guess must be a number between 1 and ${req.session.max}.`;

  if(isNaN(guess)) { throw Error(message); }
  if(guess < 1 || guess > 100) { throw Error(message); }
}

function isGuessCorrect(req) {
  return req.query.guess == req.session.answer
}

function winGame(req, res) {
  req.session.answer = undefined;

  result = {gameStatus: `Correct! It took you ${req.session.guesses} guesses. Play Again!`, guesses: req.session.guesses, gameOver: true};
  writeResult(res, result);
}

function incrementGuesses(req) {
  req.session.guesses += 1;
}

function isGuessTooHigh(req) {
  return req.query.guess > req.session.answer
}

function writeResult(res, result) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
}

function handleError(e){
  console.log(e.stack);
  return {error: e.message};
}