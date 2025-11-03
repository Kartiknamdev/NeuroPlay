import GameCard from "../components/GameCard";

export default function Home() {
  const games = [
    { title: "Bubble Math", description: "Solve and sort equations fast!", link: "/bubble-math" },
    { title: "Invisible Wall", description: "Find the path with hidden walls!", link: "/invisible-wall" },
    { title: "Memory Matrix", description: "Memorize and recall positions!", link: "/memory-matrix" },
    { title: "Quick-Fire Math", description: "Answer math problems quickly!", link: "/quick-math" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="text-center pt-12">
        <h1 className="text-4xl font-bold mb-2">Accenture Gamified Practice Portal</h1>
        <p className="text-gray-300">Sharpen your mind with these 4 cognitive challenges</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-8 py-16">
        {games.map((g) => <GameCard key={g.title} {...g} />)}
      </div>
    </div>
  );
}
