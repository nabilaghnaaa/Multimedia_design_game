import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./SimulationStage2Level1.css";

import levelBg from "../assets/simulation/stage2/level1/stage2-level1-bg.png";
import riderSpeed from "../assets/simulation/stage2/level1/rider-speed.png";
import riderNormal from "../assets/simulation/stage2/level1/rider-normal.png";
import crashImage from "../assets/simulation/stage2/level1/crash-stage2-level1.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionRight from "../assets/simulation/stage1/level1/bubble-question-right.png";
import bubbleWarningLeft from "../assets/simulation/stage1/level1/bubble-warning-left.png";
import bubbleGoodLeft from "../assets/simulation/stage1/level1/bubble-good-left.png";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  SPEED_MOVE: "speed-move",
  CRASH_RESULT: "crash-result",
  SLOW_MOVE: "slow-move",
  GOOD_RESULT: "good-result",
};

const WRONG_MOVE_DURATION = 3200;

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

export default function SimulationStage2Level1() {
  const navigate = useNavigate();
  const timersRef = useRef([]);
  const audioContextRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startCamera, setStartCamera] = useState(false);
  const [showRider, setShowRider] = useState(false);
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
    masterGain.gain.exponentialRampToValueAtTime(0.65, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    masterGain.connect(audioContext.destination);

    const boom = audioContext.createOscillator();
    boom.type = "sawtooth";
    boom.frequency.setValueAtTime(130, now);
    boom.frequency.exponentialRampToValueAtTime(35, now + 0.42);

    const boomGain = audioContext.createGain();
    boomGain.gain.setValueAtTime(0.0001, now);
    boomGain.gain.exponentialRampToValueAtTime(0.85, now + 0.015);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    boom.connect(boomGain);
    boomGain.connect(masterGain);

    const bufferSize = audioContext.sampleRate * 0.36;
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
    noiseFilter.frequency.setValueAtTime(1800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(250, now + 0.34);

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.9, now + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    boom.start(now);
    boom.stop(now + 0.45);

    noise.start(now);
    noise.stop(now + 0.36);
  };

  const saveStage2Level1Progress = () => {
    const completedLevels = safeParseArray("completedLevels", []);
    const unlockedLevels = safeParseArray("unlockedLevels", [1, 6]);

    const updatedCompletedLevels = normalizeNumberArray(
      [...completedLevels, 6],
      []
    );

    const updatedUnlockedLevels = normalizeNumberArray(
      [...unlockedLevels, 6, 7],
      [1, 6]
    );

    localStorage.setItem("selectedStage", "2");
    localStorage.setItem("selectedLevel", "6");
    localStorage.setItem("selectedStage2Level", "1");
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
    setShowRider(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setStartCamera(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setShowRider(true);
      }, 900)
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

  const handleSpeedUp = () => {
    if (answerLocked) return;

    getAudioContext();
    setAnswerLocked(true);
    setPhase(PHASE.SPEED_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playCrashSound();
        setPhase(PHASE.CRASH_RESULT);
      }, WRONG_MOVE_DURATION)
    );
  };

  const handleSlowDown = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveStage2Level1Progress();
    setPhase(PHASE.SLOW_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.GOOD_RESULT);
      }, 1700)
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

  const isQuestion = phase === PHASE.QUESTION;
  const isSpeedMove = phase === PHASE.SPEED_MOVE;
  const isCrashResult = phase === PHASE.CRASH_RESULT;
  const isSlowMove = phase === PHASE.SLOW_MOVE;
  const isGoodResult = phase === PHASE.GOOD_RESULT;

  const crashPortal =
    isCrashResult && typeof document !== "undefined"
      ? createPortal(
          <div className="s2l1-crash-portal-layer">
            <div className="s2l1-crash-red-overlay" />

            <img
              src={crashImage}
              alt="Motor menabrak mobil"
              className="s2l1-crash"
              draggable="false"
            />

            <img
              src={policeStop}
              alt="Polisi memberi tanda stop"
              className="s2l1-police s2l1-police--stop"
              draggable="false"
            />

            <div className="s2l1-result-bubble s2l1-result-bubble--warning-left">
              <img
                src={bubbleWarningLeft}
                alt=""
                className="s2l1-result-bubble-img"
                draggable="false"
              />

              <div className="s2l1-result-text s2l1-result-text--warning">
                <h2>Bahaya!</h2>
                <p>
                  Tetap ngebut di dekat lampu merah sangat berbahaya.
                  Pengendara harus mengurangi kecepatan agar bisa berhenti aman
                  di belakang kendaraan lain.
                </p>
              </div>
            </div>

            <div className="s2l1-result-buttons">
              <button
                type="button"
                className="s2l1-main-button"
                onClick={handleRetry}
              >
                Ulangi Level
              </button>

              <button
                type="button"
                className="s2l1-secondary-button"
                onClick={handleBack}
              >
                Pilih Level
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <main className="simulation-s2l1-page">
        <button type="button" className="s2l1-back-button" onClick={handleBack}>
          ← Pilih Level
        </button>

        <div className="s2l1-badge">
          <span>STAGE 2 - LEVEL 1</span>
          <strong>Batas Kecepatan</strong>
        </div>

        <section
          key={restartKey}
          className={`s2l1-viewport ${
            isSpeedMove ? "s2l1-viewport--wrong-camera-run" : ""
          } ${isCrashResult ? "s2l1-viewport--wrong-camera-done" : ""}`}
        >
          <div
            className={`s2l1-bg-world ${
              startCamera ? "s2l1-bg-world--pan-left" : ""
            }`}
          >
            <img
              src={levelBg}
              alt="Jalan raya dengan lampu merah dan rambu batas kecepatan"
              className="s2l1-bg"
              draggable="false"
            />
          </div>

          <div className="s2l1-actors-layer">
            {!isCrashResult && showRider && (
              <img
                src={isSlowMove || isGoodResult ? riderNormal : riderSpeed}
                alt="Pengendara motor"
                className={`s2l1-actor s2l1-rider ${
                  showRider ? "s2l1-rider--enter" : ""
                } ${isQuestion ? "s2l1-rider--question-stop" : ""} ${
                  isSpeedMove ? "s2l1-rider--speed-crash" : ""
                } ${isSlowMove || isGoodResult ? "s2l1-rider--slow-stop" : ""}`}
                draggable="false"
              />
            )}

            {isQuestion && (
              <>
                <div className="s2l1-question-bubble">
                  <img
                    src={bubbleQuestionRight}
                    alt=""
                    className="s2l1-bubble-img"
                    draggable="false"
                  />

                  <p>
                    Ada rambu batas kecepatan 40 km/jam
                    <br />
                    dan lampu merah di depan.
                    <br />
                    Apa yang harus aku lakukan?
                  </p>
                </div>

                <div className="s2l1-answer-wrapper">
                  <button
                    type="button"
                    className="s2l1-answer-button s2l1-answer-button--danger"
                    onClick={handleSpeedUp}
                  >
                    Tetap ngebut
                  </button>

                  <button
                    type="button"
                    className="s2l1-answer-button"
                    onClick={handleSlowDown}
                  >
                    Turunkan kecepatan
                  </button>
                </div>
              </>
            )}

            {isGoodResult && (
              <>
                <div className="s2l1-result-dim s2l1-result-dim--good" />

                <img
                  src={policeGood}
                  alt="Polisi memberi apresiasi"
                  className="s2l1-actor s2l1-police s2l1-police--good"
                  draggable="false"
                />

                <div className="s2l1-result-bubble s2l1-result-bubble--good-left">
                  <img
                    src={bubbleGoodLeft}
                    alt=""
                    className="s2l1-result-bubble-img"
                    draggable="false"
                  />

                  <div className="s2l1-result-text s2l1-result-text--good">
                    <h2>Bagus!</h2>
                    <p>
                      Kamu memilih menurunkan kecepatan. Saat ada rambu batas
                      kecepatan dan lampu merah, pengendara harus melambat dan
                      siap berhenti.
                    </p>
                  </div>
                </div>

                <div className="s2l1-result-buttons">
                  <button
                    type="button"
                    className="s2l1-main-button"
                    onClick={handleRetry}
                  >
                    Ulangi Level
                  </button>

                  <button
                    type="button"
                    className="s2l1-secondary-button"
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

      {crashPortal}
    </>
  );
}