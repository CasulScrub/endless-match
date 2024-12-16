import React, { useState, useEffect, useCallback } from "react";
import { Card } from "./assets/components/ui/card.jsx";
import { Badge } from "./assets/components/ui/badge.jsx";
import { Button } from "./assets/components/ui/buttons.jsx";  
import { Trophy, Star, Timer, TrendingUp, Sparkles } from 'lucide-react';
import { useSound, SoundEffects } from './assets/utils/soundManager.jsx';

function VolumeControl() {
  const { isMuted, toggleMute } = useSound();
  
  return (
    <button 
      onClick={toggleMute}
      className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-lg"
    >
      {isMuted ? "🔇" : "🔊"}
    </button>
  );
}


const EndlessMatch = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState('waiting');
  const [currentTiles, setCurrentTiles] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [lastMatchTime, setLastMatchTime] = useState(null);
  const [matchAnimation, setMatchAnimation] = useState(null);
  const { playSound } = useSound();
  
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const shapes = ['rounded-full', 'rounded-none', 'rounded-lg', 'rounded-3xl'];
  
  const generateTiles = useCallback(() => {
    const tiles = [];
    for (let i = 0; i < 4; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      tiles.push({ id: i * 2, color, shape, matched: false });
      tiles.push({ id: i * 2 + 1, color, shape, matched: false });
    }
    return tiles.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = () => {
    playSound(SoundEffects.GAME_START);
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setTimeLeft(30);
    setCurrentTiles(generateTiles());
    setMatchAnimation(null);
  };

  const showMatchAnimation = (index) => {
    setMatchAnimation(index);
    setTimeout(() => setMatchAnimation(null), 500);
  };

  const handleTileClick = (clickedTile, index) => {
    if (gameState !== 'playing') return;
    playSound(SoundEffects.TILE_CLICK);  // Play click soundplaySound(SoundEffects.TILE_CLICK);  // Play click sound
    const newTiles = [...currentTiles];
    const unmatched = newTiles.filter(tile => !tile.matched);
    const selected = unmatched.filter(tile => tile.selected);
    
    if (selected.length === 0) {
      clickedTile.selected = true;
    } else if (selected.length === 1 && selected[0].id !== clickedTile.id) {
      clickedTile.selected = true;
      
      if (selected[0].color === clickedTile.color && selected[0].shape === clickedTile.shape) {
        playSound(SoundEffects.MATCH_SUCCESS);
        selected[0].matched = true;
        clickedTile.matched = true;
        
        // Show match animation
        showMatchAnimation(index);
        
        const now = Date.now();
        if (lastMatchTime) {
          const timeDiff = now - lastMatchTime;
          if (timeDiff < 1000) {
            setMultiplier(prev => Math.min(prev + 0.5, 4));
          }
        }
        setLastMatchTime(now);
        
        const points = Math.floor(100 * multiplier);
        setScore(prev => prev + points);
        setStreak(prev => prev + 1);
        
        if (streak > 0 && streak % 5 === 0) {
          setTimeLeft(prev => prev + 5);
        }
        
        if (newTiles.every(tile => tile.matched)) {
          setCurrentTiles(generateTiles());
          return;
        }
      } else {
        playSound(SoundEffects.MATCH_FAIL);
        setStreak(0);
        setMultiplier(1);
      }
      
      setTimeout(() => {
        newTiles.forEach(tile => tile.selected = false);
        setCurrentTiles([...newTiles]);
      }, 500);
    }
    
    setCurrentTiles(newTiles);
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            playSound(SoundEffects.GAME_OVER);
            setGameState('ended');
            setHighScore(current => Math.max(current, score));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, score]);

  return (
    <Card className="p-6 max-w-2xl mx-auto relative overflow-hidden">
      {gameState === 'waiting' && (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Endless Match</h1>
          <Button onClick={startGame} className="px-8 py-4">Start Game</Button>
        </div>
      )}
      
      {gameState !== 'waiting' && (
        <>
          <div className="flex justify-between mb-4">
            <div className="flex gap-4">
            <VolumeControl />  {/* Added here, will be leftmost */}
              <Badge variant="secondary" className={`text-lg transition-transform duration-300 ${score > highScore ? 'animate-bounce' : ''}`}>
                <Trophy className="w-4 h-4 mr-1" />
                {score}
              </Badge>
              <Badge variant="secondary" className="text-lg">
                <Star className="w-4 h-4 mr-1" />
                {streak}x
              </Badge>
              <Badge variant="secondary" className="text-lg">
                <TrendingUp className="w-4 h-4 mr-1" />
                {multiplier.toFixed(1)}x
              </Badge>
            </div>
            <Badge variant="secondary" className={`text-lg ${timeLeft <= 5 ? 'animate-pulse text-red-500' : ''}`}>
              <Timer className="w-4 h-4 mr-1" />
              {timeLeft}s
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {currentTiles.map((tile, index) => (
              <div key={tile.id} className="relative">
                <button
                  onClick={() => handleTileClick(tile, index)}
                  className={`
                    relative w-full aspect-square transition-all duration-300
                    ${tile.color}
                    ${tile.shape}
                    ${tile.matched ? 'opacity-50 scale-95' : 'hover:scale-110 hover:brightness-110'}
                    ${tile.selected ? 'ring-4 ring-white scale-105' : ''}
                    ${matchAnimation === index ? 'animate-ping' : ''}
                    transform active:scale-90
                  `}
                  disabled={tile.matched || gameState === 'ended'}
                />
                {matchAnimation === index && (
                  <Sparkles 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-300 animate-spin"
                    size={32}
                  />
                )}
              </div>
            ))}
          </div>
          
          {gameState === 'ended' && (
            <div className="text-center mt-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="mb-4">High Score: {highScore}</p>
              <Button onClick={startGame} className="animate-bounce">Play Again</Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default EndlessMatch;