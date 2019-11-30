const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const sass = require("node-sass");
const fs = require("fs");

const app = express();
app.use(express.static("./"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const backendEndPoint =
  process.env.NODE_ENV == "production" ? "backend" : "localhost";
const backend2EndPoint =
  process.env.NODE_ENV == "production" ? "backend2" : "localhost";

app.get("/", function(req, res) {
  res.sendFile("index.html");
});

app.get("/api/get", function(req, res) {
  fetch(`http://${backend2EndPoint}:6000/api/get`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
    })
    .then(commentList => {
      res.send(commentList);
    })
    .catch(err => console.error(err));
});

app.post("/api/post", function(req, res) {
  const comment = {
    name: req.body.name,
    msg: req.body.msg
  };

  const options = {
    method: "POST",
    body: JSON.stringify(comment),
    headers: {
      "Content-Type": "application/json"
    }
  };

  fetch(`http://${backendEndPoint}:5000/api/post`, options)
    .then(res => res.json())
    .then(commentList => res.send(commentList));
});

app.delete("/api/delete/:id", function(req, res) {
  const options = {
    method: "DELETE"
  };

  fetch(`http://${backendEndPoint}:5000/api/delete/${req.params.id}`, options)
    .then(res => res.json())
    .then(commentList => res.send(commentList));
});

// SCSS to CSS
sass.render(
  {
    file: "style.scss"
  },
  (err, result) => {
    if (err) {
      return console.log(err);
    }
    fs.writeFile("./style.css", result.css, err => {
      if (err) {
        return console.log(err);
      }
      console.log("compile scss sucessfully");
    });
  }
);

app.listen(3000, () => {
  console.log("Server running on 3000...");
});
