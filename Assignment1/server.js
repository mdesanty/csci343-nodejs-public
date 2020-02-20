/*
 * Example URLs:
 *
 * http://localhost:3000/?cmd=dotted&word1=The&word2=End
 * http://localhost:3000/?cmd=dotted&word1=ThisIsProbablyWayTooLongYes&word2=End
 * http://localhost:3000/?cmd=dotted&word1=ThisIsProbablyWayTooLongNo&word2=End
 *
 * http://localhost:3000/?cmd=numCheck&start=1&end=100
 * http://localhost:3000/?cmd=numCheck&start=-15&end=100
 * http://localhost:3000/?cmd=numCheck&start=-15
 * http://localhost:3000/?cmd=numCheck&start=-15&end=dog
 *
 * http://localhost:3000/?cmd=gradeStats&grades[]=90&grades[]=95&grades=85
 * http://localhost:3000/?cmd=gradeStats&grades=90&grades=95&grades=85
 * http://localhost:3000/?cmd=gradeStats&grades[]=90
 * http://localhost:3000/?cmd=gradeStats
 * http://localhost:3000/?cmd=gradeStats&grades[]=90&grades[]=95&grades=cat
 *
 * http://localhost:3000/?cmd=calculateRectangleProperties&length=5&width=10
 * http://localhost:3000/?cmd=calculateRectangleProperties&length=5&width=-10
 * http://localhost:3000/?cmd=calculateRectangleProperties&length=5
 * http://localhost:3000/?cmd=calculateRectangleProperties&width=5
 * http://localhost:3000/?cmd=calculateRectangleProperties&length=5&width=ten
 *
 */

const http = require("http");
const server = http.createServer(requestHandler);

const url = require("url");
const queryString = require("qs");

server.listen(3000, process.env.IP, startHandler);

function startHandler()
{
  let address = server.address();
  console.log("Server listening at", address.address + ":" + address.port);
}

function requestHandler(req, res)
{
  try
  {
    let query = getQuery(req);

    if (query["cmd"] == undefined) { throw Error("A command must be specified."); }

    let contentType = "";
    let result = {};

    switch(query["cmd"])
    {
      case "dotted":
        contentType = "html";
        result = dotted(query);
        break;
      case "numCheck":
        contentType = "html";
        result = numCheck(query);
        break;
      case "gradeStats":
        contentType = "json";
        result = gradeStats(query);
        break;
      case "calculateRectangleProperties":
        contentType = "json";
        result = calculateRectangleProperties(query);
        break;
      default:
        throw Error("Invalid command: " + query['cmd'] + ".");
    }

    switch(contentType)
    {
      case "html":
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write("<pre>" + result + "</pre>");
        break;
      case "json":
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(result));
        break;
    }
  }
  catch (e)
  {
    let error = {"error" : e.message};
    console.log(e.stack);

    res.write(JSON.stringify(error));
  }

  res.end("");
}

function getQuery(req)
{
  let urlParts = url.parse(req.url, true);
  let query = queryString.parse(urlParts.query);

  return query;
}

function dotted(query)
{
  let firstWord = query["word1"];
  let secondWord = query["word2"];

  let totalWordLength = firstWord.length + secondWord.length;

  if(totalWordLength >= 30) { throw Error("The words are too long. There is no room for ''. characters."); }

  let dots = ".".repeat(30 - totalWordLength);
  let result = firstWord + dots + secondWord;

  return result;
}

function numCheck(query)
{
  if(!query["start"] || !query["end"]) { throw Error("Both start and end are required."); }
  if(isNaN(query["start"]) || isNaN(query["end"])) { throw Error("Both start and end must be numbers."); }

  start = parseInt(query["start"]);
  end = parseInt(query["end"]);

  let result = "";

  for(let i = start; i <= end; i++)
  {
    value = ((i % 3 ? '' : 'Th') + (i % 5 ? '' : 'Fi') || i).toString();
    result += value + "\n";
  }

  return result;
}

function gradeStats(query)
{
  if(!query["grades"] || query["grades"].length < 1) { throw Error("At least one grades value is required."); }
  query["grades"].map(i => {if(isNaN(i)) { throw Error("All grades nust be numbers.") }});

  let grades = query["grades"].map(i => parseInt(i));

  let sum = grades.reduce((item, sum) => sum += item);
  let average = sum / grades.length;

  let minimum = Math.min(...grades);
  let maximum = Math.max(...grades);

  result = {"average": average, "minimum": minimum, "maximum": maximum};
  return result;
}

function calculateRectangleProperties(query)
{
  if(!query["length"] || !query["width"]) { throw Error("Length and width are required."); }
  if(isNaN(query["length"]) || isNaN(query["width"])) { throw Error("Length and width must both be numbers."); }

  let length = parseInt(query["length"]);
  let width = parseInt(query["width"]);

  if(length <= 0 || width <= 0) { throw Error("Length and width cannot be equal to or less than zero."); }

  let perimeter = (length + width) * 2;
  let area = length * width;

  let result = {"area": area, "perimeter": perimeter};
  return result;
}