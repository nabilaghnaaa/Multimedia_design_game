import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationStage2Level6.css";

import level6Bg from "../assets/simulation/stage2/level6/level6-bg.png";

import girlPinkBack from "../assets/simulation/stage2/level6/girl-pink-back.png";
import girlPinkLeft from "../assets/simulation/stage2/level6/girl-pink-left.png";
import girlPinkRight from "../assets/simulation/stage2/level6/girl-pink-right.png";
import boyBlue from "../assets/simulation/stage2/level6/boy-blue.png";
import carBlack from "../assets/simulation/stage2/level6/car-black.png";
import crashImg from "../assets/simulation/stage2/level6/crash.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionRight from "../assets/simulation/stage1/level1/bubble-question-right.png";
import bubbleGoodLeft from "../assets/simulation/stage1/level1/bubble-good-left.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";

const PHASE = {
  INTRO: "intro",
  GIRL_STOP: "girl-stop",
  TRAFFIC_ENTER: "traffic-enter",
  QUESTION: "question",
  WRONG_MOVE: "wrong-move",
  WRONG_RESULT: "wrong-result",
  CORRECT_MOVE: "correct-move",
  CORRECT_RESULT: "correct-result",
};

const normalizeNumberArray = (data, fallback = []) => {
  if (!Array.isArray(data)) return fallback;

  return [
    ...new Set(
      data
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item))
    ),
  ].sort((a, b) => a - b);
};

const safeParseArray = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return normalizeNumberArray(parsed, fallback);
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error);
    return fallback;
  }
};

export default function SimulationStage2Level6() {
  const navigate = useNavigate();
  const timersRef = useRef([]);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startCamera, setStartCamera] = useState(false);
  const [showGirl, setShowGirl] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const saveStage2Level6Progress = () => {
    const completedLevels = safeParseArray("completedLevels", []);
    const unlockedLevels = safeParseArray("unlockedLevels", [1, 6]);

    const updatedCompletedLevels = normalizeNumberArray(
      [...completedLevels, 6, 7, 8, 9, 10, 11],
      []
    );

    const updatedUnlockedLevels = normalizeNumberArray(
      [...unlockedLevels, 6, 7, 8, 9, 10, 11],
      [1, 6]
    );

    localStorage.setItem("selectedStage", "2");
    localStorage.setItem("selectedLevel", "11");
    localStorage.setItem("selectedStage2Level", "6");
    localStorage.setItem(
      "completedLevels",
      JSON.stringify(updatedCompletedLevels)
    );
    localStorage.setItem(
      "unlockedLevels",
      JSON.stringify(updatedUnlockedLevels)
    );
  };

  const startLevel = () => {
    clearTimers();

    setRestartKey((prevKey) => prevKey + 1);

    setPhase(PHASE.INTRO);
    setStartCamera(false);
    setShowGirl(false);
    setShowTraffic(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setShowGirl(true);
        setStartCamera(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.GIRL_STOP);
      }, 3900)
    );

    timersRef.current.push(
      setTimeout(() => {
        setShowTraffic(true);
        setPhase(PHASE.TRAFFIC_ENTER);
      }, 4300)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 5500)
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
      }, 900)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveStage2Level6Progress();
    setPhase(PHASE.CORRECT_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.CORRECT_RESULT);
      }, 1100)
    );
  };

  const handleRetry = () => {
    startLevel();
  };

  const handleBack = () => {
    navigate("/map");
  };

  const handleFinish = () => {
    navigate("/map");
  };

  const isIntro = phase === PHASE.INTRO;
  const isGirlStop = phase === PHASE.GIRL_STOP;
  const isTrafficEnter = phase === PHASE.TRAFFIC_ENTER;
  const isQuestion = phase === PHASE.QUESTION;
  const isWrongMove = phase === PHASE.WRONG_MOVE;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectMove = phase === PHASE.CORRECT_MOVE;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  const showNormalGirl =
    showGirl &&
    !isWrongMove &&
    !isWrongResult &&
    !isCorrectMove &&
    !isCorrectResult;

  const showBoyAndCar = showTraffic;

  return (
    <main className="simulation-s2l6-page">
      <button type="button" className="s2l6-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="s2l6-level-badge">
        <span>STAGE 2 - LEVEL 6</span>
        <strong>Dilarang Belok Kanan</strong>
      </div>

      <section
        key={restartKey}
        className={`s2l6-viewport ${
          isWrongResult ? "s2l6-viewport--crash-shake" : ""
        }`}
      >
        <div
          className={`s2l6-bg-world ${
            startCamera ? "s2l6-bg-world--top" : ""
          }`}
        >
          <img
            src={level6Bg}
            alt="Background dilarang belok kanan"
            className="s2l6-bg"
            draggable="false"
          />
        </div>

        <div className="s2l6-actors-layer">
          {showNormalGirl && (
            <img
              src={girlPinkBack}
              alt="Cewek pink dari bawah ke atas"
              className={`s2l6-actor s2l6-girl-back ${
                isIntro ? "s2l6-girl-back--walk" : ""
              } ${
                isGirlStop || isTrafficEnter || isQuestion
                  ? "s2l6-girl-back--stop"
                  : ""
              }`}
              draggable="false"
            />
          )}

          {showBoyAndCar && (
            <>
              <img
                src={carBlack}
                alt="Mobil hitam"
                className={`s2l6-actor s2l6-car ${
                  isTrafficEnter ? "s2l6-car--enter" : ""
                } ${isQuestion ? "s2l6-car--stop" : ""} ${
                  isWrongMove || isWrongResult ? "s2l6-car--wrong-drive" : ""
                } ${
                  isCorrectMove || isCorrectResult
                    ? "s2l6-car--correct-drive"
                    : ""
                }`}
                draggable="false"
              />

              <img
                src={boyBlue}
                alt="Cowok biru"
                className={`s2l6-actor s2l6-boy ${
                  isTrafficEnter ? "s2l6-boy--enter" : ""
                } ${isQuestion ? "s2l6-boy--stop" : ""} ${
                  isWrongMove || isWrongResult ? "s2l6-boy--wrong-move" : ""
                } ${
                  isCorrectMove || isCorrectResult
                    ? "s2l6-boy--correct-drive"
                    : ""
                }`}
                draggable="false"
              />
            </>
          )}

          {isQuestion && (
            <>
              <div className="s2l6-question-bubble">
                <img
                  src={bubbleQuestionRight}
                  alt=""
                  className="s2l6-bubble-img"
                  draggable="false"
                />

                <p>
                  Wah, ada rambu
                  <br />
                  dilarang belok kanan.
                  <br />
                  Apa yang harus aku lakukan?
                </p>
              </div>

              <div className="s2l6-answer-wrapper">
                <button
                  type="button"
                  className="s2l6-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Belok Kiri
                </button>

                <button
                  type="button"
                  className="s2l6-answer-button s2l6-answer-button--danger"
                  onClick={handleWrongAnswer}
                >
                  Belok Kanan
                </button>
              </div>
            </>
          )}

          {isWrongMove && (
            <img
              src={girlPinkRight}
              alt="Cewek pink salah belok kanan"
              className="s2l6-actor s2l6-girl-wrong"
              draggable="false"
            />
          )}

          {isCorrectMove && (
            <img
              src={girlPinkLeft}
              alt="Cewek pink belok kiri"
              className="s2l6-actor s2l6-girl-correct"
              draggable="false"
            />
          )}

          {isWrongResult && (
            <>
              <div className="s2l6-result-dim s2l6-result-dim--wrong" />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="s2l6-actor s2l6-police s2l6-police--stop"
                draggable="false"
              />

              <img
                src={crashImg}
                alt="Tabrakan"
                className="s2l6-actor s2l6-crash"
                draggable="false"
              />

              <div className="s2l6-result-bubble s2l6-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="s2l6-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l6-result-text s2l6-result-text--warning">
                  <h2>Berhenti!</h2>
                  <p>
                    Kamu melanggar peraturan. Rambu dilarang belok kanan
                    berarti pengendara tidak boleh belok ke kanan karena bisa
                    bertabrakan dengan kendaraan lain.
                  </p>
                </div>
              </div>

              <div className="s2l6-result-buttons">
                <button
                  type="button"
                  className="s2l6-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l6-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="s2l6-result-dim s2l6-result-dim--correct" />

              <img
                src={policeGood}
                alt="Polisi good"
                className="s2l6-actor s2l6-police s2l6-police--good"
                draggable="false"
              />

              <img
                src={girlPinkLeft}
                alt="Cewek pink aman"
                className="s2l6-actor s2l6-girl-safe-final"
                draggable="false"
              />

              <div className="s2l6-result-bubble s2l6-result-bubble--good">
                <img
                  src={bubbleGoodLeft}
                  alt=""
                  className="s2l6-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l6-result-text s2l6-result-text--good">
                  <h2>Kerja Bagus!</h2>
                  <p>
                    Kamu memilih tidak belok kanan. Saat ada rambu dilarang
                    belok kanan, pengendara harus mengikuti arah lain yang
                    diperbolehkan agar tetap aman.
                  </p>
                </div>
              </div>

              <div className="s2l6-result-buttons">
                <button
                  type="button"
                  className="s2l6-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l6-secondary-button"
                  onClick={handleFinish}
                >
                  Lanjut Pilih Level
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}