import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Import semua gambar rambu
import sign1 from '../assets/signs/rambu_1-removebg-preview.png';
import sign21 from '../assets/signs/rambu 2.1.png';
import sign22 from '../assets/signs/rambu 2.2.png';
import sign23 from '../assets/signs/rambu 2.3.png';
import sign24 from '../assets/signs/rambu 2.4.png';
import sign25 from '../assets/signs/rambu 2.5.png';
import sign26 from '../assets/signs/rambu 2.6.png';
import sign3 from '../assets/signs/rambu 3.png';
import sign4 from '../assets/signs/rambu 4 .png';
import sign5 from '../assets/signs/rambu 5.png';
import sign7 from '../assets/signs/rambu 7.png';
import sign8 from '../assets/signs/rambu 8.png';
import bgMap from '../assets/backgrounds/backgrounds.png';
import bgMap2 from '../assets/backgrounds/baground2.png';
import polisiImg from '../assets/characters/polisi1.png';

const signImages = {
  1: sign1,   // Tikungan Tajam
  2: sign21,  // Jalan Licin
  3: sign22,  // Penyeberangan
  4: sign23,  // Persimpangan
  5: sign24,  // Lalu Lintas Dua Arah
  6: sign3,   // Batas Kecepatan
  7: sign4,   // Dilarang Menyalip
  8: sign25,  // Dilarang Masuk
  9: sign26,  // Dilarang Berhenti
  10: sign7,  // Beri Prioritas
  11: sign5,  // Dilarang Belok Kanan / Kiri
  12: sign8,  // Dilarang Putar Balik
};

const consequenceData = {
  1: { emoji: '🚗💨 🪨 💥', text: 'Mobil melaju terlalu cepat di tikungan tajam dan tergelincir keluar jalur!' },
  2: { emoji: '🚲💨 💦 ⚠️ 💥', text: 'Sepeda tergelincir di jalan licin karena mengerem mendadak!' },
  3: { emoji: '🚶‍♂️ 🚗💨 🛑 🫣', text: 'Hampir menabrak pejalan kaki yang sedang menyeberang di zebra cross!' },
  4: { emoji: '🚗💨 🚘💥 📯', text: 'Tabrakan di persimpangan akibat melintas tanpa melihat kiri-kanan!' },
  5: { emoji: '🚗💨 ⛔ 🚘 💥', text: 'Kendaraan berpapasan terlalu dekat dan hampir tabrakan di jalur dua arah!' },
  6: { emoji: '🚗💨 💥 🧱 🚔', text: 'Melanggar batas kecepatan menyebabkan mobil sulit direm dan menabrak pembatas!' },
  7: { emoji: '🚗💨 🚛💨 💥 🚘', text: 'Memaksakan menyalip di jalan berliku dan hampir bertabrakan adu kambing!' },
  8: { emoji: '⛔ 🚗💨 🚘 💥', text: 'Melanggar rambu dilarang masuk sehingga melawan arus dan memicu kecelakaan!' },
  9: { emoji: '🚗🛑 🚛💨 💥 📯', text: 'Berhenti sembarangan membuat jalan terhambat dan memicu tabrak belakang!' },
  10: { emoji: '🚗💨 🚛💨 💥 🛑', text: 'Memotong jalan utama tanpa memberi prioritas dan tertabrak kendaraan prioritas!' },
  11: { emoji: '🚗💨 ➡️ 🚏 💥', text: 'Belok ke arah terlarang dan langsung masuk ke jalur berlawanan!' },
  12: { emoji: '🔄 🚗💨 🚘 💥', text: 'Putar balik di tempat terlarang menghalangi jalan dan tertabrak dari belakang!' },
};

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
};

const SimulationPage = () => {
  const { levelNumber } = useParams();
  const navigate = useNavigate();
  
  const [levelData, setLevelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [shakeOption, setShakeOption] = useState(null);
  
  const [showStage1Modal, setShowStage1Modal] = useState(false);
  const [showStage2Modal, setShowStage2Modal] = useState(false);

  const levelNum = parseInt(levelNumber);
  const bgImg = levelNum <= 5 ? bgMap : bgMap2;

  useEffect(() => {
    const fetchLevel = async () => {
      setIsLoading(true);
      setSelectedOption(null);
      setFeedback(null);
      setShowFeedback(false);
      setConfetti(false);
      setShowStage1Modal(false);
      setShowStage2Modal(false);
      try {
        const res = await axios.get(`http://localhost:5000/api/levels/${levelNum}`);
        setLevelData(res.data);
      } catch (err) {
        console.error("Error fetching level:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLevel();
  }, [levelNum]);

  const handleAnswer = async (option, idx) => {
    if (showFeedback) return;

    setSelectedOption(idx);
    
    const isCorrect = option.is_correct;
    setFeedback({ isCorrect, message: option.feedback_message });
    setShowFeedback(true);

    if (isCorrect) {
      playSound('correct');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
    } else {
      playSound('wrong');
      setShakeOption(idx);
      setTimeout(() => setShakeOption(null), 600);
    }

    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        await axios.post('http://localhost:5000/api/progress/submit', {
          session_id: sessionId,
          stage: levelData.stage,
          level: levelNum,
          is_correct: isCorrect,
          sign_name: levelData.sign_name,
          wrong_option_selected: !isCorrect ? option.option_text : undefined
        });
        
        if (isCorrect) {
          const unlocked = JSON.parse(localStorage.getItem('unlockedLevels') || '[1]');
          const nextLevel = levelNum + 1;
          if (!unlocked.includes(nextLevel) && nextLevel <= 12) {
            unlocked.push(nextLevel);
            localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
          }
          const completed = JSON.parse(localStorage.getItem('completedLevels') || '[]');
          if (!completed.includes(levelNum)) {
            completed.push(levelNum);
            localStorage.setItem('completedLevels', JSON.stringify(completed));
          }
        }
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  const handleNext = () => {
    if (feedback?.isCorrect) {
      if (levelNum === 5) {
        setShowStage1Modal(true);
      } else if (levelNum === 12) {
        setShowStage2Modal(true);
      } else {
        const nextLevel = levelNum + 1;
        if (nextLevel <= 12) {
          navigate(`/simulation/${nextLevel}`);
        } else {
          navigate('/map');
        }
      }
    } else {
      setSelectedOption(null);
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  const signImg = signImages[levelNum];
  const totalLevels = 12;
  const progressPercent = ((levelNum - 1) / totalLevels) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-kids"
           style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <div className="text-8xl animate-bounce-slow">🚦</div>
        <p className="text-white text-2xl font-black mt-4 animate-pulse">MEMUAT SIMULASI...</p>
      </div>
    );
  }

  if (!levelData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-kids"
           style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <div className="text-8xl">😕</div>
        <p className="text-white text-2xl font-black mt-4">Level tidak ditemukan!</p>
        <button onClick={() => navigate('/map')} 
                className="mt-6 btn-arcade-yellow px-8 py-3">← Peta Level</button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center font-kids flex flex-col relative"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] z-0"></div>

      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center pt-32">
          <div className="relative w-32 h-32">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  left: '50%',
                  top: '50%',
                  background: ['#fbbf24', '#4ade80', '#f97316', '#a78bfa', '#38bdf8', '#fb7185'][i % 6],
                  animation: `confetti-${(i % 3) + 1} ${0.6 + Math.random() * 0.6}s ease-out ${Math.random() * 0.3}s forwards`,
                  transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
          <div className="text-8xl" style={{ animation: 'pop 0.4s ease-out forwards' }}>🎉</div>
        </div>
      )}

      {/* Main HUD & Windshield Dashboard */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between p-4">
        
        {/* Top HUD Row */}
        <div className="w-full flex items-center justify-between">
          <button 
            onClick={() => navigate('/map')}
            className="btn-arcade bg-slate-800 text-white border-slate-950 shadow-[0_5px_0_#020617] py-2 px-5 text-sm"
          >
            ← Kembali
          </button>
          
          <div className="flex gap-2">
            <span className={`text-white font-black text-xs px-4 py-1.5 rounded-full border border-white/20 shadow bg-slate-900/80`}>
              {levelNum <= 5 ? '⚠️ Stage 1: Peringatan' : '🛑 Stage 2: Larangan'}
            </span>
          </div>
        </div>

        {/* GPS Progress Bar (Navigator style) */}
        <div className="w-full max-w-xl mx-auto mt-4 px-2">
          <div className="flex justify-between text-white/80 text-xs font-black mb-1">
            <span>RUTE PERJALANAN: LEVEL {levelNum} / {totalLevels}</span>
            <span>{Math.round(progressPercent)}% FINISH</span>
          </div>
          
          {/* GPS Path */}
          <div className="h-6 bg-slate-950/80 rounded-full overflow-visible border-2 border-slate-700 relative flex items-center shadow-inner">
            {/* Dashed center line */}
            <div className="absolute inset-x-4 h-0.5 border-t border-dashed border-white/20 z-0"></div>
            
            {/* Colored unlocked path */}
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-emerald-400 rounded-full transition-all duration-700 relative z-10"
              style={{ width: `${progressPercent}%` }}
            ></div>
            
            {/* Bouncing Car Indicator */}
            <div 
              className="absolute -top-3.5 z-20 text-3xl transition-all duration-700 ease-out"
              style={{ 
                left: `calc(${progressPercent}% - 15px)`,
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
              }}
            >
              🚗💨
            </div>
          </div>
        </div>

        {/* Windshield Cockpit Interface (Layar Kemudi) */}
        <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col justify-center py-6 px-2">
          
          {/* Windshield Panel */}
          <div className={`w-full card-arcade border-4 p-5 md:p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-4
            ${showFeedback && !feedback.isCorrect ? 'border-rose-500/80 neon-glow-red bg-rose-950/40 animate-shake' : 'border-white/10 shadow-2xl'}`}>
            
            {/* Dashboard category badge */}
            <div className="flex justify-center">
              <span className={`text-slate-900 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow
                ${levelNum <= 5 ? 'bg-yellow-400' : 'bg-rose-400'}`}>
                {levelData.sign_category}
              </span>
            </div>

            {/* Display Screen */}
            <div className="flex flex-col md:flex-row items-center gap-6 py-2">
              
              {/* Traffic Sign Glow */}
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 scale-125
                  ${levelNum <= 5 ? 'bg-yellow-400' : 'bg-rose-500'}`}></div>
                {signImg ? (
                  <img 
                    src={signImg} 
                    alt={levelData.sign_name}
                    className="relative w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-2xl animate-float"
                  />
                ) : (
                  <div className="text-8xl relative z-10">🚦</div>
                )}
              </div>

              {/* Windshield Question Text */}
              <div className="flex-1 text-center md:text-left flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow">
                  {levelData.sign_name}
                </h2>
                <div className="w-16 h-1 bg-white/20 rounded-full mx-auto md:mx-0"></div>
                <p className="text-white/95 text-base md:text-lg font-bold leading-relaxed">
                  {levelData.question}
                </p>
              </div>
            </div>

            {/* Consequence Overlay Box (Visualisasi Asap/Ledakan Bahaya) */}
            {showFeedback && !feedback.isCorrect && consequenceData[levelNum] && (
              <div className="w-full p-4 rounded-2xl bg-slate-950/90 border-2 border-red-500 text-center animate-pop relative overflow-hidden">
                {/* Flashing hazard lights */}
                <div className="absolute top-1 left-2 text-xs">🔴</div>
                <div className="absolute top-1 right-2 text-xs">🔴</div>
                
                <p className="text-red-500 font-black text-xs tracking-wider mb-2">⚠️ AKIBAT DIJALAN RAYA:</p>
                <div className="text-4xl mb-2 flex justify-center gap-3 animate-pulse">
                  {consequenceData[levelNum].emoji}
                </div>
                <p className="text-white font-bold text-xs leading-relaxed max-w-md mx-auto">
                  {consequenceData[levelNum].text}
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Dashboard Steering Wheel & Controls Section */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
          
          {/* Steering Wheel emoji & dashboard dials decoration */}
          {!showFeedback && (
            <div className="flex items-center gap-6 opacity-30 text-white select-none pointer-events-none mb-1 animate-float" style={{ animationDuration: '4s' }}>
              <div className="text-xl">📟 60 KM/H</div>
              <div className="text-4xl animate-spin-slow" style={{ animationDuration: '12s' }}>🛞</div>
              <div className="text-xl">⛽ E ... F</div>
            </div>
          )}

          {/* Option Buttons (Arcade pegas style) */}
          {!showFeedback ? (
            <div className="w-full flex flex-col gap-4">
              {levelData.options.map((option, idx) => {
                const btnClass = idx === 0 ? 'btn-arcade-blue' : 'btn-arcade-yellow';
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option, idx)}
                    className={`w-full py-4 text-sm md:text-base ${btnClass}`}
                  >
                    <span className="bg-black/20 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                      {['A', 'B'][idx]}
                    </span>
                    <span className="flex-1 text-left px-2 leading-snug">{option.option_text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Feedback Arcade Banner */
            <div className={`w-full card-arcade border-4 p-5 animate-pop flex flex-col gap-4
              ${feedback.isCorrect ? 'border-emerald-500 neon-glow-green bg-emerald-950/20' : 'border-rose-500 neon-glow-red bg-rose-950/20'}`}>
              
              <div className="flex items-start gap-4">
                <img src={polisiImg} alt="Polisi" className="w-16 h-16 object-contain flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-white font-black text-lg">
                    {feedback.isCorrect ? '🎉 WAH, HEBAT!' : '😅 YAH, HAMPIR!'}
                  </h4>
                  <p className="text-white/80 text-xs md:text-sm font-semibold leading-relaxed mt-1">
                    {feedback.message}
                  </p>
                </div>
              </div>

              {/* Continue Arcade Button */}
              <button 
                onClick={handleNext}
                className={`w-full py-4 text-base ${feedback.isCorrect ? 'btn-arcade-green' : 'btn-arcade-red'}`}
              >
                {feedback.isCorrect 
                  ? (levelNum === 5 ? '🏆 TUNTASKAN STAGE 1' : levelNum === 12 ? '🏆 SELESAIKAN PERMAINAN' : '➡️ JALAN TERUS!') 
                  : '🔄 COBA KEMBALI'}
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Modal Stage 1 Selesai */}
      {showStage1Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-br from-[#064e3b] to-[#022c22] rounded-3xl border-4 border-emerald-400 p-8 max-w-md w-full text-center shadow-2xl animate-pop relative">
            {/* Outer neon border glow */}
            <div className="absolute -inset-1 bg-emerald-400 rounded-3xl blur-xl opacity-20 pointer-events-none z-0"></div>

            <div className="relative z-10">
              <div className="text-8xl mb-4 animate-bounce-slow">⚠️</div>
              <h2 className="text-3xl font-black text-white tracking-wide mb-1">STAGE 1 SELESAI!</h2>
              <h3 className="text-yellow-400 font-black text-lg mb-4">🏆 RAMBU PERINGATAN</h3>
              
              <p className="text-white/90 font-semibold text-sm leading-relaxed mb-6">
                Hebat! Kamu sudah menyelesaikan semua rambu peringatan. Ingat, rambu peringatan membantu kamu lebih waspada terhadap kondisi jalan agar tetap aman!
              </p>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setShowStage1Modal(false);
                    navigate('/simulation/6');
                  }}
                  className="w-full btn-arcade-yellow py-4 text-lg"
                >
                  LANJUT KE STAGE 2 ➡️
                </button>
                <button 
                  onClick={() => {
                    setShowStage1Modal(false);
                    const unlocked = JSON.parse(localStorage.getItem('unlockedLevels') || '[1]').filter(l => l > 5);
                    if (!unlocked.includes(1)) unlocked.push(1);
                    const completed = JSON.parse(localStorage.getItem('completedLevels') || '[]').filter(l => l > 5);
                    localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
                    localStorage.setItem('completedLevels', JSON.stringify(completed));
                    navigate('/simulation/1');
                  }}
                  className="w-full btn-arcade bg-slate-800 text-white border-slate-950 shadow-[0_6px_0_#020617] py-3 text-sm"
                >
                  🔄 ULANGI STAGE 1
                </button>
                <button 
                  onClick={() => {
                    setShowStage1Modal(false);
                    navigate('/map');
                  }}
                  className="text-white/50 hover:text-white font-bold text-xs tracking-wider uppercase mt-2 block"
                >
                  KEMBALI KE PETA LEVEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Game Selesai (Stage 2 & Penutup) */}
      {showStage2Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f0e26] rounded-3xl border-4 border-indigo-400 p-8 max-w-md w-full text-center shadow-2xl animate-pop relative">
            <div className="absolute -inset-1 bg-indigo-500 rounded-3xl blur-xl opacity-20 pointer-events-none z-0"></div>

            <div className="relative z-10">
              <div className="text-8xl mb-4 animate-bounce-slow">🏆</div>
              <h2 className="text-3xl font-black text-white tracking-wide">LUAR BIASA!</h2>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-4">
                PETUALANGAN SELESAI
              </h2>
              
              <div className="bg-slate-950/80 rounded-2xl p-4 mb-6 border border-white/10 text-left">
                <p className="text-yellow-400 font-black text-xs tracking-widest mb-1">📝 PESAN KESELAMATAN JALAN:</p>
                <p className="text-white/80 font-bold text-xs leading-relaxed">
                  Kamu telah mempelajari 12 rambu keselamatan prioritas! Selalu prioritaskan keselamatan diri sendiri dan orang lain saat berada di jalan raya. Perjalanan sesungguhnya adalah di dunia nyata, jadilah pelopor keselamatan lalu lintas sejak dini!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowStage2Modal(false);
                    navigate('/challenge');
                  }}
                  className="w-full btn-arcade-purple py-4 text-base"
                >
                  ⚡ COBA MODE TANTANGAN!
                </button>
                <button 
                  onClick={() => {
                    setShowStage2Modal(false);
                    let unlocked = JSON.parse(localStorage.getItem('unlockedLevels') || '[1]').filter(l => l <= 6);
                    if (!unlocked.includes(6)) unlocked.push(6);
                    const completed = JSON.parse(localStorage.getItem('completedLevels') || '[]').filter(l => l < 6);
                    localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
                    localStorage.setItem('completedLevels', JSON.stringify(completed));
                    navigate('/simulation/6');
                  }}
                  className="w-full btn-arcade bg-slate-800 text-white border-slate-950 shadow-[0_6px_0_#020617] py-2.5 text-xs"
                >
                  🔄 ULANGI STAGE 2
                </button>
                <button 
                  onClick={() => {
                    setShowStage2Modal(false);
                    localStorage.setItem('unlockedLevels', JSON.stringify([1]));
                    localStorage.setItem('completedLevels', JSON.stringify([]));
                    navigate('/simulation/1');
                  }}
                  className="w-full btn-arcade bg-slate-800 text-white border-slate-950 shadow-[0_6px_0_#020617] py-2.5 text-xs"
                >
                  🔄 ULANGI SELURUH PERMAINAN
                </button>
                <button 
                  onClick={() => {
                    setShowStage2Modal(false);
                    navigate('/map');
                  }}
                  className="text-white/50 hover:text-white font-bold text-xs tracking-wider uppercase mt-2 block"
                >
                  KEMBALI KE PETA LEVEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationPage;
