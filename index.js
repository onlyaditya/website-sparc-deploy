/* eslint-env node */

// ----- Initialize Express -----

var express = require("express");
require("dotenv").config();
var app = express();
var imagePaths = require("./helpers/imagePaths");

// ----- Configuration -----

var port = process.env.PORT || 3000;

var dbport = process.env.MONGODB_URI;

var routes = require("./routes.js");

// ----- Middleware -----

//Import the mongoose module
var mongoose = require("mongoose");

//Set up default mongoose connection
mongoose.connect(dbport, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// -----

var bodyParser = require("body-parser");

//To parse URL encoded data
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

//To parse json data
app.use(bodyParser.json());

// -----

app.set("view engine", "pug");
app.set("views", "./views");
app.locals.imagePaths = imagePaths;

// -----

var cors = require("cors");
app.use(cors());

// -----

var favicon = require("serve-favicon");
app.use(favicon("./www/favicon.ico"));

// -----

app.use(express.static("www"));

// -----

app.use("/", routes);

// -----

app.use(function (req, res) {
  res.status(404);

  // respond with html page
  if (req.accepts("html")) {
    res.render("404", {
      url: req.url,
    });
    return;
  }

  // respond with json
  if (req.accepts("json")) {
    res.send({
      error: "Not found",
    });
    return;
  }

  // default to plain-text. send()
  res.type("txt").send("Not found");
});

// ----- Start listening -----

app.listen(port, function (err) {
  if (err) {
    throw err;
  }
  console.log("App listening on port " + port);
});
