import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationStage2Level7.css";

import bgLevel7 from "../assets/simulation/stage2/level7/bg-level7.png";
import carBlackTop from "../assets/simulation/stage2/level7/car-black-top.png";
import crashGirlCar from "../assets/simulation/stage2/level7/crash-girl-car.png";
import riderGirlBack from "../assets/simulation/stage2/level7/rider-girl-back.png";
import riderGirlSide from "../assets/simulation/stage2/level7/rider-girl-side.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionLeft from "../assets/simulation/stage1/level1/bubble-question-left.png";
import bubbleGoodLeft from "../assets/simulation/stage1/level1/bubble-good-left.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  WRONG_START_TURN: "wrong-start-turn",
  WRONG_CROSS_UP: "wrong-cross-up",
  WRONG_RESULT: "wrong-result",
  CORRECT_GO: "correct-go",
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

export default function SimulationStage2Level7() {
  const navigate = useNavigate();
  const timersRef = useRef([]);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startScene, setStartScene] = useState(false);
  const [showRider, setShowRider] = useState(false);
  const [showCar, setShowCar] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const saveStage2Level7Progress = () => {
    const completedLevels = safeParseArray("completedLevels", []);
    const unlockedLevels = safeParseArray("unlockedLevels", [1, 6]);

    const updatedCompletedLevels = normalizeNumberArray(
      [...completedLevels, 6, 7, 8, 9, 10, 11, 12],
      []
    );

    const updatedUnlockedLevels = normalizeNumberArray(
      [...unlockedLevels, 6, 7, 8, 9, 10, 11, 12],
      [1, 6]
    );

    localStorage.setItem("selectedStage", "2");
    localStorage.setItem("selectedLevel", "12");
    localStorage.setItem("selectedStage2Level", "7");
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
    setStartScene(false);
    setShowRider(false);
    setShowCar(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setShowRider(true);
        setStartScene(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setShowCar(true);
      }, 3600)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 4300)
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
    setPhase(PHASE.WRONG_START_TURN);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.WRONG_CROSS_UP);
      }, 500)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.WRONG_RESULT);
      }, 1700)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveStage2Level7Progress();
    setPhase(PHASE.CORRECT_GO);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.CORRECT_RESULT);
      }, 1900)
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
  const isQuestion = phase === PHASE.QUESTION;
  const isWrongStartTurn = phase === PHASE.WRONG_START_TURN;
  const isWrongCrossUp = phase === PHASE.WRONG_CROSS_UP;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectGo = phase === PHASE.CORRECT_GO;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  const showSideRider =
    showRider &&
    !isWrongCrossUp &&
    !isWrongResult &&
    !isCorrectResult;

  const showBackRider = isWrongCrossUp;

  return (
    <main className="simulation-s2l7-page">
      <button type="button" className="s2l7-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="s2l7-level-badge">
        <span>STAGE 2 - LEVEL 7</span>
        <strong>Dilarang Putar Balik</strong>
      </div>

      <section
        key={restartKey}
        className={`s2l7-viewport ${
          isWrongResult ? "s2l7-viewport--crash-shake" : ""
        }`}
      >
        <div
          className={`s2l7-bg-world ${
            startScene ? "s2l7-bg-world--follow-rider" : ""
          } ${isWrongResult ? "s2l7-bg-world--wrong-result" : ""} ${
            isCorrectGo ? "s2l7-bg-world--correct-follow" : ""
          } ${isCorrectResult ? "s2l7-bg-world--correct-result" : ""}`}
        >
          <img
            src={bgLevel7}
            alt="Background jalan raya dua jalur"
            className="s2l7-bg"
            draggable="false"
          />
        </div>

        <div className="s2l7-actors-layer">
          {showCar && (
            <img
              src={carBlackTop}
              alt="Mobil hitam dari kanan ke kiri di jalur atas"
              className={`s2l7-actor s2l7-car ${
                isQuestion ? "s2l7-car--half-enter" : ""
              } ${
                isWrongStartTurn || isWrongCrossUp || isWrongResult
                  ? "s2l7-car--wrong-drive"
                  : ""
              } ${
                isCorrectGo || isCorrectResult
                  ? "s2l7-car--correct-pass"
                  : ""
              }`}
              draggable="false"
            />
          )}

          {showSideRider && (
            <img
              src={riderGirlSide}
              alt="Rider cewek dari kiri ke kanan"
              className={`s2l7-actor s2l7-rider-side ${
                isIntro ? "s2l7-rider-side--enter" : ""
              } ${isQuestion ? "s2l7-rider-side--stop" : ""} ${
                isWrongStartTurn ? "s2l7-rider-side--start-turn" : ""
              } ${isCorrectGo ? "s2l7-rider-side--correct-go" : ""}`}
              draggable="false"
            />
          )}

          {showBackRider && (
            <img
              src={riderGirlBack}
              alt="Rider cewek putar balik ke jalur atas"
              className="s2l7-actor s2l7-rider-back s2l7-rider-back--wrong-cross"
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="s2l7-question-bubble">
                <img
                  src={bubbleQuestionLeft}
                  alt=""
                  className="s2l7-bubble-img"
                  draggable="false"
                />

                <p>
                  Aku buru-buru, tapi ada rambu
                  <br />
                  dilarang putar balik.
                  <br />
                  Apa yang harus aku lakukan?
                </p>
              </div>

              <div className="s2l7-answer-wrapper">
                <button
                  type="button"
                  className="s2l7-answer-button s2l7-answer-button--danger"
                  onClick={handleWrongAnswer}
                >
                  Tetap Putar Balik
                </button>

                <button
                  type="button"
                  className="s2l7-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Cari Belokan Lain
                </button>
              </div>
            </>
          )}

          {isWrongResult && (
            <>
              <div className="s2l7-result-dim s2l7-result-dim--wrong" />

              <img
                src={crashGirlCar}
                alt="Crash mobil dan rider cewek"
                className="s2l7-actor s2l7-crash"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="s2l7-actor s2l7-police s2l7-police--stop"
                draggable="false"
              />

              <div className="s2l7-result-bubble s2l7-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="s2l7-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l7-result-text s2l7-result-text--warning">
                  <h2>Bahaya!</h2>
                  <p>
                    Rambu dilarang putar balik berarti pengendara tidak boleh
                    memutar arah di area tersebut. Memaksa putar balik bisa
                    menyebabkan tabrakan dengan kendaraan dari jalur lain.
                  </p>
                </div>
              </div>

              <div className="s2l7-result-buttons">
                <button
                  type="button"
                  className="s2l7-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l7-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="s2l7-result-dim s2l7-result-dim--correct" />

              <img
                src={policeGood}
                alt="Polisi good"
                className="s2l7-actor s2l7-police s2l7-police--good"
                draggable="false"
              />

              <div className="s2l7-result-bubble s2l7-result-bubble--good">
                <img
                  src={bubbleGoodLeft}
                  alt=""
                  className="s2l7-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l7-result-text s2l7-result-text--good">
                  <h2>Kerja Bagus!</h2>
                  <p>
                    Kamu memilih mencari belokan lain. Saat ada rambu dilarang
                    putar balik, pengendara harus tetap mengikuti jalur yang
                    aman sampai menemukan tempat putar balik yang diperbolehkan.
                  </p>
                </div>
              </div>

              <div className="s2l7-result-buttons">
                <button
                  type="button"
                  className="s2l7-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l7-secondary-button"
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