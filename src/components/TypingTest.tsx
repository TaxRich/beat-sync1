import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Music, Timer, Target, Zap, RotateCcw } from 'lucide-react';

interface TypingTestProps {
  mode: string;
  duration: number | null;
  onBack: () => void;
}

const TypingTest = ({ mode, duration, onBack }: TypingTestProps) => {
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    combo: 0,
    maxCombo: 0,
    correctChars: 0,
    totalChars: 0
  });
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog and runs through the forest with incredible speed and agility.",
    "Music has the power to transport us to different worlds and evoke emotions we never knew existed within our souls.",
    "Typing to the rhythm of a beat creates a unique harmony between mind, fingers, and sound that enhances focus.",
    "In the digital age, fast and accurate typing has become an essential skill for productivity and communication.",
    "Every keystroke creates a symphony of clicks that forms the foundation of modern digital expression and creativity."
  ];

  const getRandomText = () => {
    return mode === 'song'
      ? "Type to the beat of the music and let your fingers dance across the keyboard like a pianist performing a beautiful melody. Feel the rhythm guide your typing speed and accuracy."
      : sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  };

  const [targetText, setTargetText] = useState(getRandomText());

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isActive && duration && timeLeft !== null) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, duration, timeLeft]);

  const calculateWPM = () => {
    if (!startTime) return 0;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = stats.correctChars / 5;
    return Math.round(wordsTyped / timeElapsed) || 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (!isActive && !startTime) {
      setStartTime(Date.now());
      setIsActive(true);
    }

    const newIndex = value.length;
    setCurrentIndex(newIndex);

    if (newIndex <= targetText.length) {
      const isCorrect = value === targetText.slice(0, newIndex);
      const correctChars = value.split('').filter((char, index) => char === targetText[index]).length;
      setStats(prev => {
        const newCombo = isCorrect && newIndex > prev.totalChars ? prev.combo + 1 : 0;
        return {
          ...prev,
          correctChars: prev.correctChars + (isCorrect ? value.length - prev.totalChars : 0),
          totalChars: prev.totalChars + (value.length - prev.totalChars),
          accuracy: newIndex > 0 ? Math.round((prev.correctChars + correctChars) / (prev.totalChars + newIndex) * 100) : 100,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          wpm: calculateWPM()
        };
      });
      if (newIndex === targetText.length && isCorrect) {
        setTargetText(getRandomText());
        setText('');
        setCurrentIndex(0);
        if (inputRef.current) inputRef.current.focus();
      }
    }
  };

  const resetTest = () => {
    setText('');
    setCurrentIndex(0);
    setStartTime(null);
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      combo: 0,
      maxCombo: 0,
      correctChars: 0,
      totalChars: 0
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getCharacterClass = (index: number) => {
    if (index < currentIndex) {
      return text[index] === targetText[index] ? 'text-green-400 bg-green-400/20 border border-green-400/40' : 'text-red-400 bg-red-400/20 border border-red-400/40';
    } else if (index === currentIndex) {
      return 'text-white bg-pink-500/60 border-2 border-pink-400 animate-pulse shadow-lg shadow-pink-500/50';
    }
    return 'text-gray-400 border border-gray-600/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* osu! style dynamic background */}
      <div className="absolute inset-0 opacity-15">
        {mode === 'song' && (
          <>
            <div className="absolute top-1/4 left-1/4 w-80 h-80 border-2 border-pink-500/40 rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-64 h-64 border-2 border-purple-500/30 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 border-2 border-cyan-500/30 rounded-full animate-pulse delay-500"></div>
          </>
        )}
        {mode !== 'song' && (
          <>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-blue-400/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border-2 border-purple-500/20 rounded-full animate-spin"></div>
          </>
        )}
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

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-pink-500/30">
              {mode === 'song' && <Music className="w-4 h-4 text-pink-400" />}
              {duration && <Timer className="w-4 h-4 text-blue-400" />}
              <span className="text-white font-bold">
                {mode === 'song' ? 'osu! Mode' : mode === 'unlimited' ? 'Unlimited' : `${duration}s Challenge`}
              </span>
            </div>
          </div>
        </div>

        {/* osu! style Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
                <Timer className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-blue-300 text-sm font-medium">Time</p>
                <p className="text-white text-2xl font-bold">
                  {duration ? (timeLeft !== null ? timeLeft : duration) : '∞'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* osu! style Typing Area */}
        <Card className="bg-slate-800/20 backdrop-blur-sm border-2 border-pink-500/20 p-8 mb-8">
          <div className="text-xl leading-relaxed mb-8 font-mono min-h-32 p-6 bg-slate-800/30 rounded-2xl border border-pink-500/30">
            {targetText.split('').map((char, index) => (
              <span key={index} className={`${getCharacterClass(index)} px-1 py-0.5 rounded-md transition-all duration-150 mr-0.5`}>
                {char}
              </span>
            ))}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInputChange}
            disabled={isFinished}
            onPaste={e => e.preventDefault()}
            onDrop={e => e.preventDefault()}
            onContextMenu={e => e.preventDefault()}
            className="w-full bg-slate-800/50 border-2 border-pink-500/30 rounded-2xl px-6 py-4 text-white text-xl font-mono focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 disabled:opacity-50 placeholder-pink-300/50"
            placeholder={isFinished ? "Test completed! Click the circles!" : "Start typing here..."}
          />
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <Button 
            onClick={resetTest}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-12 py-4 text-xl font-bold transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl shadow-pink-500/30 border-2 border-pink-400/30"
          >
            <RotateCcw className="w-6 h-6 mr-3" />
            {isFinished ? 'Retry' : 'Restart'}
          </Button>
        </div>

        {/* Results Modal */}
        {isFinished && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-slate-800/90 backdrop-blur-md border-2 border-pink-500/50 p-8 max-w-lg w-full mx-4 rounded-3xl shadow-2xl shadow-pink-500/30">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-8 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Test Complete!
                </h2>
                
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
                    <p className="text-blue-300 text-sm font-medium">Characters</p>
                    <p className="text-white text-3xl font-bold">{stats.correctChars}/{stats.totalChars}</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={resetTest}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full font-bold py-3"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={onBack}
                    variant="outline"
                    className="flex-1 border-2 border-pink-500/50 text-pink-300 hover:bg-pink-500/20 rounded-full font-bold py-3"
                  >
                    Change Mode
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTest;
