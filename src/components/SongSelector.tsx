import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Music, ArrowLeft } from 'lucide-react';

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

interface SongSelectorProps {
  onSongSelect: (song: Song, difficulty: string) => void;
  onBack: () => void;
}

const SongSelector = ({ onSongSelect, onBack }: SongSelectorProps) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [difficulty, setDifficulty] = useState('normal');

  const sampleSongs: Song[] = [
    {
      id: '1',
      title: 'Digital Dreams',
      artist: 'Cyber Rhythms',
      duration: 180,
      bpm: 120,
      audioUrl: '/audio/digital-dreams.mp3',
      coverUrl: '/covers/digital-dreams.jpg',
      lyrics: [
        'In the digital realm where dreams collide',
        'Pixels dance and code comes alive',
        'Every keystroke tells a story',
        'In this virtual territory',
        'Type the rhythm feel the beat',
        'Make your fingers move so sweet',
        'Digital dreams are calling you',
        'Let the music guide you through'
      ]
    },
    {
      id: '2',
      title: 'Keyboard Symphony',
      artist: 'Tech Beats',
      duration: 165,
      bpm: 140,
      audioUrl: '/audio/keyboard-symphony.mp3',
      coverUrl: '/covers/keyboard-symphony.jpg',
      lyrics: [
        'Click clack goes the keyboard sound',
        'Every letter makes a beat profound',
        'Symphony of typing flows',
        'As the rhythm grows and grows',
        'Fingers dancing on the keys',
        'Like a gentle summer breeze',
        'Type in time and feel the flow',
        'Let your typing skills just grow'
      ]
    },
    {
      id: '3',
      title: 'Code Runner',
      artist: 'Binary Beats',
      duration: 200,
      bpm: 160,
      audioUrl: '/audio/code-runner.mp3',
      coverUrl: '/covers/code-runner.jpg',
      lyrics: [
        'Running code at lightning speed',
        'Every function serves a need',
        'Variables and loops combine',
        'In this algorithmic shrine',
        'Debug errors fix the flow',
        'Watch your programs start to grow',
        'Code runner never stops',
        'Until perfection finally drops'
      ]
    },
    {
      id: 'custom1',
      title: 'Clarity',
      artist: 'Zedd',
      duration: 250,
      bpm: 120,
      audioUrl: '/audio/Clarity-By-Zedd-ft.-Foxes-Lyrics-Official_2026614.mp3',
      coverUrl: '/covers/ab67616d0000b273941dd3b3343d9cb9329d37bf.jpeg',
      lyrics: [
        'High Dive into frozen waves',
        'where the past comes back to life',
      ]
    }
  ];

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  const handleStartSong = () => {
    if (selectedSong) {
      onSongSelect(selectedSong, difficulty);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* osu! style animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 border-2 border-pink-500 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 border-2 border-purple-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 border-2 border-cyan-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-pink-500/20 hover:text-pink-300 transition-colors border border-pink-500/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modes
          </Button>

          <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-pink-500/30">
            <Music className="w-5 h-5 text-pink-400" />
            <span className="text-white font-bold text-lg">Song Select</span>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Song Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {sampleSongs.map((song) => (
            <Card 
              key={song.id}
              className={`relative overflow-hidden bg-slate-800/40 backdrop-blur-sm border-2 hover:bg-slate-800/60 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer group ${
                selectedSong?.id === song.id ? 'ring-4 ring-pink-500/60 bg-slate-800/60 border-pink-500/60' : 'border-pink-500/20 hover:border-pink-500/40'
              }`}
              onClick={() => handleSongSelect(song)}
            >
              <div className="relative p-6">
                {/* osu! style circle accent */}
                <div className="absolute -top-2 -right-2 w-12 h-12 border-2 border-pink-500/40 rounded-full group-hover:border-pink-500/80 transition-colors"></div>
                
                {/* Album Cover Placeholder - osu! style */}
                <div className="w-full h-40 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-pink-500/20 relative overflow-hidden">
                  <Music className="w-16 h-16 text-white opacity-80" />
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">{song.title}</h3>
                <p className="text-pink-300 text-lg font-medium mb-4">{song.artist}</p>
                
                <div className="flex justify-between items-center text-sm text-pink-200/80">
                  <span className="bg-slate-700/50 px-3 py-1 rounded-full">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="bg-purple-600/50 px-3 py-1 rounded-full font-bold">
                    {song.bpm} BPM
                  </span>
                </div>

                {selectedSong?.id === song.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-pink-500/50">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}

                {/* osu! style bottom accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 transition-opacity ${
                  selectedSong?.id === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                }`}></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="mb-6 text-center">
          <span className="text-pink-200 font-bold mr-4">Difficulty:</span>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="bg-slate-800 text-white rounded px-4 py-2 border border-pink-400">
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Start Button */}
        {selectedSong && (
          <div className="text-center">
            <div className="mb-4">
              <p className="text-pink-300 text-lg font-medium">Selected:</p>
              <p className="text-white text-2xl font-bold">{selectedSong.title}</p>
            </div>
            <Button 
              onClick={handleStartSong}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-16 py-4 text-xl font-bold transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl shadow-pink-500/30 border-2 border-pink-400/30"
            >
              <Play className="w-6 h-6 mr-3" />
              Start {selectedSong.title}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongSelector;
