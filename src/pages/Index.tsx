import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Play, Clock, Infinity, Zap } from 'lucide-react';
import TypingTest from '@/components/TypingTest';
import SongSelector from '@/components/SongSelector';
import SongTypingTest from '@/components/SongTypingTest';
import MultiplayerTypingTest from '@/components/MultiplayerTypingTest';
import { useNavigate } from 'react-router-dom';
import ComingSoon from './ComingSoon';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  lyrics: string[];
  audioUrl: string;
  coverUrl: string;
  bpm: number;
}

const APP_NAME = 'RhythmType';
const APP_TAGLINE = 'Master your typing skills with the rhythm. Challenge yourself in multiple modes and track your progress!';

const Index = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongSelector, setShowSongSelector] = useState(false);
  const [multiplayerRoom, setMultiplayerRoom] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const navigate = useNavigate();

  const modes = [
    {
      id: 'unlimited',
      title: 'Unlimited',
      description: 'Type at your own pace, no time limits',
      icon: Infinity,
      color: 'from-blue-500 to-slate-500',
      duration: null
    },
    {
      id: '15s',
      title: '15 Seconds',
      description: 'Quick burst challenge',
      icon: Zap,
      color: 'from-indigo-400 to-blue-500',
      duration: 15
    },
    {
      id: '30s',
      title: '30 Seconds',
      description: 'Standard speed test',
      icon: Clock,
      color: 'from-blue-400 to-slate-500',
      duration: 30
    },
    {
      id: '60s',
      title: '60 Seconds',
      description: 'Endurance challenge',
      icon: Clock,
      color: 'from-slate-500 to-blue-500',
      duration: 60
    },
    {
      id: 'song',
      title: 'Song Mode',
      description: 'Type to the rhythm of music',
      icon: Music,
      color: 'from-gray-600 to-blue-500',
      duration: null
    },
    {
      id: 'multiplayer',
      title: 'Multiplayer 1v1',
      description: 'Compete head-to-head online! Invite a friend or join a room.',
      icon: Play,
      color: 'from-blue-500 to-slate-500',
      duration: 60 // default duration for multiplayer
    },
  ];

  const handleModeSelect = (modeId: string) => {
    if (modeId === 'song') {
      setShowComingSoon(true);
    } else if (modeId === 'multiplayer') {
      setSelectedMode('multiplayer');
    } else {
      setSelectedMode(modeId);
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setShowSongSelector(false);
  };

  const handleBackFromSong = () => {
    setSelectedSong(null);
    setShowSongSelector(false);
  };

  const handleBackFromSelector = () => {
    setShowSongSelector(false);
  };

  if (selectedSong) {
    return (
      <SongTypingTest 
        key={selectedSong.id}
        song={selectedSong}
        onBack={handleBackFromSong}
      />
    );
  }

  if (showSongSelector) {
    return (
      <SongSelector 
        onSongSelect={handleSongSelect}
        onBack={handleBackFromSelector}
      />
    );
  }

  if (selectedMode === 'multiplayer') {
    return (
      <MultiplayerTypingTest
        duration={modes.find(m => m.id === 'multiplayer')?.duration || 60}
        onBack={() => setSelectedMode(null)}
        room={multiplayerRoom}
        setRoom={setMultiplayerRoom}
      />
    );
  }

  if (selectedMode) {
    return (
      <TypingTest 
        key={selectedMode}
        mode={selectedMode}
        duration={modes.find(m => m.id === selectedMode)?.duration || null}
        onBack={() => setSelectedMode(null)}
      />
    );
  }

  if (showComingSoon) {
    return <ComingSoon onBack={() => setShowComingSoon(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden flex flex-col">
      {/* Header Bar */}
      <header className="w-full bg-slate-950/80 shadow-lg py-4 px-8 flex items-center justify-between z-20 relative">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-slate-500 rounded-full flex items-center justify-center shadow-lg">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-wide">{APP_NAME}</span>
        </div>
        <div className="text-blue-200 text-sm font-medium tracking-wide">Beta</div>
      </header>
      {/* Animated background circles (neutral/blue) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border-2 border-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 border-2 border-slate-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 border-2 border-gray-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-500/20 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-slate-500/20 rounded-full blur-lg animate-bounce delay-700"></div>
      </div>
      <main className="relative z-10 container mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* Logo with circles */}
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-slate-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-blue-500/50">
                <Music className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-4 border-2 border-blue-500/30 rounded-full animate-spin"></div>
              <div className="absolute -inset-8 border border-slate-500/20 rounded-full animate-ping"></div>
            </div>
          </div>
          <h1 className="text-7xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-slate-400 to-gray-400 bg-clip-text text-transparent tracking-wider drop-shadow-lg">
            {APP_NAME}
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow">
            {APP_TAGLINE}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {modes.map((mode, index) => {
            const IconComponent = mode.icon;
            return (
              <Card 
                key={mode.id}
                className="relative overflow-hidden bg-slate-800/60 backdrop-blur border-2 border-blue-500/20 hover:border-blue-500/60 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 cursor-pointer group rounded-2xl shadow-lg"
                onClick={() => handleModeSelect(mode.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                {/* Circle accent */}
                <div className="absolute -top-4 -right-4 w-16 h-16 border-2 border-blue-500/30 rounded-full group-hover:border-blue-500/60 transition-colors"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${mode.color} rounded-full flex items-center justify-center group-hover:animate-pulse shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
                      <Play className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-blue-200/80 text-sm leading-relaxed group-hover:text-blue-200 transition-colors">
                    {mode.description}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </Card>
            );
          })}
        </div>
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-3 text-blue-300 bg-slate-800/40 backdrop-blur-sm rounded-full px-8 py-4 border border-blue-500/20 shadow">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-medium">Click the circles to start your rhythm typing adventure!</span>
            <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="w-full bg-slate-950/80 py-4 px-8 text-center text-blue-200 text-sm font-medium tracking-wide z-20 relative mt-8 border-t border-blue-500/10">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
