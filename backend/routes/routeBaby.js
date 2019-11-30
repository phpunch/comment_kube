const mongoose = require("mongoose");
const Comment = mongoose.model("comment");

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

    // res.status(200);
  });
  // app.get("/api/get", async (req, res) => {
  //   const comments = await getAll();
  //   res.send(comments);
  // });
  app.delete("/api/delete/:id", async (req, res) => {
    try {
      Comment.deleteOne({ _id: req.params.id }, async function(err) {
        if (err) throw err;
        const comments = await getAll();
        res.send(comments);
      });
    } catch (err) {
      console.log(err);
      res.status(500);
    }
  });
};
