const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const app = express();
const cors = require("cors");
const axios = require("axios");

app.use(bodyParser.json()); // user sends json in body, it get parsed easily
app.use(cors()); // wiring up my express appln as middleware

const comments = {};

app.get("/posts/:id/comments", async (req, res) => {
  res.status(201).send(comments[req.params.id] || []);
});
app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const postId = req.params.id;
  const commentsByPost = comments[postId] || [];
  comments[postId] = [
    ...commentsByPost,
    {
      id: commentId,
      content,
    },
  ];

  // emiting events to Event Bus
  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
    },
  });

  res.status(201).send(comments[postId]);
});

app.post("/events", (req, res) => {
  console.log("Events are emitted", req.body.type);
  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
