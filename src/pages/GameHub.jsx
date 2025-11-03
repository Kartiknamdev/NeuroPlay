import React from 'react';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';

const GAMES = [
  { id: 'bubble-math', title: 'Bubble Math', description: 'Pop the bubbles with the correct answers.' },
  { id: 'quickfire-math', title: 'Quick Fire Math', description: 'Answer fast questions before time runs out.' },
  { id: 'memory-matrix', title: 'Memory Matrix', description: 'Remember and repeat the sequence.' },
  { id: 'invisible-wall', title: 'Invisible Wall', description: 'Navigate through unseen obstacles.' },
];

export default function GameHub() {
  const handlePlay = (id) => {
    // For now we just log. Hook routing or modal to launch an actual game later.
    console.log('Play game:', id);
    alert(`Play ${id} — game launching not implemented yet.`);
  };

  return (
    <div>
      <Navbar />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Game Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map(g => (
            <GameCard key={g.id} title={g.title} description={g.description} onPlay={() => handlePlay(g.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}
