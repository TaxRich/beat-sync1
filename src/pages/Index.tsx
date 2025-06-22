import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Play, Clock, Infinity, Zap } from 'lucide-react';
import TypingTest from '@/components/TypingTest';
import SongSelector from '@/components/SongSelector';
import SongTypingTest from '@/components/SongTypingTest';
import MultiplayerTypingTest from '@/components/MultiplayerTypingTest';
import { useNavigate } from 'react-router-dom';

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

const Index = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongSelector, setShowSongSelector] = useState(false);
  const [multiplayerRoom, setMultiplayerRoom] = useState<string | null>(null);
  const navigate = useNavigate();

  const modes = [
    {
      id: 'unlimited',
      title: 'Unlimited',
      description: 'Type at your own pace, no time limits',
      icon: Infinity,
      color: 'from-pink-500 to-purple-500',
      duration: null
    },
    {
      id: '15s',
      title: '15 Seconds',
      description: 'Quick burst challenge',
      icon: Zap,
      color: 'from-orange-400 to-pink-500',
      duration: 15
    },
    {
      id: '30s',
      title: '30 Seconds',
      description: 'Standard speed test',
      icon: Clock,
      color: 'from-blue-400 to-pink-500',
      duration: 30
    },
    {
      id: '60s',
      title: '60 Seconds',
      description: 'Endurance challenge',
      icon: Clock,
      color: 'from-green-400 to-pink-500',
      duration: 60
    },
    {
      id: 'song',
      title: 'Song Mode',
      description: 'Type to the rhythm of music',
      icon: Music,
      color: 'from-purple-500 to-pink-500',
      duration: null
    },
    {
      id: 'multiplayer',
      title: 'Multiplayer 1v1',
      description: 'Compete head-to-head online! Invite a friend or join a room.',
      icon: Play,
      color: 'from-cyan-500 to-pink-500',
      duration: 60 // default duration for multiplayer
    },
  ];

  const handleModeSelect = (modeId: string) => {
    if (modeId === 'song') {
      setShowSongSelector(true);
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
        mode={selectedMode}
        duration={modes.find(m => m.id === selectedMode)?.duration || null}
        onBack={() => setSelectedMode(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* osu! style animated background circles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border-2 border-pink-500 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 border-2 border-purple-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 border-2 border-cyan-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-lg animate-bounce delay-700"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* osu! style logo with circles */}
              <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-pink-500/50">
                <Music className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-4 border-2 border-pink-500/30 rounded-full animate-spin"></div>
              <div className="absolute -inset-8 border border-purple-500/20 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <h1 className="text-7xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wider">
            osu!type
          </h1>
          <p className="text-xl text-pink-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Click the circles, follow the beat! Master your typing skills with the rhythm of osu!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {modes.map((mode, index) => {
            const IconComponent = mode.icon;
            return (
              <Card 
                key={mode.id}
                className="relative overflow-hidden bg-slate-800/40 backdrop-blur-sm border-2 border-pink-500/20 hover:border-pink-500/60 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25 cursor-pointer group"
                onClick={() => handleModeSelect(mode.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* osu! style circle accent */}
                <div className="absolute -top-4 -right-4 w-16 h-16 border-2 border-pink-500/30 rounded-full group-hover:border-pink-500/60 transition-colors"></div>
                
                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${mode.color} rounded-full flex items-center justify-center group-hover:animate-pulse shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center group-hover:bg-pink-500/40 transition-colors">
                      <Play className="w-4 h-4 text-pink-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-pink-200/80 text-sm leading-relaxed group-hover:text-pink-200 transition-colors">
                    {mode.description}
                  </p>
                  
                  {/* osu! style bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-3 text-pink-300 bg-slate-800/40 backdrop-blur-sm rounded-full px-8 py-4 border border-pink-500/20">
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-medium">Click the circles to start your rhythm typing adventure!</span>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
