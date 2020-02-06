const http = require("http");
const server = http.createServer(requestHandler);
server.listen(3000, process.env.IP, startHandler);

const url = require("url");

function startHandler()
{
  let address = server.address();
  console.log("Server listening at", address.address + ":" + address.port);
}

function requestHandler(req, res)
{
  try
  {
    let urlParts = url.parse(req.url, true);
    let query = urlParts.query;

    res.writeHead(200, {"Content-Type": "application/json"});

    if (query['cmd'] == undefined) { throw Error("A command must be specified"); }

    let result = {};
    switch(query["cmd"])
    {
      case "add":
        result = add(query);
        break;
      case "sub":
        result = subtract(query);
        break;
      default:
        throw Error("Invalid command: " + query['cmd'] + ".");
    }

    res.write(JSON.stringify(result));
  }
  catch (error)
  {
    let errorMessage = {"error" : error.message};
    res.write(JSON.stringify(errorMessage));
  }

  res.end("");
}

function add(query)
{
  if (query['num'] == undefined || query["num"].length < 2) { throw Error("Expecting at least two numbers"); }

  let sum = 0;
  for (let i in query["num"]) { sum += parseInt(query["num"][i]); }

  let result = {"sum" : sum};
  return result;
}

function subtract(query)
{
  if (query["num"] == undefined || query["num"].length < 2) { throw Error("Expecting at least two numbers"); }

  let difference = query["num"][0];
  for (let i = 1; i < query["num"].length; i++)
  {
    let num = query["num"][i];
    difference -= parseInt(query["num"][i]);
  }

  let result = {"difference" : difference};
  return result;
}