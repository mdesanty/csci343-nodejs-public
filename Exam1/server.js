const http = require("http");
const server = http.createServer(requestHandler);

const url = require("url");
const queryString = require("qs");

server.listen(3000, process.env.IP, startHandler);

function startHandler()
{
  let address = server.address();
  console.log("Server listening at " + address.address + ":" + address.port);
}

function requestHandler(req, res)
{
  let result = {};

  try
  {
    let query = getQuery(req);

    if (!query["cmd"]) { throw Error("A command must be specified."); }

    switch(query["cmd"])
    {
      case "calcDistance":
        result = calcDistance(query);
        break;
      case "calcCost":
        result = calcCost(query);
        break;
      default:
        throw Error("Invalid command: " + query['cmd'] + ".");
    }

  }
  catch (e)
  {
    result = {"error" : e.message};
    console.log(e.stack);
  }

  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
}

function getQuery(req)
{
  let urlParts = url.parse(req.url, true);
  let query = queryString.parse(urlParts.query);

  return query;
}

function calcDistance(query)
{
  validateNumericParameter(query["budget"], "budget");
  validateNumericParameter(query["mpg"], "mpg");
  validateNumericParameter(query["fuelCost"], "fuelCost");

  let budget = parseFloat(query["budget"]);
  let mpg = parseFloat(query["mpg"]);
  let fuelCost = parseFloat(query["fuelCost"]);

  let gallons = budget / fuelCost;
  let distance = gallons * mpg;

  let result = {distance: distance.toFixed(2)};
  return result;
}

function validateNumericParameter(parameter, parameterName)
{
  if(!parameter) { throw Error(`${parameterName} is required.`); }
  if(isNaN(parameter)) { throw Error(`${parameterName} must be a number.`); }
  if(parameter < 0) { throw Error(`${parameterName} cannot be negative.`); }
}

function calcCost(query)
{
  validateNumericParameter(query["distance"], "distance");
  validateNumericParameter(query["mpg"], "mpg");
  validateNumericParameter(query["fuelCost"], "fuelCost");

  let distance = parseFloat(query["distance"]);
  let mpg = parseFloat(query["mpg"]);
  let fuelCost = parseFloat(query["fuelCost"]);

  let gallons = distance / mpg;
  let cost = gallons * fuelCost;

  let result = {cost: cost.toFixed(2)};
  return result;
}