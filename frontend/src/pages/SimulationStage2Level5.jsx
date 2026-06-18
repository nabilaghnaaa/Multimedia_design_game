import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationStage2Level5.css";

import level5Bg from "../assets/simulation/stage2/level5/level5-bg.png";
import riderGirlBack from "../assets/simulation/stage2/level5/rider-girl-back.png";
import riderBoyBlue from "../assets/simulation/stage2/level5/rider-boy-blue.png";
import riderGirlLeft from "../assets/simulation/stage2/level5/rider-girl-left.png";
import crashLevel5 from "../assets/simulation/stage2/level5/crash-level5.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionLeft from "../assets/simulation/stage1/level1/bubble-question-left.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";
import bubbleGoodRight from "../assets/simulation/stage1/level1/bubble-good-right.png";

import backsoundMusic from "../assets/sounds/backsound.mp3";
import buttonClickSound from "../assets/sounds/button-click.mp3";
import correctCringSound from "../assets/sounds/correct-cring.mp3";
import crashSound from "../assets/sounds/crash.mp3";
import hormSound from "../assets/sounds/horm.mp3";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  WRONG_ADVANCE: "wrong-advance",
  WRONG_TURN: "wrong-turn",
  WRONG_RESULT: "wrong-result",
  CORRECT_WAIT: "correct-wait",
  CORRECT_RESULT: "correct-result",
};

const BACKSOUND_NORMAL_VOLUME = 0.18;
const BACKSOUND_DUCK_VOLUME = 0.06;

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

export default function SimulationStage2Level5() {
  const navigate = useNavigate();
  const timersRef = useRef([]);
  const restoreBacksoundTimerRef = useRef(null);

  const backsoundAudioRef = useRef(null);
  const buttonClickAudioRef = useRef(null);
  const correctCringAudioRef = useRef(null);
  const crashAudioRef = useRef(null);
  const hormAudioRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startCamera, setStartCamera] = useState(false);
  const [showGirlBack, setShowGirlBack] = useState(false);
  const [showBoyHalf, setShowBoyHalf] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const startBacksound = () => {
    if (!backsoundAudioRef.current) return;

    backsoundAudioRef.current.volume = BACKSOUND_NORMAL_VOLUME;
    backsoundAudioRef.current.loop = true;
    backsoundAudioRef.current.muted = false;

    backsoundAudioRef.current.play().catch((error) => {
      console.warn("Backsound belum bisa autoplay sebelum user klik:", error);
    });
  };

  const duckBacksound = (duration = 900) => {
    if (!backsoundAudioRef.current) return;

    if (restoreBacksoundTimerRef.current) {
      clearTimeout(restoreBacksoundTimerRef.current);
      restoreBacksoundTimerRef.current = null;
    }

    backsoundAudioRef.current.volume = BACKSOUND_DUCK_VOLUME;

    restoreBacksoundTimerRef.current = setTimeout(() => {
      if (backsoundAudioRef.current) {
        backsoundAudioRef.current.volume = BACKSOUND_NORMAL_VOLUME;
      }
    }, duration);
  };

  const playSound = (audioRef, volume = 1, duckDuration = 900) => {
    if (!audioRef.current) return;

    duckBacksound(duckDuration);

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.volume = volume;

    audioRef.current.play().catch((error) => {
      console.warn("Sound gagal diputar:", error);
    });
  };

  const saveStage2Level5Progress = () => {
    const completedLevels = safeParseArray("completedLevels", []);
    const unlockedLevels = safeParseArray("unlockedLevels", [1, 6]);

    const updatedCompletedLevels = normalizeNumberArray(
      [...completedLevels, 6, 7, 8, 9, 10],
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
    startBacksound();

    setRestartKey((prev) => prev + 1);
    setPhase(PHASE.INTRO);
    setStartCamera(false);
    setShowGirlBack(false);
    setShowBoyHalf(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setStartCamera(true);
        setShowGirlBack(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setShowBoyHalf(true);
      }, 3900)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 4300)
    );
  };

  useEffect(() => {
    startLevel();

    const unlockAudio = () => {
      startBacksound();
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      clearTimers();

      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);

      if (restoreBacksoundTimerRef.current) {
        clearTimeout(restoreBacksoundTimerRef.current);
      }

      if (backsoundAudioRef.current) {
        backsoundAudioRef.current.pause();
        backsoundAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleWrongAnswer = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef, 1, 450);
    playSound(hormAudioRef, 1, 1000);

    setAnswerLocked(true);
    setPhase(PHASE.WRONG_ADVANCE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.WRONG_TURN);
      }, 520)
    );

    timersRef.current.push(
      setTimeout(() => {
        playSound(crashAudioRef, 1, 1600);
        setPhase(PHASE.WRONG_RESULT);
      }, 1700)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef, 1, 450);

    setAnswerLocked(true);
    saveStage2Level5Progress();
    setPhase(PHASE.CORRECT_WAIT);

    timersRef.current.push(
      setTimeout(() => {
        playSound(correctCringAudioRef, 1, 1300);
        setPhase(PHASE.CORRECT_RESULT);
      }, 1800)
    );
  };

  const handleRetry = () => {
    playSound(buttonClickAudioRef, 1, 450);
    startLevel();
  };

  const handleBack = () => {
    playSound(buttonClickAudioRef, 1, 450);

    setTimeout(() => {
      navigate("/map");
    }, 160);
  };

  const handleFinish = () => {
    playSound(buttonClickAudioRef, 1, 450);

    setTimeout(() => {
      navigate("/simulation/11");
    }, 160);
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isWrongAdvance = phase === PHASE.WRONG_ADVANCE;
  const isWrongTurn = phase === PHASE.WRONG_TURN;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectWait = phase === PHASE.CORRECT_WAIT;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  const showNormalGirlBack =
    showGirlBack &&
    !isWrongTurn &&
    !isWrongResult &&
    !isCorrectResult;

  const showNormalBoyHalf =
    showBoyHalf && !isWrongTurn && !isWrongResult && !isCorrectResult;

  return (
    <main className="simulation-s2l5-page" onClick={startBacksound}>
      <audio
        ref={backsoundAudioRef}
        src={backsoundMusic}
        preload="auto"
        loop
        autoPlay
      />

      <audio ref={buttonClickAudioRef} src={buttonClickSound} preload="auto" />
      <audio ref={correctCringAudioRef} src={correctCringSound} preload="auto" />
      <audio ref={crashAudioRef} src={crashSound} preload="auto" />
      <audio ref={hormAudioRef} src={hormSound} preload="auto" />

      <button type="button" className="s2l5-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="s2l5-badge">
        <span>STAGE 2 - LEVEL 5</span>
        <strong>Rambu Prioritas</strong>
      </div>

      <section
        key={restartKey}
        className={`s2l5-viewport ${
          isWrongResult ? "s2l5-viewport--crash-shake" : ""
        }`}
      >
        <div
          className={`s2l5-bg-world ${
            startCamera ? "s2l5-bg-world--pan-up" : ""
          }`}
        >
          <img
            src={level5Bg}
            alt="Background pertigaan dengan rambu prioritas"
            className="s2l5-bg"
            draggable="false"
          />
        </div>

        <div className="s2l5-actors-layer">
          {showNormalGirlBack && (
            <img
              src={riderGirlBack}
              alt="Rider perempuan dari belakang"
              className={`s2l5-actor s2l5-rider-girl-back ${
                startCamera ? "s2l5-rider-girl-back--enter" : ""
              } ${isQuestion ? "s2l5-rider-girl-back--stop" : ""} ${
                isWrongAdvance ? "s2l5-rider-girl-back--wrong-advance" : ""
              } ${isCorrectWait ? "s2l5-rider-girl-back--wait" : ""}`}
              draggable="false"
            />
          )}

          {showNormalBoyHalf && (
            <img
              src={riderBoyBlue}
              alt="Rider laki-laki biru"
              className={`s2l5-actor s2l5-rider-boy ${
                showBoyHalf ? "s2l5-rider-boy--half" : ""
              } ${isCorrectWait ? "s2l5-rider-boy--pass" : ""}`}
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="s2l5-question-bubble">
                <img
                  src={bubbleQuestionLeft}
                  alt=""
                  className="s2l5-bubble-img"
                  draggable="false"
                />

                <p>
                  Ada rambu prioritas.
                  <br />
                  Siapa yang harus
                  <br />
                  didahulukan?
                </p>
              </div>

              <div className="s2l5-answer-wrapper">
                <button
                  type="button"
                  className="s2l5-answer-button s2l5-answer-button--danger"
                  onClick={handleWrongAnswer}
                >
                  Tidak prioritaskan orang lain
                </button>

                <button
                  type="button"
                  className="s2l5-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Prioritaskan kendaraan lain
                </button>
              </div>
            </>
          )}

          {isWrongTurn && (
            <>
              <img
                src={riderGirlLeft}
                alt="Rider perempuan belok kiri"
                className="s2l5-actor s2l5-rider-girl-left"
                draggable="false"
              />

              <img
                src={riderBoyBlue}
                alt="Rider laki-laki menabrak"
                className="s2l5-actor s2l5-rider-boy-crash-move"
                draggable="false"
              />
            </>
          )}

          {isWrongResult && (
            <>
              <div className="s2l5-result-dim s2l5-result-dim--wrong" />

              <img
                src={crashLevel5}
                alt="Rider laki-laki menabrak rider perempuan"
                className="s2l5-actor s2l5-crash"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="s2l5-actor s2l5-police s2l5-police--stop"
                draggable="false"
              />

              <div className="s2l5-result-bubble s2l5-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="s2l5-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l5-result-text s2l5-result-text--warning">
                  <h2>Bahaya!</h2>
                  <p>
                    Saat ada rambu prioritas, pengendara harus memberi
                    kesempatan kepada kendaraan yang memiliki hak jalan lebih
                    dulu. Kalau langsung belok, tabrakan bisa terjadi.
                  </p>
                </div>
              </div>

              <div className="s2l5-result-buttons">
                <button
                  type="button"
                  className="s2l5-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l5-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="s2l5-result-dim s2l5-result-dim--good" />

              <img
                src={riderBoyBlue}
                alt="Rider laki-laki biru sudah lewat"
                className="s2l5-actor s2l5-rider-boy-safe-final"
                draggable="false"
              />

              <img
                src={policeGood}
                alt="Polisi good"
                className="s2l5-actor s2l5-police s2l5-police--good"
                draggable="false"
              />

              <div className="s2l5-result-bubble s2l5-result-bubble--good">
                <img
                  src={bubbleGoodRight}
                  alt=""
                  className="s2l5-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l5-result-text s2l5-result-text--good">
                  <h2>Bagus!</h2>
                  <p>
                    Kamu memilih memprioritaskan kendaraan lain. Saat ada rambu
                    prioritas, pengendara harus berhenti atau menunggu sampai
                    kendaraan yang berhak jalan lewat terlebih dahulu.
                  </p>
                </div>
              </div>

              <div className="s2l5-result-buttons">
                <button
                  type="button"
                  className="s2l5-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l5-secondary-button"
                  onClick={handleFinish}
                >
                  Lanjut Level 6
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}