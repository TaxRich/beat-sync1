import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Zap, Target, Timer, User, Users, RotateCcw } from 'lucide-react';
import io from 'socket.io-client';

interface MultiplayerTypingTestProps {
  duration: number;
  onBack: () => void;
  room: string | null;
  setRoom: (room: string | null) => void;
}

const SERVER_URL = 'http://192.168.1.4:4000'; // User's local IP

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog and runs through the forest with incredible speed and agility.",
  "Music has the power to transport us to different worlds and evoke emotions we never knew existed within our souls.",
  "Typing to the rhythm of a beat creates a unique harmony between mind, fingers, and sound that enhances focus.",
  "In the digital age, fast and accurate typing has become an essential skill for productivity and communication.",
  "Every keystroke creates a symphony of clicks that forms the foundation of modern digital expression and creativity."
];

const MultiplayerTypingTest = ({ duration, onBack, room, setRoom }: MultiplayerTypingTestProps) => {
  const [socket, setSocket] = useState<any>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [text, setText] = useState('');
  const [opponentText, setOpponentText] = useState('');
  const [targetText] = useState(() => sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stats
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    totalChars: 0
  });
  const [opponentStats, setOpponentStats] = useState({
    correctChars: 0,
    totalChars: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);
    s.on('connect', () => setPlayerId(s.id));
    s.on('joined', (data: any) => {
      setJoined(true);
      setWaiting(data.waiting);
      setOpponentId(data.opponentId || null);
    });
    s.on('start', () => {
      setGameStarted(true);
      setIsActive(true);
      setTimeLeft(duration);
      setIsFinished(false);
      setOpponentFinished(false);
      setText('');
      setOpponentText('');
      setStats({ wpm: 0, accuracy: 100, correctChars: 0, totalChars: 0 });
      setOpponentStats({ correctChars: 0, totalChars: 0 });
      setStartTime(null);
    });
    s.on('opponent-progress', (data: any) => {
      setOpponentText(data.text);
      setOpponentStats({
        correctChars: data.text.split('').filter((char: string, i: number) => char === targetText[i]).length,
        totalChars: data.text.length
      });
    });
    s.on('opponent-finished', () => {
      setOpponentFinished(true);
    });
    s.on('opponent-left', () => {
      setOpponentId(null);
      setWaiting(true);
    });
    return () => { s.disconnect(); };
  }, [duration, targetText]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsFinished(true);
            socket?.emit('finished', { room });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, timeLeft, socket, room]);

  const calculateWPM = () => {
    if (!startTime) return 0;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = stats.correctChars / 5;
    return Math.round(wordsTyped / timeElapsed) || 0;
  };

  const handleJoin = () => {
    if (room && socket) {
      socket.emit('join', { room });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    if (gameStarted && !isFinished) {
      if (!startTime) setStartTime(Date.now());
      const correctChars = value.split('').filter((char, i) => char === targetText[i]).length;
      const accuracy = value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100;
      setStats(prev => ({
        ...prev,
        correctChars,
        totalChars: value.length,
        accuracy,
        wpm: calculateWPM()
      }));
      socket?.emit('progress', { room, text: value });
      if (value === targetText) {
        setIsActive(false);
        setIsFinished(true);
        socket?.emit('finished', { room });
      }
    }
  };

  const handleBack = () => {
    setRoom(null);
    onBack();
  };

  const resetTest = () => {
    setText('');
    setStats({ wpm: 0, accuracy: 100, correctChars: 0, totalChars: 0 });
    setOpponentStats({ correctChars: 0, totalChars: 0 });
    setStartTime(null);
    setIsActive(gameStarted);
    setIsFinished(false);
    setOpponentFinished(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const getCharacterClass = (index: number, typed: string) => {
    if (index < typed.length) {
      return typed[index] === targetText[index] ? 'text-green-400 bg-green-400/20 border border-green-400/40' : 'text-red-400 bg-red-400/20 border border-red-400/40';
    } else if (index === typed.length) {
      return 'text-white bg-pink-500/60 border-2 border-pink-400 animate-pulse shadow-lg shadow-pink-500/50';
    }
    return 'text-gray-400 border border-gray-600/20';
  };

  // Themed UI
  if (!joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center text-white flex items-center justify-center gap-2">
            <Users className="w-7 h-7 text-blue-400 mr-2" />
            Multiplayer Room
          </h2>
          <p className="text-blue-200 text-center mb-4">
            Create a new room or join an existing one to challenge a friend in real-time typing!<br/>
            <span className="text-blue-300 text-sm">Tip: Share your room name with your friend so they can join you.</span>
          </p>
          <ul className="text-xs text-blue-300 mb-4 list-disc list-inside text-left">
            <li>Room names are case-sensitive.</li>
            <li>Each room supports 2 players for a 1v1 match.</li>
            <li>Once both players join, the game will start automatically.</li>
          </ul>
          <input
            type="text"
            placeholder="Room name..."
            value={room || ''}
            onChange={e => setRoom(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded border border-blue-400 bg-slate-800 text-white"
          />
          <Button onClick={handleJoin} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded">Join Room</Button>
          <Button onClick={handleBack} variant="outline" className="w-full mt-2 border-blue-400 text-blue-300">Back</Button>
        </Card>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <Card className="p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Waiting for an opponent...</h2>
          <p className="text-blue-200 mb-4">Share the room name with a friend to join!</p>
          <Button onClick={handleBack} variant="outline" className="w-full border-blue-400 text-blue-300">Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden">
      {/* osu! style animated background circles */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border-2 border-pink-500 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 border-2 border-purple-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 border-2 border-cyan-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-lg animate-bounce delay-700"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="text-white hover:bg-pink-500/20 hover:text-pink-300 transition-colors border border-pink-500/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modes
          </Button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-pink-500/30">
              <Users className="w-4 h-4 text-pink-400" />
              <span className="text-white font-bold">Multiplayer 1v1</span>
              <span className="text-pink-300">Room:</span>
              <span className="text-pink-300 font-medium">{room}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 border-2 border-cyan-500/30">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 font-medium">You</span>
              <span className="text-cyan-300">vs</span>
              <User className="w-4 h-4 text-pink-400" />
              <span className="text-pink-300 font-medium">Opponent</span>
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

          <Card className="bg-slate-800/40 backdrop-blur-sm border-2 border-blue-500/20 p-4 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-blue-300 text-sm font-medium">Time</p>
                <p className="text-white text-2xl font-bold">{timeLeft}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-sm border-2 border-cyan-500/20 p-4 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-cyan-300 text-sm font-medium">Opponent</p>
                <p className="text-white text-2xl font-bold">{opponentFinished ? 'Finished' : 'Playing'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* osu! style Typing Area - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* You */}
          <Card className="bg-slate-800/20 backdrop-blur-sm border-2 border-pink-500/20 p-8">
            <h3 className="text-xl font-bold text-pink-400 mb-2 text-center">You</h3>
            <div className="text-xl leading-relaxed mb-8 font-mono min-h-32 p-6 bg-slate-800/30 rounded-2xl border border-pink-500/30">
              {targetText.split('').map((char, index) => (
                <span key={index} className={`${getCharacterClass(index, text)} px-1 py-0.5 rounded-md transition-all duration-150 mr-0.5`}>
                  {char}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={handleInputChange}
              disabled={!gameStarted || isFinished}
              className="w-full bg-slate-800/50 border-2 border-pink-500/30 rounded-2xl px-6 py-4 text-white text-xl font-mono focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 disabled:opacity-50 placeholder-pink-300/50"
              placeholder={gameStarted ? 'Type here...' : 'Waiting for game to start...'}
            />
            <div className="text-pink-200 mt-2">{stats.correctChars}/{targetText.length} correct</div>
          </Card>

          {/* Opponent */}
          <Card className="bg-slate-800/20 backdrop-blur-sm border-2 border-cyan-500/20 p-8">
            <h3 className="text-xl font-bold text-cyan-400 mb-2 text-center">Opponent</h3>
            <div className="text-xl leading-relaxed mb-8 font-mono min-h-32 p-6 bg-slate-800/30 rounded-2xl border border-cyan-500/30">
              {targetText.split('').map((char, index) => (
                <span key={index} className={`${getCharacterClass(index, opponentText)} px-1 py-0.5 rounded-md transition-all duration-150 mr-0.5`}>
                  {char}
                </span>
              ))}
            </div>
            <input
              type="text"
              value={opponentText}
              disabled
              className="w-full bg-slate-800/50 border-2 border-cyan-500/30 rounded-2xl px-6 py-4 text-white text-xl font-mono opacity-50"
              placeholder={opponentFinished ? 'Finished!' : 'In progress...'}
            />
            <div className="text-cyan-200 mt-2">{opponentStats.correctChars}/{targetText.length} correct</div>
          </Card>
        </div>

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
                  Game Over!
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
                    <p className="text-purple-300 text-sm font-medium">Your Score</p>
                    <p className="text-white text-3xl font-bold">{stats.correctChars}/{targetText.length}</p>
                  </div>
                  <div className="bg-slate-800/50 border-2 border-cyan-500/30 rounded-2xl p-4">
                    <p className="text-cyan-300 text-sm font-medium">Opponent Score</p>
                    <p className="text-white text-3xl font-bold">{opponentStats.correctChars}/{targetText.length}</p>
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
                    onClick={handleBack}
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

export default MultiplayerTypingTest; 