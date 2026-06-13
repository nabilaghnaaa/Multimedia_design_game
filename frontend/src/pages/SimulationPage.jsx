import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SimulationPage.css";

import level1Bg from "../assets/simulation/stage1/level1/level1-bg.png";

import girlPinkBack from "../assets/simulation/stage1/level1/girl-pink-back.png";
import girlPinkLeft from "../assets/simulation/stage1/level1/girl-pink-left.png";
import boyBlue from "../assets/simulation/stage1/level1/boy-blue.png";
import carBlack from "../assets/simulation/stage1/level1/car-black.png";
import crashImg from "../assets/simulation/stage1/level1/crash.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const PHASE = {
  CAMERA_SHOOT: "camera-shoot",
  GIRL_ENTER: "girl-enter",
  GIRL_STOP: "girl-stop",
  TRAFFIC_ENTER: "traffic-enter",
  QUESTION: "question",
  WRONG_MOVE: "wrong-move",
  WRONG_RESULT: "wrong-result",
  CORRECT_MOVE: "correct-move",
  CORRECT_RESULT: "correct-result",
};

export default function SimulationPage() {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const currentLevel = Number(levelId || 1);

  const timersRef = useRef([]);

  const [phase, setPhase] = useState(PHASE.CAMERA_SHOOT);
  const [cameraAtTop, setCameraAtTop] = useState(false);
  const [showGirl, setShowGirl] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
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

      localStorage.setItem("unlockedLevels", JSON.stringify([1, 2]));
    } catch (error) {
      console.error("Gagal menyimpan progress level 1:", error);
    }
  };

  const startLevel = () => {
    clearTimers();

    setPhase(PHASE.CAMERA_SHOOT);
    setCameraAtTop(false);
    setShowGirl(false);
    setShowTraffic(false);
    setAnswerLocked(false);

    /*
      1. Kamera shoot pelan dari bawah sampai atas/persimpangan.
    */
    timersRef.current.push(
      setTimeout(() => {
        setCameraAtTop(true);
      }, 250)
    );

    /*
      2. Setelah kamera hampir sampai atas, motor cewek masuk dari bawah.
    */
    timersRef.current.push(
      setTimeout(() => {
        setShowGirl(true);
        setPhase(PHASE.GIRL_ENTER);
      }, 3600)
    );

    /*
      3. Cewek stop dulu di bawah persimpangan.
    */
    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.GIRL_STOP);
      }, 5200)
    );

    /*
      4. Baru mobil dan motor cowok biru masuk dari kanan setengah.
    */
    timersRef.current.push(
      setTimeout(() => {
        setShowTraffic(true);
        setPhase(PHASE.TRAFFIC_ENTER);
      }, 5700)
    );

    /*
      5. Semua freeze, lalu pertanyaan muncul.
    */
    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 7100)
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

    setAnswerLocked(true);
    setPhase(PHASE.WRONG_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.WRONG_RESULT);
      }, 950)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveLevel1Progress();
    setPhase(PHASE.CORRECT_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.CORRECT_RESULT);
      }, 1200)
    );
  };

  const handleRetry = () => {
    startLevel();
  };

  const handleBack = () => {
    navigate("/stage1-select");
  };

  const handleNext = () => {
    navigate("/simulation/2");
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isGirlEnter = phase === PHASE.GIRL_ENTER;
  const isGirlStop = phase === PHASE.GIRL_STOP;
  const isTrafficEnter = phase === PHASE.TRAFFIC_ENTER;
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

  const showBoyAndCar =
    showTraffic &&
    !isWrongResult &&
    !isCorrectResult;

  return (
    <main className="simulation-page">
      <button type="button" className="sim-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="sim-level-badge">
        <span>LEVEL {currentLevel}</span>
        <strong>Dilarang Belok Kanan</strong>
      </div>

      <section className="sim-viewport">
        <div className={`sim-world ${cameraAtTop ? "sim-world--top" : ""}`}>
          <img
            src={level1Bg}
            alt="Background Level 1"
            className="sim-bg"
            draggable="false"
          />

          {showNormalGirl && (
            <img
              src={girlPinkBack}
              alt="Cewek pink dari bawah"
              className={`sim-actor sim-girl-back ${
                isGirlEnter ? "sim-girl-back--enter" : ""
              } ${
                isGirlStop || isTrafficEnter || isQuestion
                  ? "sim-girl-back--stop"
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
                className={`sim-actor sim-car ${
                  isTrafficEnter ? "sim-car--enter" : ""
                } ${
                  isQuestion || isWrongMove || isCorrectMove
                    ? "sim-car--stop"
                    : ""
                }`}
                draggable="false"
              />

              <img
                src={boyBlue}
                alt="Cowok biru"
                className={`sim-actor sim-boy ${
                  isTrafficEnter ? "sim-boy--enter" : ""
                } ${
                  isQuestion || isWrongMove || isCorrectMove
                    ? "sim-boy--stop"
                    : ""
                }`}
                draggable="false"
              />
            </>
          )}

          {isQuestion && (
            <>
              <div className="sim-question-bubble">
                <div className="sim-question-icon">?</div>
                <p>
                  Wah, jalan satu arah,
                  <br />
                  ada rambu dilarang belok kanan.
                  <br />
                  Apa yang harus aku lakukan?
                </p>
              </div>

              <div className="sim-answer-wrapper">
                <button
                  type="button"
                  className="sim-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Belok Kiri
                </button>

                <button
                  type="button"
                  className="sim-answer-button"
                  onClick={handleWrongAnswer}
                >
                  Belok Kanan
                </button>
              </div>
            </>
          )}

          {isWrongMove && (
            <img
              src={girlPinkLeft}
              alt="Cewek pink salah belok kanan"
              className="sim-actor sim-girl-wrong"
              draggable="false"
            />
          )}

          {isCorrectMove && (
            <img
              src={girlPinkLeft}
              alt="Cewek pink belok kiri"
              className="sim-actor sim-girl-correct"
              draggable="false"
            />
          )}

          {isWrongResult && (
            <>
              <div className="sim-result-dim sim-result-dim--wrong" />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="sim-actor sim-police sim-police--stop"
                draggable="false"
              />

              <img
                src={crashImg}
                alt="Tabrakan"
                className="sim-actor sim-crash"
                draggable="false"
              />

              <div className="sim-result-bubble sim-result-bubble--warning">
                <div className="sim-warning-icon">!!!</div>

                <h2>Berhenti!</h2>
                <p>
                  Kamu melanggar peraturan.
                  <br />
                  Rambu dilarang belok kanan berarti kamu tidak boleh belok ke
                  kanan karena bisa bertabrakan.
                </p>
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
                src={policeGood}
                alt="Polisi good"
                className="sim-actor sim-police sim-police--good"
                draggable="false"
              />

              <img
                src={girlPinkLeft}
                alt="Cewek aman"
                className="sim-actor sim-girl-safe-final"
                draggable="false"
              />

              <div className="sim-result-bubble sim-result-bubble--good">
                <div className="sim-good-icon">★</div>

                <h2>Kerja Bagus!</h2>
                <p>
                  Kamu memilih belok kiri.
                  <br />
                  Itu sesuai arah jalan satu arah dan membuat perjalanan tetap
                  aman.
                </p>
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