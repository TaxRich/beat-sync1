import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Music, Timer, Target, Zap, RotateCcw, Volume2, VolumeX, AlertCircle } from 'lucide-react';

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

interface SongTypingTestProps {
  song: Song;
  onBack: () => void;
}

const SongTypingTest = ({ song, onBack }: SongTypingTestProps) => {
  const [text, setText] = useState('');
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    combo: 0,
    maxCombo: 0,
    correctChars: 0,
    totalChars: 0,
    syncScore: 100
  });
  const [isFinished, setIsFinished] = useState(false);
  const [beatIntensity, setBeatIntensity] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLyric = song.lyrics[currentLyricIndex] || '';
  const words = currentLyric.split(' ');
  const currentWord = words[currentWordIndex] || '';

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Beat detection with BPM
    const beatInterval = (60 / song.bpm) * 1000;
    beatIntervalRef.current = setInterval(() => {
      setBeatIntensity(1);
      setTimeout(() => setBeatIntensity(0), 150);
    }, beatInterval);

    console.log(`Song initialized: ${song.title} - BPM: ${song.bpm}`);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [song.bpm, song.title]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Auto-advance lyrics based on time
      const lyricDuration = song.duration / song.lyrics.length;
      const expectedLyricIndex = Math.floor(audio.currentTime / lyricDuration);
      if (expectedLyricIndex !== currentLyricIndex && expectedLyricIndex < song.lyrics.length) {
        setCurrentLyricIndex(expectedLyricIndex);
        setCurrentWordIndex(0);
        setText('');
      }
      if (audio.currentTime >= song.duration) {
        setIsPlaying(false);
        setIsFinished(true);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => audio.removeEventListener('timeupdate', onTimeUpdate);
  }, [song, currentLyricIndex]);

  const startSong = () => {
    console.log('Starting song simulation');
    setIsPlaying(true);
    setStartTime(Date.now());
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) audioRef.current.muted = !isMuted;
    console.log(`Audio ${isMuted ? 'unmuted' : 'muted'}`);
  };

  const calculateWPM = () => {
    if (!startTime) return 0;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = stats.correctChars / 5;
    return Math.round(wordsTyped / timeElapsed) || 0;
  };

  const calculateSyncScore = () => {
    const beatWindow = (60 / song.bpm) * 1000;
    const timeSinceLastBeat = (Date.now() % beatWindow) / beatWindow;
    const syncAccuracy = 1 - Math.abs(0.5 - timeSinceLastBeat) * 2;
    return Math.round(syncAccuracy * 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (!isPlaying && !startTime) {
      startSong();
    }

    // Check if current word is completed
    if (value.endsWith(' ') && value.trim() === currentWord) {
      const syncScore = calculateSyncScore();
      const newWordIndex = currentWordIndex + 1;
      
      console.log(`Word completed: "${currentWord}" - Sync score: ${syncScore}%`);
      
      if (newWordIndex >= words.length) {
        // Move to next lyric
        if (currentLyricIndex < song.lyrics.length - 1) {
          setCurrentLyricIndex(currentLyricIndex + 1);
          setCurrentWordIndex(0);
        }
      } else {
        setCurrentWordIndex(newWordIndex);
      }
      
      setText('');
      
      setStats(prev => ({
        ...prev,
        correctChars: prev.correctChars + currentWord.length + 1,
        totalChars: prev.totalChars + currentWord.length + 1,
        combo: prev.combo + 1,
        maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
        syncScore: Math.round((prev.syncScore + syncScore) / 2),
        wpm: calculateWPM()
      }));
    } else {
      // Update accuracy for partial typing
      const correctChars = value.split('').filter((char, index) => char === currentWord[index]).length;
      const accuracy = value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100;
      
      setStats(prev => ({
        ...prev,
        accuracy,
        totalChars: prev.totalChars + 1,
        correctChars: prev.correctChars + (value[value.length - 1] === currentWord[value.length - 1] ? 1 : 0),
        combo: accuracy === 100 ? prev.combo : 0
      }));
    }
  };

  const resetTest = () => {
    console.log('Resetting test');
    setText('');
    setCurrentLyricIndex(0);
    setCurrentWordIndex(0);
    setStartTime(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsFinished(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      combo: 0,
      maxCombo: 0,
      correctChars: 0,
      totalChars: 0,
      syncScore: 100
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* osu! style dynamic background with beat sync */}
      <div className="absolute inset-0 opacity-15">
        <div 
          className={`absolute top-1/4 left-1/4 w-80 h-80 border-4 border-pink-500/40 rounded-full transition-all duration-150 ${
            beatIntensity > 0 ? 'animate-ping scale-110 border-pink-400' : ''
          }`}
        ></div>
        <div 
          className={`absolute top-3/4 right-1/4 w-64 h-64 border-2 border-purple-500/30 rounded-full transition-all duration-150 ${
            beatIntensity > 0 ? 'animate-pulse scale-105 border-purple-400' : ''
          }`}
        ></div>
        <div 
          className={`absolute bottom-1/4 left-1/3 w-96 h-96 border-3 border-cyan-400/30 rounded-full transition-all duration-150 ${
            beatIntensity > 0 ? 'animate-spin scale-105 border-cyan-300' : ''
          }`}
        ></div>
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
            Back to Songs
          </Button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-pink-500/30">
              <Music className="w-4 h-4 text-pink-400" />
              <span className="text-white font-bold">{song.title}</span>
              <span className="text-pink-300">-</span>
              <span className="text-pink-300 font-medium">{song.artist}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-pink-500/20 hover:text-pink-300 border border-pink-500/20"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Audio Status Notice */}
        <div className="mb-6">
          <Card className="bg-orange-500/10 backdrop-blur-sm border-2 border-orange-500/30 p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-orange-300 text-sm font-bold">osu! Simulation Mode</p>
                <p className="text-orange-200 text-xs">
                  This is a demo version. Beat sync simulated at {song.bpm} BPM - Click the circles, follow the beat!
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* osu! style Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-slate-800/40 backdrop-blur-sm border-2 border-pink-500/20 p-4 hover:border-pink-500/40 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-pink-300 text-sm font-medium">WPM</p>
                <p className="text-white text-2xl font-bold">{calculateWPM()}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-sm border-2 border-green-500/20 p-4 hover:border-green-500/40 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-green-300 text-sm font-medium">Accuracy</p>
                <p className="text-white text-2xl font-bold">{stats.accuracy}%</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-sm border-2 border-purple-500/20 p-4 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-purple-300 text-sm font-medium">Combo</p>
                <p className="text-white text-2xl font-bold">{stats.combo}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-sm border-2 border-blue-500/20 p-4 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-blue-300 text-sm font-medium">Beat Sync</p>
                <p className="text-white text-2xl font-bold">{stats.syncScore}%</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-sm border-2 border-cyan-500/20 p-4 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-cyan-300 text-sm font-medium">Time</p>
                <p className="text-white text-2xl font-bold">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* osu! style Lyrics Display */}
        <Card className="bg-slate-800/20 backdrop-blur-sm border-2 border-pink-500/20 p-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Current Lyric
            </h3>
            <div className="relative p-6 bg-slate-800/30 rounded-2xl border border-pink-500/30">
              <p className="text-xl text-pink-100 font-mono leading-relaxed">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`mr-3 px-3 py-2 rounded-full transition-all duration-300 font-bold ${
                      index < currentWordIndex
                        ? 'text-green-400 bg-green-400/20 border border-green-400/40'
                        : index === currentWordIndex
                        ? `text-white bg-pink-500/60 border-2 border-pink-400 ${beatIntensity > 0 ? 'animate-pulse scale-110 shadow-lg shadow-pink-500/50' : ''}`
                        : 'text-gray-400 border border-gray-600/20'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-pink-300 text-lg font-medium mb-4">Click the circle! Type this word:</p>
            <div className={`inline-block relative ${beatIntensity > 0 ? 'animate-bounce' : ''}`}>
              <div className="text-5xl font-bold text-pink-400 bg-slate-800/50 px-8 py-4 rounded-full border-4 border-pink-500/50 shadow-2xl shadow-pink-500/30">
                {currentWord}
              </div>
              <div className="absolute -inset-2 border-2 border-pink-400/30 rounded-full animate-ping"></div>
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInputChange}
            disabled={isFinished}
            className="w-full bg-slate-800/50 border-2 border-pink-500/30 rounded-2xl px-6 py-4 text-white text-xl font-mono focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 disabled:opacity-50 text-center placeholder-pink-300/50"
            placeholder={isFinished ? "Song completed! 300 combo!" : "Start typing to begin the beat..."}
          />
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <Button 
            onClick={resetTest}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-12 py-4 text-xl font-bold transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl shadow-pink-500/30 border-2 border-pink-400/30"
          >
            <RotateCcw className="w-6 h-6 mr-3" />
            {isFinished ? 'Retry Map' : 'Restart'}
          </Button>
        </div>

        {/* Results Modal */}
        {isFinished && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-slate-800/90 backdrop-blur-md border-2 border-pink-500/50 p-8 max-w-lg w-full mx-4 rounded-3xl shadow-2xl shadow-pink-500/30">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Map Complete!
                </h2>
                <p className="text-pink-400 text-xl font-medium mb-8">{song.title} - {song.artist}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-800/50 border-2 border-yellow-500/30 rounded-2xl p-4">
                    <p className="text-yellow-300 text-sm font-medium">Final WPM</p>
                    <p className="text-white text-3xl font-bold">{calculateWPM()}</p>
                  </div>
                  <div className="bg-slate-800/50 border-2 border-green-500/30 rounded-2xl p-4">
                    <p className="text-green-300 text-sm font-medium">Accuracy</p>
                    <p className="text-white text-3xl font-bold">{stats.accuracy}%</p>
                  </div>
                  <div className="bg-slate-800/50 border-2 border-purple-500/30 rounded-2xl p-4">
                    <p className="text-purple-300 text-sm font-medium">Max Combo</p>
                    <p className="text-white text-3xl font-bold">{stats.maxCombo}</p>
                  </div>
                  <div className="bg-slate-800/50 border-2 border-blue-500/30 rounded-2xl p-4">
                    <p className="text-blue-300 text-sm font-medium">Beat Sync</p>
                    <p className="text-white text-3xl font-bold">{stats.syncScore}%</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-sm text-pink-300 mb-3">
                    <span className="font-medium">Beat Sync Performance</span>
                    <span className="font-bold">{stats.syncScore}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 border border-pink-500/30">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-1000 shadow-lg shadow-pink-500/50"
                      style={{ width: `${stats.syncScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={resetTest}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full font-bold py-3"
                  >
                    Retry Map
                  </Button>
                  <Button 
                    onClick={onBack}
                    variant="outline"
                    className="flex-1 border-2 border-pink-500/50 text-pink-300 hover:bg-pink-500/20 rounded-full font-bold py-3"
                  >
                    Song Select
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <audio ref={audioRef} src={song.audioUrl} preload="auto" />
      </div>
    </div>
  );
};

export default SongTypingTest;
