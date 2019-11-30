const mongoose = require("mongoose");
const Comment = mongoose.model("comment");
const axios = require("axios");
const logEndPoint =
  process.env.NODE_ENV == "production" ? "logging" : "localhost";
module.exports = app => {
  const getAll = async () => {
    const comments = await Comment.find({});
    return comments;
  };
  app.post("/api/post", async (req, res) => {
    const { name, msg } = req.body;
    await new Comment({
      name,
      msg
    }).save();
    const comments = await getAll();
    res.send(comments);
    const logmsg = "post" + JSON.stringify(req.body);
    axios
      .get(`http://${logEndPoint}:8787/log?message=${logmsg}`)
      .then(res => {
        console.log(res);
      })
      .catch(error => {
        console.log(error);
      });
    // res.status(200);
  });
  // app.get("/api/get", async (req, res) => {
  //   const comments = await getAll();
  //   res.send(comments);
  // });
  app.delete("/api/delete/:id", async (req, res) => {
    try {
      const logmsg = "delete" + JSON.stringify(req.params);
      Comment.deleteOne({ _id: req.params.id }, async function(err) {
        if (err) throw err;
        const comments = await getAll();
        res.send(comments);

        axios
          .get(`http://${logEndPoint}:8787/log?message=${logmsg}`)
          .then(res => {
            console.log(res);
          })
          .catch(error => {
            console.log(error);
          });
      });
    } catch (err) {
      console.log(err);
      res.status(500);
    }
  });
};
