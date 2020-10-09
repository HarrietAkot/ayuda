import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import SettingsIcon from "@material-ui/icons/Settings";
import Question from "../components/Question";
import axios from "axios";
import { url } from "../constants";

const HomeScreen = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    axios.get(`${url}api/questions/`).then((res) => {
      setQuestions(res.data);
    });
  });

  return (
    <div class="container">
      <div class="d-flex justify-content-between pt-5">
        <Typography variant="h5" gutterBottom>
          All Questions
        </Typography>
        <Button variant="contained" color="secondary">
          Ask Question
        </Button>
      </div>
      <div class="d-flex justify-content-between mt-2">
        <Typography variant="overline" gutterBottom>
          50 questions
        </Typography>
        <div>
          <TextField
            size="small"
            id="filled-password-input"
            label="Subject"
            autoComplete="current-password"
            variant="outlined"
            className="mr-2"
          />
          <TextField
            size="small"
            id="filled-password-input"
            label="Topic"
            autoComplete="current-password"
            variant="outlined"
            className="mr-2"
          />

          <Button variant="contained" startIcon={<SettingsIcon />}>
            Apply Filter
          </Button>
        </div>
      </div>
      <hr />
      {questions.map((question) => {
        return (
          <div>
            <Question
              title={question.title}
              text={question.text}
              topic={question.topic.title}
              subject={question.subject.title}
            />
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default HomeScreen;