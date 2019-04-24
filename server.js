const express = require("express"); // importing a CommonJS module
const helmet = require("helmet");
const morgan = require("morgan");

const hubsRouter = require("./hubs/hubs-router.js");

const server = express();

//customed global middleware
function bouncer(req, res, next) {
  res.status(404).json("404 not found!");
}

// customed middleware
function cohortName(req, res, next) {
  req.cohort = "WEB18"; // middleware can modify the request
  next(); // go ahead and execute the next middleware/route handler
}
// write middleware that returns a 404 if the clock seconds are a multiple of 3
// and continues to the following middleware/router for all other cases
function notFoundError(req, res, next) {
  const seconds = new Date().getSeconds();

  if (seconds % 3 == 0) {
    // next(new Error("Bad Panda")); // for errorHandler middleware
    res.status(404).send("Not found!");
    // res.status(404).send(`${seconds} Not found!`);
  } else {
    next();
  }
}

function school(schoolName) {
  return function(req, res, next) {
    req.school = schoolName;
    next();
  };
}

// write a piece of middleware that accepts a name argument and checks that the request
// includes a name key that matches the name passed as an argument when using the middleware
// if the names match, let the request continue otherwise bounce it with a 403 http status
// use it locally like so: `only('frodo')`
function only(name) {
  return function(req, res, next) {
    if (name === req.headers.name) {
      next();
    } else {
      res.status(403).send("You shall not pass!");
    }
  };
}

// middleware modules
server.use(express.json()); // built-in no need to yarn add
/** help secure Express/Connect apps with various HTTP headers */
server.use(helmet()); // third party, need to yarn add it
server.use(cohortName);
// server.use(notFoundError);
//server.use(bouncer);
server.use(morgan("dev")); // third party, need to yarn add it
server.use(school("Lambda"));
// server.use(errorHandler);

// routing
server.use("/api/hubs", restricted, only("frodo"), hubsRouter);

// route handlers are middlewares
server.get("/", (req, res, next) => {
  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome ${req.cohort} to the ${req.school} Hubs API</p>
    `);
});

// function errorHandler(err, req, res, next) {
//   res.status(400).send("Bad Panda!");
// }

// GET > http://localhost:4000/api/hubs > SEND > Unauthorized access! > add key/value pair as password/none
// or just see in the browser
function restricted(req, res, next) {
  const password = req.headers.password;

  if (password === "none") {
    next();
  } else {
    res.status(401).send("Unauthorized access!");
  }
  // next();
}

module.exports = server;

// we can ready data from the body, url params, query string and headers
// three types: built-in, third party, custom
// we can use MW locally or globally
