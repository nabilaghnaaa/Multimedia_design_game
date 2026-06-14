import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationStage2Level3.css";

import level3Bg from "../assets/simulation/stage2/stage3/level3-bg.png";

import girlPinkBack from "../assets/simulation/stage2/stage3/girl-pink-back.png";
import girlPinkLeft from "../assets/simulation/stage2/stage3/girl-pink-left.png";
import girlPinkRight from "../assets/simulation/stage2/stage3/girl-pink-right.png";
import boyBlue from "../assets/simulation/stage2/stage3/boy-blue.png";
import carBlack from "../assets/simulation/stage2/stage3/car-black.png";
import crashImg from "../assets/simulation/stage2/stage3/crash.png";

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

export default function SimulationStage2Level3() {
  const navigate = useNavigate();
  const timersRef = useRef([]);
  const audioContextRef = useRef(null);

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

  const saveStage2Level3Progress = () => {
    const completedLevels = safeParseArray("completedLevels", []);
    const unlockedLevels = safeParseArray("unlockedLevels", [1, 6]);

    const updatedCompletedLevels = normalizeNumberArray(
      [...completedLevels, 6, 7, 8],
      []
    );

    const updatedUnlockedLevels = normalizeNumberArray(
      [...unlockedLevels, 6, 7, 8],
      [1, 6]
    );

    localStorage.setItem("selectedStage", "2");
    localStorage.setItem("selectedLevel", "8");
    localStorage.setItem("selectedStage2Level", "3");
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

    getAudioContext();
    setAnswerLocked(true);
    setPhase(PHASE.WRONG_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playCrashSound();
        setPhase(PHASE.WRONG_RESULT);
      }, 900)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveStage2Level3Progress();
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
    <main className="simulation-s2l3-page">
      <button type="button" className="s2l3-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="s2l3-level-badge">
        <span>STAGE 2 - LEVEL 3</span>
        <strong>Dilarang Masuk</strong>
      </div>

      <section key={restartKey} className="s2l3-viewport">
        <div
          className={`s2l3-bg-world ${
            startCamera ? "s2l3-bg-world--top" : ""
          }`}
        >
          <img
            src={level3Bg}
            alt="Background jalan satu arah dengan rambu dilarang masuk"
            className="s2l3-bg"
            draggable="false"
          />
        </div>

        <div className="s2l3-actors-layer">
          {showNormalGirl && (
            <img
              src={girlPinkBack}
              alt="Pengendara dari bawah"
              className={`s2l3-actor s2l3-girl-back ${
                isIntro ? "s2l3-girl-back--walk" : ""
              } ${
                isGirlStop || isTrafficEnter || isQuestion
                  ? "s2l3-girl-back--stop"
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
                className={`s2l3-actor s2l3-car ${
                  isTrafficEnter ? "s2l3-car--enter" : ""
                } ${isQuestion ? "s2l3-car--stop" : ""} ${
                  isWrongMove || isWrongResult ? "s2l3-car--wrong-drive" : ""
                } ${
                  isCorrectMove || isCorrectResult
                    ? "s2l3-car--correct-drive"
                    : ""
                }`}
                draggable="false"
              />

              <img
                src={boyBlue}
                alt="Pengendara biru"
                className={`s2l3-actor s2l3-boy ${
                  isTrafficEnter ? "s2l3-boy--enter" : ""
                } ${isQuestion ? "s2l3-boy--stop" : ""} ${
                  isWrongMove || isWrongResult ? "s2l3-boy--wrong-move" : ""
                } ${
                  isCorrectMove || isCorrectResult
                    ? "s2l3-boy--correct-drive"
                    : ""
                }`}
                draggable="false"
              />
            </>
          )}

          {isQuestion && (
            <>
              <div className="s2l3-question-bubble">
                <img
                  src={bubbleQuestionRight}
                  alt=""
                  className="s2l3-bubble-img"
                  draggable="false"
                />

                <p>
                  Ada rambu dilarang masuk.
                  <br />
                  Jalan ini satu arah dari arah berlawanan.
                  <br />
                  Apa yang harus aku lakukan?
                </p>
              </div>

              <div className="s2l3-answer-wrapper">
                <button
                  type="button"
                  className="s2l3-answer-button s2l3-answer-button--danger"
                  onClick={handleWrongAnswer}
                >
                  Tetap Masuk
                </button>

                <button
                  type="button"
                  className="s2l3-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Tidak Masuk
                </button>
              </div>
            </>
          )}

          {isWrongMove && (
            <img
              src={girlPinkRight}
              alt="Pengendara tetap masuk"
              className="s2l3-actor s2l3-girl-wrong"
              draggable="false"
            />
          )}

          {isCorrectMove && (
            <img
              src={girlPinkLeft}
              alt="Pengendara tidak masuk"
              className="s2l3-actor s2l3-girl-correct"
              draggable="false"
            />
          )}

          {isWrongResult && (
            <>
              <div className="s2l3-result-dim s2l3-result-dim--wrong" />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="s2l3-actor s2l3-police s2l3-police--stop"
                draggable="false"
              />

              <img
                src={crashImg}
                alt="Tabrakan"
                className="s2l3-actor s2l3-crash"
                draggable="false"
              />

              <div className="s2l3-result-bubble s2l3-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="s2l3-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l3-result-text s2l3-result-text--warning">
                  <h2>Berhenti!</h2>
                  <p>
                    Rambu dilarang masuk berarti kamu tidak boleh memasuki jalan
                    dari arah tersebut. Jalan itu satu arah, jadi masuk dari
                    arah berlawanan bisa menyebabkan tabrakan.
                  </p>
                </div>
              </div>

              <div className="s2l3-result-buttons">
                <button
                  type="button"
                  className="s2l3-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l3-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="s2l3-result-dim s2l3-result-dim--correct" />

              <img
                src={policeGood}
                alt="Polisi good"
                className="s2l3-actor s2l3-police s2l3-police--good"
                draggable="false"
              />

              <img
                src={girlPinkLeft}
                alt="Pengendara aman"
                className="s2l3-actor s2l3-girl-safe-final"
                draggable="false"
              />

              <div className="s2l3-result-bubble s2l3-result-bubble--good">
                <img
                  src={bubbleGoodLeft}
                  alt=""
                  className="s2l3-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l3-result-text s2l3-result-text--good">
                  <h2>Bagus!</h2>
                  <p>
                    Kamu memilih tidak masuk. Saat ada rambu dilarang masuk,
                    pengendara harus berhenti dan mencari jalur lain yang sesuai
                    arah jalan.
                  </p>
                </div>
              </div>

              <div className="s2l3-result-buttons">
                <button
                  type="button"
                  className="s2l3-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l3-secondary-button"
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