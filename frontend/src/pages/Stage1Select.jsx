import React, { useEffect, useState } from "react";
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

const getCompletedLevels = () => {
  try {
    return JSON.parse(localStorage.getItem("completedLevels") || "[]");
  } catch {
    return [];
  }
};

const Stage1Select = () => {
  const navigate = useNavigate();

  const [completedLevels, setCompletedLevels] = useState([]);
  const [showPage, setShowPage] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("stage1-no-scroll");

    const savedCompletedLevels = getCompletedLevels();
    setCompletedLevels(savedCompletedLevels);

    if (!localStorage.getItem("completedLevels")) {
      localStorage.setItem("completedLevels", JSON.stringify([]));
    }

    if (!localStorage.getItem("unlockedLevels")) {
      localStorage.setItem("unlockedLevels", JSON.stringify([1]));
    }

    const timer = setTimeout(() => {
      setShowPage(true);
    }, 120);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("stage1-no-scroll");
    };
  }, []);

  const isLevelUnlocked = (levelNumber) => {
    if (levelNumber === 1) return true;
    return completedLevels.includes(levelNumber - 1);
  };

  const handleLevelClick = (levelNumber) => {
    const unlocked = isLevelUnlocked(levelNumber);

    if (!unlocked) {
      setPopupMessage(
        `Level ${levelNumber} masih terkunci. Selesaikan Level ${
          levelNumber - 1
        } dengan benar dulu ya!`
      );

      setTimeout(() => {
        setPopupMessage("");
      }, 2200);

      return;
    }

    localStorage.setItem("selectedStage", "1");
    localStorage.setItem("selectedLevel", String(levelNumber));

    navigate(`/simulation/${levelNumber}`);
  };

  return (
    <main className={`stage1-page ${showPage ? "show" : ""}`}>
      <img
        src={stage1Bg}
        alt="Stage 1 Background"
        className="stage1-bg"
        draggable="false"
      />

      <button
        type="button"
        className="stage1-back-button"
        onClick={() => navigate("/stage-select")}
      >
        ← Pilih Stage
      </button>

      <div className="stage1-levels-layer">
        {stage1Levels.map((item) => {
          const unlocked = isLevelUnlocked(item.level);
          const completed = completedLevels.includes(item.level);
          const imageSrc = unlocked ? item.unlockedImage : item.lockedImage;

          return (
            <button
              key={item.level}
              type="button"
              className={[
                "stage1-level-btn",
                showPage ? "fade-in-visible" : "",
                unlocked ? "is-unlocked" : "is-locked",
                completed ? "is-completed" : "",
              ].join(" ")}
              style={{
                left: item.left,
                top: item.top,
                animationDelay: item.delay,
              }}
              onClick={() => handleLevelClick(item.level)}
              aria-label={
                unlocked
                  ? `Masuk ke Level ${item.level}`
                  : `Level ${item.level} masih terkunci`
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
                  ? `Mulai Level ${item.level}`
                  : `Selesaikan Level ${item.level - 1} dulu`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="stage1-info-card">
        <h2>Stage 1: Rambu Peringatan</h2>
        <p>
          Level berikutnya akan terbuka setelah kamu menyelesaikan level
          sebelumnya dengan benar.
        </p>
      </div>

      {popupMessage && (
        <div className="stage1-popup-message">
          {popupMessage}
        </div>
      )}
    </main>
  );
};

export default Stage1Select;