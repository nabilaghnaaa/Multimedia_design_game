import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SimulationPage.css";

import level1Bg from "../assets/simulation/stage1/level1/level1-bg.png";
import level1BgCrash from "../assets/simulation/stage1/level1/level1-bg-crash.png";

import riderBoyBack from "../assets/simulation/stage1/level1/rider-boy-back.png";
import riderBoyCrash from "../assets/simulation/stage1/level1/rider-boy-crash.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionLeft from "../assets/simulation/stage1/level1/bubble-question-left.png";
import bubbleGoodRight from "../assets/simulation/stage1/level1/bubble-good-right.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";

import buttonClickSound from "../assets/sounds/button-click.mp3";
import correctCringSound from "../assets/sounds/correct-cring.mp3";
import crashSound from "../assets/sounds/crash.mp3";
import hornSound from "../assets/sounds/horm.mp3";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  WRONG_MOVE: "wrong-move",
  WRONG_RESULT: "wrong-result",
  CORRECT_MOVE: "correct-move",
  CORRECT_RESULT: "correct-result",
};

export default function SimulationPage() {
  const navigate = useNavigate();
  const { levelNumber } = useParams();

  const currentLevel = Number(levelNumber || 1);
  const timersRef = useRef([]);

  const buttonClickAudioRef = useRef(null);
  const correctCringAudioRef = useRef(null);
  const crashAudioRef = useRef(null);
  const hornAudioRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startCamera, setStartCamera] = useState(false);
  const [showRider, setShowRider] = useState(false);
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

  const saveLevel1Progress = () => {
    try {
      const savedProgress = localStorage.getItem(STAGE1_PROGRESS_KEY);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      const completedLevels = Array.isArray(progress.completedLevels)
        ? progress.completedLevels
        : [];

      const updatedCompletedLevels = [...new Set([...completedLevels, 1])];

      localStorage.setItem(
        STAGE1_PROGRESS_KEY,
        JSON.stringify({
          ...progress,
          unlockedLevel: Math.max(progress.unlockedLevel || 1, 2),
          completedLevels: updatedCompletedLevels,
        })
      );

      localStorage.setItem("selectedStage", "1");
      localStorage.setItem("selectedLevel", "1");
      localStorage.setItem("unlockedLevels", JSON.stringify([1, 2]));
    } catch (error) {
      console.error("Gagal menyimpan progress level 1:", error);
    }
  };

  const startLevel = () => {
    clearTimers();

    setRestartKey((prevKey) => prevKey + 1);
    setPhase(PHASE.INTRO);
    setStartCamera(false);
    setShowRider(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setStartCamera(true);
        setShowRider(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 1600)
    );
  };

  useEffect(() => {
    startLevel();

    return () => {
      clearTimers();
    };
  }, [currentLevel]);

  const handleWrongAnswer = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef);
    playSound(hornAudioRef);

    setAnswerLocked(true);
    setPhase(PHASE.WRONG_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(crashAudioRef);
        setPhase(PHASE.WRONG_RESULT);
      }, 1450)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef);

    setAnswerLocked(true);
    saveLevel1Progress();
    setPhase(PHASE.CORRECT_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(correctCringAudioRef);
        setPhase(PHASE.CORRECT_RESULT);
      }, 1300)
    );
  };

  const handleRetry = () => {
    playSound(buttonClickAudioRef);
    startLevel();
  };

  const handleBack = () => {
    playSound(buttonClickAudioRef);
    navigate("/stage1-select");
  };

  const handleNext = () => {
    playSound(buttonClickAudioRef);
    navigate("/simulation/2");
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isWrongMove = phase === PHASE.WRONG_MOVE;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectMove = phase === PHASE.CORRECT_MOVE;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  const showNormalRider = showRider && !isWrongResult && !isCorrectResult;

  return (
    <main className="simulation-page">
      <audio ref={buttonClickAudioRef} src={buttonClickSound} preload="auto" />
      <audio ref={correctCringAudioRef} src={correctCringSound} preload="auto" />
      <audio ref={crashAudioRef} src={crashSound} preload="auto" />
      <audio ref={hornAudioRef} src={hornSound} preload="auto" />

      <button type="button" className="sim-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="sim-level-badge">
        <span>STAGE 1 - LEVEL {currentLevel}</span>
        <strong>Peringatan Tikungan Tajam</strong>
      </div>

      <section
        key={restartKey}
        className={`sim-viewport ${
          isWrongResult ? "sim-viewport--crash-shake" : ""
        }`}
      >
        <div
          className={`sim-bg-world ${
            startCamera ? "sim-bg-world--top" : ""
          } ${isWrongMove ? "sim-bg-world--wrong-move" : ""} ${
            isWrongResult ? "sim-bg-world--crash-view" : ""
          } ${isCorrectResult ? "sim-bg-world--correct-view" : ""}`}
        >
          <img
            src={isWrongResult ? level1BgCrash : level1Bg}
            alt="Background jalan tikungan tajam"
            className="sim-bg"
            draggable="false"
          />
        </div>

        <div className="sim-actors-layer">
          {showNormalRider && (
            <img
              src={riderBoyBack}
              alt="Rider cowok biru dari belakang"
              className={`sim-actor sim-rider-boy-back ${
                startCamera ? "sim-rider-boy-back--enter" : ""
              } ${isQuestion ? "sim-rider-boy-back--stop" : ""} ${
                isWrongMove ? "sim-rider-boy-back--wrong-fast" : ""
              } ${isCorrectMove ? "sim-rider-boy-back--correct-slow" : ""}`}
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="sim-question-bubble">
                <img
                  src={bubbleQuestionLeft}
                  alt=""
                  className="sim-bubble-img"
                  draggable="false"
                />

                <p>
                  Ada rambu peringatan
                  <br />
                  tikungan tajam.
                  <br />
                  Apa yang harus dilakukan?
                </p>
              </div>

              <div className="sim-answer-wrapper">
                <button
                  type="button"
                  className="sim-answer-button sim-answer-button--danger"
                  onClick={handleWrongAnswer}
                >
                  Tetap Ngebut
                </button>

                <button
                  type="button"
                  className="sim-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Kurangi Kecepatan
                </button>
              </div>
            </>
          )}

          {isWrongResult && (
            <>
              <div className="sim-result-dim sim-result-dim--wrong" />

              <img
                src={riderBoyCrash}
                alt="Rider cowok terpental karena menabrak pembatas"
                className="sim-actor sim-rider-boy-crash"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="sim-actor sim-police sim-police--stop"
                draggable="false"
              />

              <div className="sim-result-bubble sim-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="sim-result-bubble-img"
                  draggable="false"
                />

                <div className="sim-result-text sim-result-text--warning">
                  <h2>Bahaya!</h2>
                  <p>
                    Saat ada rambu peringatan tikungan tajam, pengendara tidak
                    boleh ngebut. Kecepatan harus dikurangi agar tidak keluar
                    jalur atau menabrak pembatas jalan.
                  </p>
                </div>
              </div>

              <div className="sim-result-buttons">
                <button
                  type="button"
                  className="sim-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="sim-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="sim-result-dim sim-result-dim--correct" />

              <img
                src={riderBoyBack}
                alt="Rider cowok aman setelah mengurangi kecepatan"
                className="sim-actor sim-rider-boy-safe-final"
                draggable="false"
              />

              <img
                src={policeGood}
                alt="Polisi good"
                className="sim-actor sim-police sim-police--good"
                draggable="false"
              />

              <div className="sim-result-bubble sim-result-bubble--good">
                <img
                  src={bubbleGoodRight}
                  alt=""
                  className="sim-result-bubble-img"
                  draggable="false"
                />

                <div className="sim-result-text sim-result-text--good">
                  <h2>Kerja Bagus!</h2>
                  <p>
                    Kamu memilih mengurangi kecepatan. Saat melewati tikungan
                    tajam, pengendara harus lebih pelan, fokus, dan mengikuti
                    arah jalan dengan hati-hati.
                  </p>
                </div>
              </div>

              <div className="sim-result-buttons">
                <button
                  type="button"
                  className="sim-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="sim-secondary-button"
                  onClick={handleNext}
                >
                  Lanjut Level 2
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}