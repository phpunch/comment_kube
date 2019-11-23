const mongoose = require("mongoose");
const Comment = mongoose.model("comment");

module.exports = app => {
  const getAll= () => {
    const comments = await Comment.find({});
    return comments
  }
  app.post("/api/post", async (req, res) => {
    const { name, msg } = req.body;
    console.log("req.body!!!!", req.body);
    await new Comment({
      name,
      msg
    }).save();

    res.send(getAll());

    // res.status(200);
  });
  app.get("/api/get", async (req, res) => {
    res.send(getAll());
  });
  app.delete("/api/delete/:id", async (req, res) => {
    try {
      Comment.deleteOne({ _id: id }, function(err) {
        if (err) throw err;
        res.send(getAll());
      });
    } catch (err) {
      console.log(err);
      res.status(500);
    }
  });
};
