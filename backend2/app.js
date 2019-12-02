const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

require("./models/Comment");

var mongoDB = "mongodb://db:27017/data";
console.log(mongoDB);
mongoose.connect(mongoDB, { useNewUrlParser: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async function() {
  console.log("connected");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
require("./routes/routeBaby")(app);

app.listen("6000", () => {
  console.log("listen on PORT 6000");
});
module.exports = app;

process.on('SIGTERM', () => {
  db.close(() => {
    console.log('SIGTERM initiated');
  });
  process.exit(0);
});