// const fetch = require("node-fetch");
var http = require("http");
var httpProxy = require("http-proxy");
var proxy = httpProxy.createProxyServer({});

var connect = require("connect");
var serveStatic = require("serve-static");
connect()
  .use(serveStatic(__dirname))
  .listen(3000, function() {
    console.log("Server running on 3000...");
    // fetch("http://backend:5000/api/get")
    //   .then(response => {
    //     if (response.ok) {
    //       return response.json();
    //     }
    //   })
    //   .then(res => {
    //     console.log(res);
    //   })
    //   .catch(err => console.error(err));
  });

http
  .createServer(function(req, res) {
    proxy.web(req, res, { target: "http://backend:5000" });
  })
  .listen(5000);
