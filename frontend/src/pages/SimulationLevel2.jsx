import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationLevel2.css";

import level2Bg from "../assets/simulation/stage1/level2/level2-bg.png";
import boyBlueLevel2 from "../assets/simulation/stage1/level2/boy-blue.png";
import crashLevel2 from "../assets/simulation/stage1/level2/crash.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionRight from "../assets/simulation/stage1/level1/bubble-question-right.png";
import bubbleGoodLeft from "../assets/simulation/stage1/level1/bubble-good-left.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  WRONG_MOVE: "wrong-move",
  WRONG_RESULT: "wrong-result",
  CORRECT_MOVE: "correct-move",
  CORRECT_RESULT: "correct-result",
};

export default function SimulationLevel2() {
  const navigate = useNavigate();
  const timersRef = useRef([]);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startScene, setStartScene] = useState(false);
  const [showBoy, setShowBoy] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const saveLevel2Progress = () => {
    try {
      const savedProgress = localStorage.getItem(STAGE1_PROGRESS_KEY);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      const completedLevels = Array.isArray(progress.completedLevels)
        ? progress.completedLevels
        : [];

      const updatedCompletedLevels = [...new Set([...completedLevels, 2])];

      localStorage.setItem(
        STAGE1_PROGRESS_KEY,
        JSON.stringify({
          ...progress,
          unlockedLevel: Math.max(progress.unlockedLevel || 1, 3),
          completedLevels: updatedCompletedLevels,
        })
      );

      localStorage.setItem("unlockedLevels", JSON.stringify([1, 2, 3]));
    } catch (error) {
      console.error("Gagal menyimpan progress level 2:", error);
    }
  };

  const startLevel = () => {
    clearTimers();

    setRestartKey((prevKey) => prevKey + 1);
    setPhase(PHASE.INTRO);
    setStartScene(false);
    setShowBoy(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setShowBoy(true);
        setStartScene(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 3600)
    );
  };

  useEffect(() => {
    startLevel();

    return () => {
      clearTimers();
    };
  }, []);

  const handleWrongAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    setPhase(PHASE.WRONG_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.WRONG_RESULT);
      }, 1700)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveLevel2Progress();
    setPhase(PHASE.CORRECT_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.CORRECT_RESULT);
      }, 2800)
    );
  };

  const handleRetry = () => {
    startLevel();
  };

  const handleBack = () => {
    navigate("/stage1-select");
  };

  const handleNext = () => {
    navigate("/simulation/3");
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isWrongMove = phase === PHASE.WRONG_MOVE;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectMove = phase === PHASE.CORRECT_MOVE;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  return (
    <main className="simulation-level2-page">
      <button type="button" className="level2-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="level2-badge">
        <span>LEVEL 2</span>
        <strong>Peringatan Jalan Berlubang</strong>
      </div>

      <section key={restartKey} className="level2-viewport">
        <div
          className={`level2-bg-world ${
            startScene ? "level2-bg-world--move" : ""
          }`}
        >
          <img
            src={level2Bg}
            alt="Background jalan berlubang"
            className="level2-bg"
            draggable="false"
          />
        </div>

        <div className="level2-actors-layer">
          {showBoy && !isWrongResult && (
            <img
              src={boyBlueLevel2}
              alt="Pengendara cowok"
              className={`level2-actor level2-boy ${
                startScene ? "level2-boy--ride" : ""
              } ${isQuestion ? "level2-boy--stop" : ""} ${
                isWrongMove ? "level2-boy--wrong" : ""
              } ${
                isCorrectMove || isCorrectResult ? "level2-boy--correct" : ""
              }`}
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="level2-question-bubble">
                <img
                  src={bubbleQuestionRight}
                  alt=""
                  className="level2-bubble-img"
                  draggable="false"
                />

                <p>
                  Wah, ada rambu peringatan
                  <br />
                  jalan berlubang di depan.
                  <br />
                  Apa yang harus aku lakukan?
                </p>
              </div>

              <div className="level2-answer-wrapper">
                <button
                  type="button"
                  className="level2-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Pelan-pelan dan hindari lubang
                </button>

                <button
                  type="button"
                  className="level2-answer-button"
                  onClick={handleWrongAnswer}
                >
                  Tetap ngebut
                </button>
              </div>
            </>
          )}

          {isWrongResult && (
            <>
              <div className="level2-result-dim level2-result-dim--wrong" />

              <img
                src={crashLevel2}
                alt="Efek jatuh karena lubang"
                className="level2-actor level2-crash"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="level2-actor level2-police level2-police--stop"
                draggable="false"
              />

              <div className="level2-result-bubble level2-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="level2-result-bubble-img"
                  draggable="false"
                />

                <div className="level2-result-text level2-result-text--warning">
                  <h2>Hati-hati!</h2>
                  <p>
                    Jalan berlubang harus dilewati dengan pelan. Kalau tetap
                    ngebut, pengendara bisa kehilangan keseimbangan dan
                    terjatuh.
                  </p>
                </div>
              </div>

              <div className="level2-result-buttons">
                <button
                  type="button"
                  className="level2-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="level2-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="level2-result-dim level2-result-dim--correct" />

              <img
                src={policeGood}
                alt="Polisi good"
                className="level2-actor level2-police level2-police--good"
                draggable="false"
              />

              <div className="level2-result-bubble level2-result-bubble--good">
                <img
                  src={bubbleGoodLeft}
                  alt=""
                  className="level2-result-bubble-img"
                  draggable="false"
                />

                <div className="level2-result-text level2-result-text--good">
                  <h2>Kerja Bagus!</h2>
                  <p>
                    Kamu memperlambat kendaraan dan menghindari lubang. Itu
                    pilihan aman saat melihat rambu peringatan jalan berlubang.
                  </p>
                </div>
              </div>

              <div className="level2-result-buttons">
                <button
                  type="button"
                  className="level2-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="level2-secondary-button"
                  onClick={handleNext}
                >
                  Lanjut Level 3
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}