import React from 'react';
import Navbar from '../components/Navbar';

export default function Privacy() {
  return (
    <div>
      <Navbar />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-700 mb-4">
          This is a basic privacy policy template for NeuroPlay. This site may collect minimal analytics and
          use cookies or third-party services for performance and ads. Replace this text with your full privacy policy
          that explains data collection, cookies, third-party providers (Google AdSense, Analytics), and how users can
          contact you about privacy concerns.
        </p>

        <h2 className="text-lg font-semibold mt-4">Data Collected</h2>
        <ul className="list-disc pl-6 text-sm text-gray-700">
          <li>Anonymous usage data (page views, session length) via analytics.</li>
          <li>Local storage for game progress and best scores only stored in your browser.</li>
          <li>Optional cookies for personalization or advertising if enabled.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-4">Third-party Services</h2>
        <p className="text-sm text-gray-700">We may use third-party services such as Google AdSense or analytics providers. Please review their privacy policies for details.</p>

        <h2 className="text-lg font-semibold mt-4">Contact</h2>
        <p className="text-sm text-gray-700">If you have questions about this policy, please contact the site owner via the About page.</p>
      </main>
    </div>
  );
}
