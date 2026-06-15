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

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  WRONG_ADVANCE: "wrong-advance",
  WRONG_TURN: "wrong-turn",
  WRONG_RESULT: "wrong-result",
  CORRECT_WAIT: "correct-wait",
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

export default function SimulationStage2Level5() {
  const navigate = useNavigate();
  const timersRef = useRef([]);
  const audioContextRef = useRef(null);

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

  const getAudioContext = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playCrashSound = () => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;

    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.7, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    masterGain.connect(audioContext.destination);

    const boom = audioContext.createOscillator();
    boom.type = "sawtooth";
    boom.frequency.setValueAtTime(135, now);
    boom.frequency.exponentialRampToValueAtTime(35, now + 0.42);

    const boomGain = audioContext.createGain();
    boomGain.gain.setValueAtTime(0.0001, now);
    boomGain.gain.exponentialRampToValueAtTime(0.88, now + 0.015);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    boom.connect(boomGain);
    boomGain.connect(masterGain);

    const bufferSize = audioContext.sampleRate * 0.34;
    const noiseBuffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );

    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(1900, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(260, now + 0.32);

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.9, now + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    boom.start(now);
    boom.stop(now + 0.45);

    noise.start(now);
    noise.stop(now + 0.34);
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

    return () => {
      clearTimers();
    };
  }, []);

  const handleWrongAnswer = () => {
    if (answerLocked) return;

    getAudioContext();
    setAnswerLocked(true);
    setPhase(PHASE.WRONG_ADVANCE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.WRONG_TURN);
      }, 520)
    );

    timersRef.current.push(
      setTimeout(() => {
        playCrashSound();
        setPhase(PHASE.WRONG_RESULT);
      }, 1700)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveStage2Level5Progress();
    setPhase(PHASE.CORRECT_WAIT);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.CORRECT_RESULT);
      }, 1800)
    );
  };

  const handleRetry = () => {
    startLevel();
  };

  const handleBack = () => {
    navigate("/map");
  };

  const handleFinish = () => {
    navigate("/simulation/11");
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
    <main className="simulation-s2l5-page">
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