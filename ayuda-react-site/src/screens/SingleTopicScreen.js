import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import { url } from "../constants";
import Topic from "../components/Topic";
import Question from "../components/Question";
import { useHistory } from "react-router-dom";

export default () => {
  const history = useHistory();

  let { topicId } = useParams();
  const [topic, setTopic] = useState();

  useEffect(() => {
    axios.get(`${url}api/topics/${topicId}`).then((res) => {
      res.data.questions = res.data.questions.reverse();
      setTopic(res.data);
    });
  }, []);

  if (!topic) return "Loading...";

  return (
    <div>
      <div className="container">
        <div class="d-flex justify-content-between pt-5">
          <Typography variant="h5" gutterBottom>
            {topic.title}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              history.push({
                pathname: "/create-question",
                search: `?subject=${topic.subject._id}&topic=${topic._id}`,
              });
            }}
          >
            Create Question
          </Button>
        </div>
        <div class="d-flex flex-column align-items-start">
          <Typography variant="body" gutterBottom>
            {topic.questions.length == 1
              ? topic.questions.length + " question"
              : topic.questions.length + " questions"}
          </Typography>
        </div>
        <hr />
        <Typography variant="h5" gutterBottom>
          Questions
        </Typography>
        <hr />

        {topic.questions.reverse().map((question) => {
          return (
            <div>
              <Question id={question._id} />
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
};
