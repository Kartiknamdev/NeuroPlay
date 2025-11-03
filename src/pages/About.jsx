import React from 'react';
import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div>
      <Navbar />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">About NeuroPlay</h1>
        <p className="text-sm text-gray-700 mb-4">
          NeuroPlay is a small collection of web-based cognitive practice games built to help
          users sharpen mental math, memory, and spatial reasoning through short interactive sessions.
        </p>

        <h2 className="text-lg font-semibold mt-4">Contact</h2>
        <p className="text-sm text-gray-700">For feedback, partnership inquiries, or support, email: <a href="mailto:hello@neuroplay.example" className="text-blue-600">neuroplay@gmail.com</a></p>

        <h2 className="text-lg font-semibold mt-4">Monetization</h2>
        <p className="text-sm text-gray-700">This site may display ads or affiliate links to support development. You can opt out via browser ad-blockers.</p>
      </main>
    </div>
  );
}
