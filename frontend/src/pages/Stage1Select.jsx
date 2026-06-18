import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Stage1Select.css";

import stage1Bg from "../assets/stage-levels/stage1/stage1-bg.png";

import level1Unlocked from "../assets/stage-levels/stage1/level-1-unlocked.png";
import level2Locked from "../assets/stage-levels/stage1/level-2-locked.png";
import level2Unlocked from "../assets/stage-levels/stage1/level-2-unlocked.png";
import level3Locked from "../assets/stage-levels/stage1/level-3-locked.png";
import level3Unlocked from "../assets/stage-levels/stage1/level-3-unlocked.png";
import level4Locked from "../assets/stage-levels/stage1/level-4-locked.png";
import level4Unlocked from "../assets/stage-levels/stage1/level-4-unlocked.png";
import level5Locked from "../assets/stage-levels/stage1/level-5-locked.png";
import level5Unlocked from "../assets/stage-levels/stage1/level-5-unlocked.png";

import backsoundMusic from "../assets/sounds/backsound.mp3";
import buttonClickSound from "../assets/sounds/button-click.mp3";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const stage1Levels = [
  {
    level: 1,
    title: "Level 1",
    lockedImage: level1Unlocked,
    unlockedImage: level1Unlocked,
    left: "19.5%",
    top: "42.5%",
    delay: "0.1s",
  },
  {
    level: 2,
    title: "Level 2",
    lockedImage: level2Locked,
    unlockedImage: level2Unlocked,
    left: "35.3%",
    top: "56.8%",
    delay: "0.25s",
  },
  {
    level: 3,
    title: "Level 3",
    lockedImage: level3Locked,
    unlockedImage: level3Unlocked,
    left: "51%",
    top: "42.5%",
    delay: "0.4s",
  },
  {
    level: 4,
    title: "Level 4",
    lockedImage: level4Locked,
    unlockedImage: level4Unlocked,
    left: "67.4%",
    top: "56.8%",
    delay: "0.55s",
  },
  {
    level: 5,
    title: "Level 5",
    lockedImage: level5Locked,
    unlockedImage: level5Unlocked,
    left: "82.2%",
    top: "42.5%",
    delay: "0.7s",
  },
];

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

const safeParseStage1Progress = () => {
  try {
    const savedProgress = localStorage.getItem(STAGE1_PROGRESS_KEY);
    const parsedProgress = savedProgress ? JSON.parse(savedProgress) : {};

    return parsedProgress && typeof parsedProgress === "object"
      ? parsedProgress
      : {};
  } catch (error) {
    console.error("Gagal membaca stage1-progress:", error);
    return {};
  }
};

export default function Stage1Select() {
  const navigate = useNavigate();

  const backsoundAudioRef = useRef(null);
  const buttonClickAudioRef = useRef(null);

  const [completedLevels, setCompletedLevels] = useState([]);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [showPage, setShowPage] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const playButtonClick = () => {
    if (!buttonClickAudioRef.current) return;

    buttonClickAudioRef.current.pause();
    buttonClickAudioRef.current.currentTime = 0;

    buttonClickAudioRef.current.play().catch((error) => {
      console.warn("Sound button gagal diputar:", error);
    });
  };

  const startBacksound = () => {
    if (!backsoundAudioRef.current) return;

    backsoundAudioRef.current.volume = 0.35;
    backsoundAudioRef.current.loop = true;
    backsoundAudioRef.current.muted = false;

    backsoundAudioRef.current.play().catch((error) => {
      console.warn("Backsound belum bisa autoplay sebelum user klik:", error);
    });
  };

  useEffect(() => {
    document.body.classList.add("stage1-no-scroll");

    const savedCompletedLevels = safeParseArray("completedLevels", []);
    const savedUnlockedLevels = safeParseArray("unlockedLevels", [1]);
    const stage1Progress = safeParseStage1Progress();

    const progressCompletedLevels = normalizeNumberArray(
      stage1Progress.completedLevels || [],
      []
    );

    const progressUnlockedLevel = Number(stage1Progress.unlockedLevel || 1);

    const mergedUnlockedLevels = [...new Set([...savedUnlockedLevels, 1])];

    if (Number.isFinite(progressUnlockedLevel)) {
      for (let level = 1; level <= progressUnlockedLevel; level += 1) {
        mergedUnlockedLevels.push(level);
      }
    }

    const finalUnlockedLevels = normalizeNumberArray(mergedUnlockedLevels, [1]);

    const finalCompletedLevels = normalizeNumberArray(
      [...savedCompletedLevels, ...progressCompletedLevels],
      []
    );

    setUnlockedLevels(finalUnlockedLevels);
    setCompletedLevels(finalCompletedLevels);

    localStorage.setItem("unlockedLevels", JSON.stringify(finalUnlockedLevels));

    localStorage.setItem(
      "completedLevels",
      JSON.stringify(finalCompletedLevels)
    );

    localStorage.setItem("selectedStage", "1");

    const timer = setTimeout(() => {
      setShowPage(true);
    }, 120);

    const audio = backsoundAudioRef.current;

    if (audio) {
      audio.volume = 0.35;
      audio.loop = true;
      audio.muted = false;

      audio.play().catch((error) => {
        console.warn(
          "Browser memblokir autoplay backsound. Musik akan aktif setelah user klik halaman:",
          error
        );
      });
    }

    const unlockAudio = () => {
      startBacksound();
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("stage1-no-scroll");

      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);

      if (backsoundAudioRef.current) {
        backsoundAudioRef.current.pause();
        backsoundAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const isLevelUnlocked = (levelNumber) => {
    const numberLevel = Number(levelNumber);

    if (numberLevel === 1) return true;

    return (
      unlockedLevels.includes(numberLevel) ||
      completedLevels.includes(numberLevel - 1)
    );
  };

  const isLevelCompleted = (levelNumber) => {
    const numberLevel = Number(levelNumber);
    return completedLevels.includes(numberLevel);
  };

  const handleLevelClick = (levelNumber) => {
    playButtonClick();
    startBacksound();

    const numberLevel = Number(levelNumber);

    if (!Number.isFinite(numberLevel)) {
      console.error("Level tidak valid:", levelNumber);
      return;
    }

    const unlocked = isLevelUnlocked(numberLevel);

    if (!unlocked) {
      setPopupMessage(
        `Level ${numberLevel} masih terkunci. Selesaikan Level ${
          numberLevel - 1
        } dengan benar dulu ya!`
      );

      setTimeout(() => {
        setPopupMessage("");
      }, 2200);

      return;
    }

    localStorage.setItem("selectedStage", "1");
    localStorage.setItem("selectedLevel", String(numberLevel));

    setTimeout(() => {
      navigate(`/simulation/${numberLevel}`);
    }, 160);
  };

  const handleBackToStageSelect = () => {
    playButtonClick();
    startBacksound();

    setTimeout(() => {
      navigate("/stage-select");
    }, 160);
  };

  return (
    <main className={`stage1-page ${showPage ? "show" : ""}`}>
      <audio
        ref={backsoundAudioRef}
        src={backsoundMusic}
        preload="auto"
        loop
        autoPlay
      />

      <audio
        ref={buttonClickAudioRef}
        src={buttonClickSound}
        preload="auto"
      />

      <img
        src={stage1Bg}
        alt="Stage 1 Rambu Peringatan"
        className="stage1-bg"
        draggable="false"
      />

      <button
        type="button"
        className="stage1-back-button"
        onClick={handleBackToStageSelect}
      >
        ← Pilih Stage
      </button>

      <section className="stage1-levels-layer">
        {stage1Levels.map((item) => {
          const levelNumber = Number(item.level);
          const unlocked = isLevelUnlocked(levelNumber);
          const completed = isLevelCompleted(levelNumber);
          const imageSrc = unlocked ? item.unlockedImage : item.lockedImage;

          return (
            <button
              key={levelNumber}
              type="button"
              className={`stage1-level-btn ${
                showPage ? "fade-in-visible" : ""
              } ${unlocked ? "is-unlocked" : "is-locked"} ${
                completed ? "is-completed" : ""
              }`}
              style={{
                left: item.left,
                top: item.top,
                animationDelay: item.delay,
              }}
              onClick={() => handleLevelClick(levelNumber)}
              aria-label={
                unlocked
                  ? `Masuk ke Level ${levelNumber}`
                  : `Level ${levelNumber} masih terkunci`
              }
            >
              <img
                src={imageSrc}
                alt={item.title}
                className="stage1-level-sign"
                draggable="false"
              />

              <span className="stage1-level-tooltip">
                {unlocked
                  ? `Mulai Level ${levelNumber}`
                  : `Selesaikan Level ${levelNumber - 1} dulu`}
              </span>
            </button>
          );
        })}
      </section>

      <section className="stage1-info-card">
        <h2>Stage 1: Rambu Peringatan</h2>
        <p>
          Level berikutnya akan terbuka setelah kamu menyelesaikan level
          sebelumnya dengan benar.
        </p>
      </section>

      {popupMessage && (
        <div className="stage1-popup-message">{popupMessage}</div>
      )}
    </main>
  );
}