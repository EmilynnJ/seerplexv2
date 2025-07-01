import React from 'react';

const HelpCenter = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-alex-brush text-5xl text-mystical-pink mb-4">
            Help Center
          </h1>
          <p className="font-playfair text-gray-300 text-lg">
            Find answers to common questions and get support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card-mystical">
            <h3 className="font-alex-brush text-2xl text-mystical-pink mb-4">
              Getting Started
            </h3>
            <ul className="space-y-2 font-playfair text-white">
              <li>• How to create an account</li>
              <li>• Adding funds to your balance</li>
              <li>• Finding the right reader</li>
              <li>• Starting your first session</li>
            </ul>
          </div>

          <div className="card-mystical">
            <h3 className="font-alex-brush text-2xl text-mystical-pink mb-4">
              Payment & Billing
            </h3>
            <ul className="space-y-2 font-playfair text-white">
              <li>• How per-minute billing works</li>
              <li>• Accepted payment methods</li>
              <li>• Refund policy</li>
              <li>• Managing your balance</li>
            </ul>
          </div>

          <div className="card-mystical">
            <h3 className="font-alex-brush text-2xl text-mystical-pink mb-4">
              Technical Support
            </h3>
            <ul className="space-y-2 font-playfair text-white">
              <li>• Video call troubleshooting</li>
              <li>• Audio issues</li>
              <li>• Connection problems</li>
              <li>• Browser compatibility</li>
            </ul>
          </div>

          <div className="card-mystical">
            <h3 className="font-alex-brush text-2xl text-mystical-pink mb-4">
              Reader Information
            </h3>
            <ul className="space-y-2 font-playfair text-white">
              <li>• How to become a reader</li>
              <li>• Setting your rates</li>
              <li>• Managing availability</li>
              <li>• Earnings and payouts</li>
            </ul>
          </div>
        </div>

        <div className="card-mystical text-center">
          <h2 className="font-alex-brush text-3xl text-mystical-pink mb-4">
            Need More Help?
          </h2>
          <p className="font-playfair text-white mb-6">
            Our support team is available 24/7 to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@soulseer.com" className="btn-mystical">
              Email Support
            </a>
            <button className="btn-mystical">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;