import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationLevel3.css";

import level3Bg from "../assets/simulation/stage1/level3/level3-bg.png";
import boyStanding from "../assets/simulation/stage1/level3/boy-standing.png";
import girlStandingBlackShock from "../assets/simulation/stage1/level3/girl-standing-black1.png";
import girlStandingBlackNormal from "../assets/simulation/stage1/level3/girl-standing-black2.png";
import girlStandingPink from "../assets/simulation/stage1/level3/girl-standing-pink.png";
import girlRiderPink from "../assets/simulation/stage1/level3/girl-rider-pink.png";
import crashLevel3 from "../assets/simulation/stage1/level3/crash.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionRight from "../assets/simulation/stage1/level1/bubble-question-right.png";
import bubbleGoodRight from "../assets/simulation/stage1/level1/bubble-good-right.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";

import buttonClickSound from "../assets/sounds/button-click.mp3";
import correctCringSound from "../assets/sounds/correct-cring.mp3";
import crashSound from "../assets/sounds/crash.mp3";
import hormSound from "../assets/sounds/horm.mp3";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  WRONG_MOVE: "wrong-move",
  WRONG_RESULT: "wrong-result",
  CORRECT_MOVE: "correct-move",
  CORRECT_RESULT: "correct-result",
};

export default function SimulationLevel3() {
  const navigate = useNavigate();
  const timersRef = useRef([]);

  const buttonClickAudioRef = useRef(null);
  const correctCringAudioRef = useRef(null);
  const crashAudioRef = useRef(null);
  const hormAudioRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startScene, setStartScene] = useState(false);
  const [showRider, setShowRider] = useState(false);
  const [showBoy, setShowBoy] = useState(false);
  const [showGirlBlackNormal, setShowGirlBlackNormal] = useState(false);
  const [showGirlPink, setShowGirlPink] = useState(false);
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

  const safeParseArray = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return fallback;

      return parsed
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item));
    } catch (error) {
      console.error(`Gagal membaca ${key}:`, error);
      return fallback;
    }
  };

  const saveLevel3Progress = () => {
    try {
      const savedProgress = localStorage.getItem(STAGE1_PROGRESS_KEY);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      const progressCompletedLevels = Array.isArray(progress.completedLevels)
        ? progress.completedLevels
            .map((item) => Number(item))
            .filter((item) => Number.isFinite(item))
        : [];

      const savedCompletedLevels = safeParseArray("completedLevels", []);
      const savedUnlockedLevels = safeParseArray("unlockedLevels", [1]);

      const updatedCompletedLevels = [
        ...new Set([
          ...progressCompletedLevels,
          ...savedCompletedLevels,
          1,
          2,
          3,
        ]),
      ].sort((a, b) => a - b);

      const updatedUnlockedLevels = [
        ...new Set([...savedUnlockedLevels, 1, 2, 3, 4]),
      ].sort((a, b) => a - b);

      localStorage.setItem(
        STAGE1_PROGRESS_KEY,
        JSON.stringify({
          ...progress,
          unlockedLevel: 4,
          completedLevels: updatedCompletedLevels,
        })
      );

      localStorage.setItem(
        "unlockedLevels",
        JSON.stringify(updatedUnlockedLevels)
      );

      localStorage.setItem(
        "completedLevels",
        JSON.stringify(updatedCompletedLevels)
      );

      localStorage.setItem("selectedStage", "1");
      localStorage.setItem("selectedLevel", "3");
    } catch (error) {
      console.error("Gagal menyimpan progress level 3:", error);
    }
  };

  const startLevel = () => {
    clearTimers();

    setRestartKey((prevKey) => prevKey + 1);
    setPhase(PHASE.INTRO);
    setStartScene(false);
    setShowRider(false);
    setShowBoy(false);
    setShowGirlBlackNormal(false);
    setShowGirlPink(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setShowRider(true);
        setStartScene(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setShowBoy(true);
        setShowGirlBlackNormal(true);
        setShowGirlPink(true);
      }, 3050)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 3850)
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
      }, 1650)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef);

    setAnswerLocked(true);
    saveLevel3Progress();
    setPhase(PHASE.CORRECT_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(correctCringAudioRef);
        setPhase(PHASE.CORRECT_RESULT);
      }, 2800)
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
    navigate("/simulation/4");
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isWrongMove = phase === PHASE.WRONG_MOVE;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectMove = phase === PHASE.CORRECT_MOVE;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  const isResultPhase = isWrongResult || isCorrectResult;

  return (
    <main className="simulation-level3-page">
      <audio ref={buttonClickAudioRef} src={buttonClickSound} preload="auto" />
      <audio ref={correctCringAudioRef} src={correctCringSound} preload="auto" />
      <audio ref={crashAudioRef} src={crashSound} preload="auto" />
      <audio ref={hormAudioRef} src={hormSound} preload="auto" />

      <button type="button" className="level3-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="level3-badge">
        <span>LEVEL 3</span>
        <strong>Peringatan Penyeberangan Pejalan Kaki</strong>
      </div>

      <section key={restartKey} className="level3-viewport">
        <div
          className={`level3-bg-world ${
            startScene ? "level3-bg-world--move" : ""
          }`}
        >
          <img
            src={level3Bg}
            alt="Background depan sekolah dan zebra cross"
            className="level3-bg"
            draggable="false"
          />
        </div>

        <div className="level3-actors-layer">
          {showBoy && !isResultPhase && (
            <img
              src={boyStanding}
              alt="Anak laki-laki pejalan kaki"
              className={`level3-actor level3-boy-standing ${
                showBoy ? "level3-boy-standing--show" : ""
              } ${isWrongMove ? "level3-boy-standing--wrong-down" : ""} ${
                isCorrectMove ? "level3-boy-standing--correct-down" : ""
              }`}
              draggable="false"
            />
          )}

          {showGirlBlackNormal && !isResultPhase && (
            <img
              src={girlStandingBlackNormal}
              alt="Anak perempuan berdiri"
              className={`level3-actor level3-girl-black-normal ${
                showGirlBlackNormal ? "level3-girl-black-normal--show" : ""
              }`}
              draggable="false"
            />
          )}

          {showGirlPink && (
            <img
              src={girlStandingPink}
              alt="Anak perempuan di dekat sekolah"
              className={`level3-actor level3-girl-pink ${
                isResultPhase
                  ? "level3-girl-pink-result"
                  : "level3-girl-pink--show"
              }`}
              draggable="false"
            />
          )}

          {showRider && !isResultPhase && (
            <img
              src={girlRiderPink}
              alt="Pengendara motor perempuan"
              className={`level3-actor level3-rider ${
                startScene ? "level3-rider--ride" : ""
              } ${isQuestion ? "level3-rider--stop" : ""} ${
                isWrongMove ? "level3-rider--wrong-hit" : ""
              } ${isCorrectMove ? "level3-rider--correct-wait" : ""}`}
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="level3-question-bubble">
                <img
                  src={bubbleQuestionRight}
                  alt=""
                  className="level3-bubble-img"
                  draggable="false"
                />

                <p>
                  Wah, ada rambu penyeberangan
                  <br />
                  pejalan kaki di depan.
                  <br />
                  Apa yang harus aku lakukan?
                </p>
              </div>

              <div className="level3-answer-wrapper">
                <button
                  type="button"
                  className="level3-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Pelan-pelan dan beri jalan pejalan kaki
                </button>

                <button
                  type="button"
                  className="level3-answer-button"
                  onClick={handleWrongAnswer}
                >
                  Tetap melaju kencang
                </button>
              </div>
            </>
          )}

          {isWrongResult && (
            <>
              <div className="level3-result-dim level3-result-dim--wrong" />

              <img
                src={girlStandingBlackShock}
                alt="Saksi terkejut melihat tabrakan"
                className="level3-actor level3-girl-black-shock-result"
                draggable="false"
              />

              <img
                src={crashLevel3}
                alt="Tabrakan dengan pejalan kaki"
                className="level3-actor level3-crash"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="level3-actor level3-police level3-police--stop"
                draggable="false"
              />

              <div className="level3-result-bubble level3-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="level3-result-bubble-img"
                  draggable="false"
                />

                <div className="level3-result-text level3-result-text--warning">
                  <h2>Hati-hati!</h2>
                  <p>
                    Saat melihat rambu penyeberangan, pengendara harus
                    memperlambat kendaraan dan memberi kesempatan pejalan kaki
                    untuk menyeberang.
                  </p>
                </div>
              </div>

              <div className="level3-result-buttons">
                <button
                  type="button"
                  className="level3-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="level3-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="level3-result-dim level3-result-dim--correct" />

              <img
                src={boyStanding}
                alt="Pejalan kaki selamat"
                className="level3-actor level3-boy-safe-result"
                draggable="false"
              />

              <img
                src={girlRiderPink}
                alt="Pengendara berhenti"
                className="level3-actor level3-rider-safe-result"
                draggable="false"
              />

              <img
                src={girlStandingBlackNormal}
                alt="Saksi aman"
                className="level3-actor level3-girl-black-normal-result"
                draggable="false"
              />

              <img
                src={policeGood}
                alt="Polisi good"
                className="level3-actor level3-police level3-police--good"
                draggable="false"
              />

              <div className="level3-result-bubble level3-result-bubble--good">
                <img
                  src={bubbleGoodRight}
                  alt=""
                  className="level3-result-bubble-img"
                  draggable="false"
                />

                <div className="level3-result-text level3-result-text--good">
                  <h2>Kerja Bagus!</h2>
                  <p>
                    Kamu memberi kesempatan pejalan kaki menyeberang dulu, lalu
                    pengendara bisa melanjutkan perjalanan dengan aman.
                  </p>
                </div>
              </div>

              <div className="level3-result-buttons">
                <button
                  type="button"
                  className="level3-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="level3-secondary-button"
                  onClick={handleNext}
                >
                  Lanjut Level 4
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}