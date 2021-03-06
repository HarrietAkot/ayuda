const router = require("express").Router();

const Subject = require("../models/Subject");
const Topic = require("../models/Topic");
const Question = require("../models/Question");
const User = require("../models/User");

const { questionValidation } = require("../validation");
const verifyToken = require("./verifyToken");
const { find } = require("../models/Subject");
const ObjectId = require("mongoose").Types.ObjectId;

router.post("/", verifyToken, async (req, res) => {
  const { error, value } = questionValidation(req.body);
  if (error) return res.status(400).send(error);

  let subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(404).send({ message: "Status Not Found" });

  let topic = await Topic.findById(req.body.topic);
  if (!topic) return res.status(404).send({ message: "Topic Not Found" });

  let user = await User.findById(req.user._id);
  if (!user) return res.status(404).send({ message: "Status Not Found" });

  let topicBelongsToSubject = subject.topics.filter(singleTopic => singleTopic.toString() == topic._id);

  if (topicBelongsToSubject.length == 0) return res.status(400).send("This topic does not belong to this subject")

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
    ).populate("questions");

    return res.send({
      ...question._doc,
      user,
      subject,
      topic,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", async (req, res) => {
  let topic = req.query.topic;
  let subject = req.query.subject;
  let text = req.query.text;

  let questions = await Question.find()
    .populate("subject")
    .populate("topic")
    .populate("answers");
  questions = questions.filter((question) => {

    return ( text == null || question.title.toLowerCase().includes(text.toLowerCase()) ||  question.text.toLowerCase().includes(text.toLowerCase()) ) && ( subject == null || question.subject.title.toLowerCase().includes(subject.toLowerCase()) ) && ( topic == null || question.topic.title.toLowerCase().includes(topic.toLowerCase()) )

  });

  return res.send(questions);
});

router.get("/:questionId", async (req, res) => {
  if (!ObjectId.isValid(req.params.questionId))
    return res.status(400).send({ message: "Invalid Id" });

  const question = await Question.findById(req.params.questionId)
    .populate("subject")
    .populate("user")
    .populate("topic")
    .populate("answers");
  if (!question) return res.status(404).send({ message: "Question Not Found" });
  return res.send(question);
});

router.put("/:questionId", async (req, res) => {
  if (!ObjectId.isValid(req.params.questionId))
    return res.status(400).send({ message: "Invalid Id" });

  const body = req.body

  const question = await Question.findById(req.params.questionId)

  if(!question) {
    return res.status(400).send({ message: "No question found for given ID" })
  }

  question.title = body.title
  question.text = body.text
  question.tags = body.tags
  //if you want to change the subject just delete it and make a new one
  //created user can't be changed
  question.answers = body.answers
  //created date can't be changed

  const savedQuestion = await question.save()
  return res.send(savedQuestion)
})

router.delete("/:questionId", verifyToken, async (req, res) => {
  if (!ObjectId.isValid(req.params.questionId))
    return res.status(400).send({ message: "Invalid Id" });

  await Topic.findByIdAndDelete(req.params.questionId);
  return res.status(204).end();
});

module.exports = router;
