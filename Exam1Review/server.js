/*
 * Test URLs:
 *
 * http://localhost:3000/?cmd=
 *
 * http://localhost:3000/?cmd=calcRun
 * http://localhost:3000/?cmd=calcRun&miles=
 * http://localhost:3000/?cmd=calcRun&miles=dog
 * http://localhost:3000/?cmd=calcRun&miles=-5
 * http://localhost:3000/?cmd=calcRun&miles=10
 *
 * http://localhost:3000/?cmd=calcWalk
 * http://localhost:3000/?cmd=calcWalk&miles=
 * http://localhost:3000/?cmd=calcWalk&miles=dog
 * http://localhost:3000/?cmd=calcWalk&miles=-5
 * http://localhost:3000/?cmd=calcWalk&miles=10
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

    if (!query["cmd"]) { throw Error("A command must be specified."); }

    let contentType = "";
    let result = {};

    switch(query["cmd"])
    {
      case "calcWalk":
        result = calcTravel("Walk", query);
        break;
      case "calcRun":
        result = calcTravel("Run", query);
        break;
      default:
        throw Error("Invalid command: " + query['cmd'] + ".");
    }

    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(result));
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

function calcTravel(mode, query)
{
  if(!query["miles"]) { throw Error("Miles is required."); }
  if(isNaN(query["miles"])) { throw Error("Miles must be a number."); }
  if(parseInt(query["miles"]) < 0) { throw Error("Miles cannot be negative."); }

  let miles = parseInt(query["miles"]);
  minutes = miles * minutesPerMile(mode);

  let result = {};
  result[`miles${mode}`] = miles;
  result["minutes"] = minutes;

  return result;
}

function minutesPerMile(mode)
{
  let rate = 0;
  switch(mode)
  {
    case "Walk":
      rate = 20;
      break;
    case "Run":
      rate = 10;
      break;
  }

  return rate;
}