/*
 * Example URLs:
 * http://localhost:3000/?cmd=add&num[]=3&num[]=4
 *  => {"sum":7}
 *
 * http://localhost:3000/?cmd=add
 *  => {"error":"Expecting at least two numbers"}
 *
 * http://localhost:3000/?cmd=add&num[]=3
 *  => {"error":"Expecting at least two numbers"}
 *
 * http://localhost:3000/?cmd=subtract&num[]=6&num[]=2
 *  => {"difference":4}
 *
 * http://localhost:3000/?cmd=subtract
 *  => {"error":"Expecting at least two numbers"}
 *
 * http://localhost:3000/?cmd=subtract&num[]=6
 *  => {"error":"Expecting at least two numbers"}
 *
 * http://localhost:3000/
 *  => {"error":"A command must be specified."}
 *
 * http://localhost:3000/?cmd=stuff
 *  => {"error":"Invalid command: stuff"}
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
    res.writeHead(200, {"Content-Type": "application/json"});

    if (query['cmd'] == undefined) { throw Error("A command must be specified."); }

    let result = {};

    switch(query["cmd"])
    {
      case "add":
        result = add(query);
        break;
      case "subtract":
        result = subtract(query);
        break;
      default:
        throw Error("Invalid command: " + query['cmd'] + ".");
    }

    res.write(JSON.stringify(result));
    res.end("");
  }
  catch (e)
  {
    let error = {"error" : e.message};

    res.write(JSON.stringify(error));
    res.end("");
  }
}

function getQuery(req)
{
  let urlParts = url.parse(req.url, true);
  let query = queryString.parse(urlParts.query);

  return query;
}

function add(query)
{
  if (query["num"] == undefined || query["num"].length < 2) { throw Error("Expecting at least two numbers"); }

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