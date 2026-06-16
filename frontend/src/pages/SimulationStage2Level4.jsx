import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationStage2Level4.css";

import level4Bg from "../assets/simulation/stage2/level4/level4-bg.png";
import riderBlue from "../assets/simulation/stage2/level4/rider-blue.png";
import riderRedNormal from "../assets/simulation/stage2/level4/rider-red-normal.png";
import riderRedAngry from "../assets/simulation/stage2/level4/rider-red-angry.png";
import riderPinkCrash from "../assets/simulation/stage2/level4/rider-pink-crash.png";
import crashLevel4 from "../assets/simulation/stage2/level4/crash-level4.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionLeft from "../assets/simulation/stage1/level1/bubble-question-left.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";
import bubbleGoodLeft from "../assets/simulation/stage1/level1/bubble-good-left.png";

import buttonClickSound from "../assets/sounds/button-click.mp3";
import correctCringSound from "../assets/sounds/correct-cring.mp3";
import crashSound from "../assets/sounds/crash.mp3";
import hormSound from "../assets/sounds/horm.mp3";

const PHASE = {
  INTRO: "intro",
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

export default function SimulationStage2Level4() {
  const navigate = useNavigate();
  const timersRef = useRef([]);

  const buttonClickAudioRef = useRef(null);
  const correctCringAudioRef = useRef(null);
  const crashAudioRef = useRef(null);
  const hormAudioRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startCamera, setStartCamera] = useState(false);
  const [showBlueRider, setShowBlueRider] = useState(false);
  const [showRedRider, setShowRedRider] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const playSound = (audioRef) => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    audioRef.current.play().catch((error) => {
      console.warn("Sound gagal diputar:", error);
    });
  };

  const saveStage2Level4Progress = () => {
    const completedLevels = safeParseArray("completedLevels", []);
    const unlockedLevels = safeParseArray("unlockedLevels", [1, 6]);

    const updatedCompletedLevels = normalizeNumberArray(
      [...completedLevels, 6, 7, 8, 9],
      []
    );

    const updatedUnlockedLevels = normalizeNumberArray(
      [...unlockedLevels, 6, 7, 8, 9],
      [1, 6]
    );

    localStorage.setItem("selectedStage", "2");
    localStorage.setItem("selectedLevel", "9");
    localStorage.setItem("selectedStage2Level", "4");
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

    setRestartKey((prev) => prev + 1);
    setPhase(PHASE.INTRO);
    setStartCamera(false);
    setShowBlueRider(false);
    setShowRedRider(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setStartCamera(true);
        setShowBlueRider(true);
        setShowRedRider(true);
      }, 120)
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

    playSound(buttonClickAudioRef);
    playSound(hormAudioRef);

    setAnswerLocked(true);
    setPhase(PHASE.WRONG_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(crashAudioRef);
        setPhase(PHASE.WRONG_RESULT);
      }, 1600)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef);

    setAnswerLocked(true);
    saveStage2Level4Progress();
    setPhase(PHASE.CORRECT_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(correctCringAudioRef);
        setPhase(PHASE.CORRECT_RESULT);
      }, 1800)
    );
  };

  const handleRetry = () => {
    playSound(buttonClickAudioRef);
    startLevel();
  };

  const handleBack = () => {
    playSound(buttonClickAudioRef);
    navigate("/map");
  };

  const handleFinish = () => {
    playSound(buttonClickAudioRef);
    navigate("/map");
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isWrongMove = phase === PHASE.WRONG_MOVE;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectMove = phase === PHASE.CORRECT_MOVE;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  const showNormalBlue = showBlueRider && !isWrongResult && !isCorrectResult;
  const showNormalRed = showRedRider && !isWrongResult && !isCorrectResult;

  return (
    <main className="simulation-s2l4-page">
      <audio ref={buttonClickAudioRef} src={buttonClickSound} preload="auto" />
      <audio ref={correctCringAudioRef} src={correctCringSound} preload="auto" />
      <audio ref={crashAudioRef} src={crashSound} preload="auto" />
      <audio ref={hormAudioRef} src={hormSound} preload="auto" />

      <button type="button" className="s2l4-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="s2l4-badge">
        <span>STAGE 2 - LEVEL 4</span>
        <strong>Larangan Berhenti</strong>
      </div>

      <section
        key={restartKey}
        className={`s2l4-viewport ${
          isWrongResult ? "s2l4-viewport--crash-shake" : ""
        } ${isCorrectResult ? "s2l4-viewport--correct-result" : ""}`}
      >
        <div
          className={`s2l4-bg-world ${
            startCamera ? "s2l4-bg-world--pan-left" : ""
          }`}
        >
          <img
            src={level4Bg}
            alt="Background sekolah dengan rambu larangan berhenti"
            className="s2l4-bg"
            draggable="false"
          />
        </div>

        <div className="s2l4-actors-layer">
          {showNormalBlue && (
            <img
              src={riderBlue}
              alt="Rider biru"
              className={`s2l4-actor s2l4-rider-blue ${
                startCamera ? "s2l4-rider-blue--enter" : ""
              } ${isQuestion ? "s2l4-rider-blue--stop" : ""} ${
                isWrongMove ? "s2l4-rider-blue--wrong-stop" : ""
              } ${isCorrectMove ? "s2l4-rider-blue--correct-go" : ""}`}
              draggable="false"
            />
          )}

          {showNormalRed && (
            <img
              src={riderRedNormal}
              alt="Rider merah normal"
              className={`s2l4-actor s2l4-rider-red ${
                showRedRider ? "s2l4-rider-red--enter" : ""
              } ${isQuestion ? "s2l4-rider-red--follow-stop" : ""} ${
                isWrongMove ? "s2l4-rider-red--warning" : ""
              } ${isCorrectMove ? "s2l4-rider-red--correct-go" : ""}`}
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="s2l4-question-bubble">
                <img
                  src={bubbleQuestionLeft}
                  alt=""
                  className="s2l4-bubble-img"
                  draggable="false"
                />

                <p>
                  Ada rambu larangan berhenti.
                  <br />
                  Bolehkah aku berhenti
                  <br />
                  di area rambu ini?
                </p>
              </div>

              <div className="s2l4-answer-wrapper">
                <button
                  type="button"
                  className="s2l4-answer-button s2l4-answer-button--danger"
                  onClick={handleWrongAnswer}
                >
                  Berhenti di sini
                </button>

                <button
                  type="button"
                  className="s2l4-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Jalan terus
                </button>
              </div>
            </>
          )}

          {isWrongMove && (
            <img
              src={riderPinkCrash}
              alt="Rider pink hampir menabrak"
              className="s2l4-actor s2l4-rider-pink-crash"
              draggable="false"
            />
          )}

          {isWrongResult && (
            <>
              <div className="s2l4-result-dim s2l4-result-dim--wrong" />

              <img
                src={crashLevel4}
                alt="Rider pink menabrak rider biru"
                className="s2l4-actor s2l4-crash"
                draggable="false"
              />

              <img
                src={riderRedAngry}
                alt="Rider merah marah"
                className="s2l4-actor s2l4-rider-red-angry"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="s2l4-actor s2l4-police s2l4-police--stop"
                draggable="false"
              />

              <div className="s2l4-result-bubble s2l4-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="s2l4-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l4-result-text s2l4-result-text--warning">
                  <h2>Bahaya!</h2>
                  <p>
                    Di area rambu larangan berhenti, pengendara tidak boleh
                    berhenti sembarangan. Berhenti mendadak bisa membuat
                    pengendara di belakang menabrak.
                  </p>
                </div>
              </div>

              <div className="s2l4-result-buttons">
                <button
                  type="button"
                  className="s2l4-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l4-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="s2l4-result-dim s2l4-result-dim--good" />

              <img
                src={policeGood}
                alt="Polisi good"
                className="s2l4-actor s2l4-police s2l4-police--good"
                draggable="false"
              />

              <div className="s2l4-result-bubble s2l4-result-bubble--good">
                <img
                  src={bubbleGoodLeft}
                  alt=""
                  className="s2l4-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l4-result-text s2l4-result-text--good">
                  <h2>Bagus!</h2>
                  <p>
                    Kamu memilih jalan terus. Saat ada rambu larangan berhenti,
                    pengendara tidak boleh berhenti di area tersebut agar lalu
                    lintas tetap aman dan lancar.
                  </p>
                </div>
              </div>

              <div className="s2l4-result-buttons">
                <button
                  type="button"
                  className="s2l4-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l4-secondary-button"
                  onClick={handleFinish}
                >
                  Lanjut Level 5
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}