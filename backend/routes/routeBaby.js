const mongoose = require("mongoose");
const Comment = mongoose.model("comment");

module.exports = app => {
  app.post("/api/post", async (req, res) => {
    const { name, msg } = req.body;

    await new Comment({
      name,
      msg
    }).save();

    const comment = await Comment.find({});
    res.send(comment);

    // res.status(200);
  });
  app.get("/api/get", async (req, res) => {
    const comment = await Comment.find({});
    res.send(comment);
  });
};
