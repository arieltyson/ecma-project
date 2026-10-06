// The knowledge check: one question at a time, feedback the moment an
// option is chosen, and a score at the end. Feedback is announced
// through a polite live region, and correctness is shown with text and
// an icon as well as colour.

import { useReducer, useRef } from "react";
import type { QuizQuestion } from "../content/schema.ts";
import { Icon } from "./Icon.tsx";
import "./Quiz.css";

interface State {
  readonly index: number;
  readonly answers: readonly number[];
}

type Action =
  | { readonly type: "answer"; readonly option: number }
  | { readonly type: "next" }
  | { readonly type: "restart" };

const INITIAL: State = { index: 0, answers: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "answer":
      if (state.answers.length > state.index) return state;
      return { ...state, answers: [...state.answers, action.option] };
    case "next":
      return { ...state, index: state.index + 1 };
    case "restart":
      return INITIAL;
  }
}

const LETTERS = "ABCDE";

export function Quiz({
  questions,
}: {
  readonly questions: readonly QuizQuestion[];
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const question = questions[state.index];
  const chosen = state.answers[state.index];
  const answered = chosen !== undefined;

  function moveFocusToQuestion() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  if (!question) {
    const score = state.answers.filter(
      (answer, i) => answer === questions[i]?.answer,
    ).length;
    return (
      <div className="quiz">
        <p className="quiz-result" ref={headingRef} tabIndex={-1}>
          {score} of {questions.length} correct
        </p>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            dispatch({ type: "restart" });
            moveFocusToQuestion();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const correct = chosen === question.answer;
  const last = state.index === questions.length - 1;

  return (
    <div className="quiz">
      <p className="quiz-count">
        Question {state.index + 1} of {questions.length}
      </p>
      <h3 className="quiz-question" ref={headingRef} tabIndex={-1}>
        {question.question}
      </h3>
      <ol className="quiz-options">
        {question.options.map((option, i) => {
          const status = !answered
            ? undefined
            : i === question.answer
              ? "correct"
              : i === chosen
                ? "incorrect"
                : "idle";
          return (
            <li key={option}>
              <button
                type="button"
                className="quiz-option"
                data-status={status}
                aria-disabled={answered || undefined}
                onClick={() => {
                  if (!answered) dispatch({ type: "answer", option: i });
                }}
              >
                <span className="quiz-letter" aria-hidden="true">
                  {status === "correct" ? (
                    <Icon name="check" size="sm" />
                  ) : status === "incorrect" ? (
                    <Icon name="close" size="sm" />
                  ) : (
                    LETTERS[i]
                  )}
                </span>
                <span>{option}</span>
                {status === "correct" || status === "incorrect" ? (
                  <span className="visually-hidden">
                    {status === "correct" ? ", correct answer" : ", incorrect"}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="quiz-feedback" aria-live="polite">
        {answered ? (
          <>
            <p className="quiz-verdict" data-correct={correct}>
              {correct ? "Correct." : "Not quite."}
            </p>
            <p>{question.explanation}</p>
          </>
        ) : null}
      </div>
      {answered ? (
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            dispatch({ type: "next" });
            moveFocusToQuestion();
          }}
        >
          {last ? "See score" : "Next question"}
          <Icon name="arrow" size="sm" />
        </button>
      ) : null}
    </div>
  );
}
