import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import bgMap from '../assets/backgrounds/backgrounds.png';
import bgMap2 from '../assets/backgrounds/baground2.png';

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

const stageColors = {
  1: {
    bg: 'from-[#064e3b]/85 to-[#022c22]/95',
    header: 'from-emerald-600 to-green-700',
    cardUnlocked: 'from-amber-400 to-yellow-500',
    cardLocked: 'from-slate-700 to-slate-800',
    badge: 'bg-emerald-500',
    tab: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    tabBorder: 'border-emerald-400',
    icon: '⚠️',
    label: 'STAGE 1',
    title: 'Rambu Peringatan',
    glow: 'neon-glow-yellow'
  },
  2: {
    bg: 'from-[#1e3a8a]/85 to-[#0f172a]/95',
    header: 'from-rose-600 to-red-700',
    cardUnlocked: 'from-rose-400 to-pink-500',
    cardLocked: 'from-slate-700 to-slate-800',
    badge: 'bg-rose-500',
    tab: 'bg-gradient-to-r from-rose-500 to-red-600',
    tabBorder: 'border-rose-400',
    icon: '🛑',
    label: 'STAGE 2',
    title: 'Larangan & Prioritas',
    glow: 'neon-glow-red'
  }
};

// Offset kelas Tailwind untuk menciptakan lintasan meliuk (Winding Zigzag Path)
const pathOffsets = [
  "self-start ml-2 sm:ml-12 md:ml-20",      // Kiri
  "self-start ml-16 sm:ml-28 md:ml-44",     // Agak Kiri
  "self-center",                            // Tengah
  "self-end mr-16 sm:mr-28 md:mr-44",       // Agak Kanan
  "self-end mr-2 sm:mr-12 md:mr-20",        // Kanan
  "self-end mr-2 sm:mr-12 md:mr-20",        // Kanan (Stage 2 mulanya)
  "self-end mr-16 sm:mr-28 md:mr-44",       // Agak Kanan
  "self-center",                            // Tengah
  "self-start ml-16 sm:ml-28 md:ml-44",     // Agak Kiri
  "self-start ml-2 sm:ml-12 md:ml-20",      // Kiri
  "self-start ml-16 sm:ml-28 md:ml-44",     // Agak Kiri
  "self-center",                            // Tengah
];

const LevelMap = () => {
  const [levels, setLevels] = useState([]);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [activeStage, setActiveStage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const levelRes = await axios.get('http://localhost:5000/api/levels');
        setLevels(levelRes.data);
        
        const savedUnlocked = localStorage.getItem('unlockedLevels');
        const savedCompleted = localStorage.getItem('completedLevels');
        if (savedUnlocked) setUnlockedLevels(JSON.parse(savedUnlocked));
        if (savedCompleted) setCompletedLevels(JSON.parse(savedCompleted));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => setAnimateIn(true), 100);
      }
    };
    fetchData();
  }, []);

  const handleResetStage = (stageNum) => {
    if (window.confirm(`Apakah kamu yakin ingin mengulang seluruh level di Stage ${stageNum}? Progress belajarmu di stage ini akan diulang.`)) {
      let unlocked = [...unlockedLevels];
      let completed = [...completedLevels];
      
      if (stageNum === 1) {
        unlocked = unlocked.filter(l => l === 1 || l > 5);
        completed = completed.filter(l => l > 5);
        if (!unlocked.includes(1)) unlocked.push(1);
      } else {
        unlocked = unlocked.filter(l => l <= 6);
        completed = completed.filter(l => l < 6);
        if (completedLevels.includes(5) && !unlocked.includes(6)) unlocked.push(6);
      }
      
      localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
      localStorage.setItem('completedLevels', JSON.stringify(completed));
      setUnlockedLevels(unlocked);
      setCompletedLevels(completed);
    }
  };

  const stage1Levels = levels.filter(l => l.stage === 1);
  const stage2Levels = levels.filter(l => l.stage === 2);
  const currentLevels = activeStage === 1 ? stage1Levels : stage2Levels;
  const config = stageColors[activeStage];
  const bgImg = activeStage === 1 ? bgMap : bgMap2;

  const handleLevelClick = (lvl) => {
    if (unlockedLevels.includes(lvl.level)) {
      navigate(`/simulation/${lvl.level}`);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col font-kids relative"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-0"></div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Top HUD Bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button 
            onClick={() => navigate('/')}
            className="btn-arcade bg-slate-800 text-white border-slate-900 shadow-[0_5px_0_#020617] py-2 px-6"
          >
            🏠 Beranda
          </button>

          <div className="bg-slate-900/80 text-yellow-400 border border-yellow-400/30 font-black py-2 px-6 rounded-full shadow-lg">
            🌟 Level Terbuka: {unlockedLevels.length} / 12
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center py-4 px-4">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 tracking-wider drop-shadow-lg"
              style={{ WebkitTextStroke: '1.5px #0f172a' }}>
            PETA PETUALANGAN
          </h1>
          <p className="text-white/80 font-bold text-sm tracking-wide mt-1">Selesaikan rute aspal untuk belajar rambu lalu lintas!</p>
        </div>

        {/* Stage Tabs (Arcade Style Switch) */}
        <div className="flex justify-center gap-4 px-4 mb-8">
          {[1, 2].map(stageNum => {
            const s = stageColors[stageNum];
            const isActive = activeStage === stageNum;
            return (
              <button
                key={stageNum}
                onClick={() => setActiveStage(stageNum)}
                className={`flex items-center gap-2 py-3.5 px-6 rounded-2xl font-black text-lg transition-all duration-300 border-4 shadow-xl active:translate-y-[4px]
                  ${isActive 
                    ? `${s.tab} text-white ${s.tabBorder} scale-105 shadow-2xl` 
                    : 'bg-slate-950/80 text-white/50 border-white/10 hover:bg-slate-900 hover:text-white/80'}`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
                <span className="hidden sm:inline text-xs opacity-75 font-bold">({s.title})</span>
              </button>
            );
          })}
        </div>

        {/* Levels Winding Path Container */}
        <div className="flex-1 px-4 pb-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-7xl animate-bounce-slow">🗺️</div>
              <p className="text-white font-black text-xl mt-4 animate-pulse">MEMBUKA PETA...</p>
            </div>
          ) : (
            <div className={`max-w-xl mx-auto card-arcade p-6 md:p-8 flex flex-col gap-12 relative border border-white/10`}>
              
              {/* Stage Arcade Header */}
              <div className={`bg-gradient-to-r ${config.header} rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border-b-4 border-black/30`}>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-black text-white drop-shadow-md">
                    {config.icon} {config.label}: {config.title}
                  </h2>
                  <p className="text-white/80 text-xs mt-1 font-bold tracking-wider">
                    {currentLevels.length} Rambu Keselamatan
                  </p>
                </div>
                {((activeStage === 1 && completedLevels.some(l => l <= 5)) || 
                  (activeStage === 2 && completedLevels.some(l => l >= 6))) && (
                  <button
                    onClick={() => handleResetStage(activeStage)}
                    className="bg-slate-950/40 hover:bg-slate-950/60 text-white border border-white/20 rounded-xl px-4 py-2 text-xs font-black transition-all active:scale-95 flex items-center gap-1.5 shadow"
                  >
                    🔄 Ulangi Stage
                  </button>
                )}
              </div>

              {currentLevels.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="text-white/70 font-black text-lg">Level Belum Siap</p>
                  <p className="text-white/50 text-xs mt-2">Silakan hubungi pengembang.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-16 relative">
                  
                  {/* Decorative Winding Road center-line inside container */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-slate-950/40 rounded-full border-x-4 border-slate-700/30 flex flex-col justify-around py-10 pointer-events-none z-0">
                    {[...Array(12)].map((_, idx) => (
                      <div key={idx} className="h-10 w-2 bg-yellow-400/40 mx-auto rounded"></div>
                    ))}
                  </div>

                  {currentLevels.map((lvl, idx) => {
                    const isUnlocked = unlockedLevels.includes(lvl.level);
                    const isCompleted = completedLevels.includes(lvl.level);
                    const signImg = signImages[lvl.level];
                    const offsetClass = pathOffsets[lvl.level - 1]; // Offset alignment

                    return (
                      <div
                        key={lvl._id}
                        onClick={() => handleLevelClick(lvl)}
                        className={`relative group rounded-full w-24 h-24 md:w-32 md:h-32 border-4 transition-all duration-300 z-10 flex flex-col items-center justify-center
                          ${offsetClass}
                          ${isUnlocked 
                            ? `cursor-pointer hover:scale-110 border-yellow-400 bg-slate-800 ${config.glow}` 
                            : 'cursor-not-allowed border-slate-700 bg-slate-950 opacity-60'
                          }`}
                        style={{
                          animation: animateIn ? `pop 0.5s ease-out ${idx * 0.1}s both` : 'none',
                        }}
                      >
                        {/* Completed Star/Badge */}
                        {isCompleted && (
                          <div className="absolute -top-2 -right-2 z-20 bg-yellow-400 text-slate-900 border-2 border-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-black shadow-lg animate-[bounce-slow_3s_infinite]">
                            ⭐
                          </div>
                        )}

                        {/* Level Number Badge */}
                        <div className="absolute -bottom-2 bg-slate-900 text-white border-2 border-white/20 text-xs font-black px-2 py-0.5 rounded-full shadow z-20">
                          LVL {lvl.level}
                        </div>

                        {/* Content: Locked lock or traffic sign */}
                        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center p-2 relative">
                          {isUnlocked && signImg ? (
                            <img 
                              src={signImg} 
                              alt={lvl.sign_name}
                              className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 animate-float"
                              style={{ animationDuration: `${3 + idx * 0.4}s` }}
                            />
                          ) : (
                            <div className="text-3xl md:text-4xl text-slate-600 flex flex-col items-center">
                              <span>⛓️</span>
                              <span className="text-xl -mt-2">🔒</span>
                            </div>
                          )}
                        </div>

                        {/* Hover Sign Name overlay tooltip */}
                        {isUnlocked && (
                          <div className="absolute top-[-40px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-yellow-400 border border-yellow-400/40 text-[10px] md:text-xs font-black py-1 px-3 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30">
                            {lvl.sign_name} ➔
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer HUD (Tantangan Button) */}
        <div className="flex justify-center pb-8 px-4 relative z-10">
          <button 
            onClick={() => navigate('/challenge')}
            className="btn-arcade-purple text-xl py-4 px-10 shadow-2xl animate-pulse-glow"
          >
            ⚡ MODE TANTANGAN
          </button>
        </div>

      </div>
    </div>
  );
};

export default LevelMap;