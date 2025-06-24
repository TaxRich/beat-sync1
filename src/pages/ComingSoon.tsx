import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';
import React from 'react';

interface ComingSoonProps {
  onBack?: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border-2 border-pink-500 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 border-2 border-purple-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 border-2 border-cyan-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-lg animate-bounce delay-700"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-slate-800/60 rounded-2xl shadow-2xl border-2 border-pink-500/20">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse shadow-xl mb-4">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wider drop-shadow-lg">
            Coming Soon
          </h1>
          <p className="text-lg text-pink-200 max-w-xl text-center font-medium mb-4">
            Song Mode is under development and will be available soon. Stay tuned for exciting rhythm-based typing challenges!
          </p>
        </div>
        {onBack && (
          <Button onClick={onBack} className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2 rounded-full mt-2">
            Back to Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default ComingSoon; 