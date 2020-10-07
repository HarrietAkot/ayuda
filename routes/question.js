const router = require("express").Router();

const Subject = require("../models/Subject");
const Topic = require("../models/Topic");
const Question = require("../models/Question");
const User = require("../models/User");

const { questionValidation } = require("../validation");
const verifyToken = require("./verifyToken");

router.post("/", verifyToken, async (req, res) => {
  const { error, value } = questionValidation(req.body);
  if (error) return res.status(400).send(error);

  let subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(404).send({message:"Status Not Found"});

  let topic = await Topic.findById(req.body.topic);
  if (!topic) return res.status(404).send({message:"Topic Not Found"});

  let user = await User.findById(req.user._id);
  if (!user) return res.status(404).send({message:"Status Not Found"});

  let question = new Question({
    title: req.body.title,
    text: req.body.text,
    tags: req.body.tags,
    user,
    topic,
    subject,
  });

  try {
    question = await question.save();

    user = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          questions: [...user._doc.questions, question],
        },
      },
      {
        new: true,
      }
    ).populate("questions");

    subject = await Subject.findOneAndUpdate(
      { _id: req.body.subject },
      {
        $set: {
          questions: [...subject._doc.questions, question],
        },
      },
      {
        new: true,
      }
    )
      .populate("questions")
      .populate("topics");

    topic = await Topic.findOneAndUpdate(
      { _id: req.body.topic },
      {
        $set: {
          questions: [...topic._doc.questions, question],
        },
      },
      {
        new: true,
      }
    )
    .populate("questions");

    return res.send({
      ...question._doc,
      user,
      subject,
      topic
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", verifyToken, async (req, res) => {
  return res.send(await Subject.find());
});

module.exports = router;
