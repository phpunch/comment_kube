const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(express.static("./"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.sendFile("index.html");
});

app.get("/api/get", function(req, res) {
  fetch("http://backend:5000/api/get")
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

  fetch("http://backend:5000/api/post", options)
    .then(res => res.json())
    .then(commentList => res.send(commentList));
});

app.delete("/api/delete/:id", function(req, res) {
  const options = {
    method: "DELETE"
  };

  fetch(`http://backend:5000/api/delete/${req.params.id}`, options)
    .then(res => res.json())
    .then(commentList => res.send(commentList));
});

app.listen(3000, () => {
  console.log("Server running on 3000...");
});
