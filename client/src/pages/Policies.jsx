import React from 'react';

const Policies = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-alex-brush text-5xl text-mystical-pink mb-4">
            Terms & Policies
          </h1>
          <p className="font-playfair text-gray-300 text-lg">
            Our commitment to ethical and transparent service
          </p>
        </div>

        <div className="space-y-8">
          <div className="card-mystical">
            <h2 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              Terms of Service
            </h2>
            <div className="font-playfair text-white space-y-4">
              <p>
                By using SoulSeer, you agree to our terms of service. Our platform connects clients with independent spiritual advisors for entertainment and guidance purposes.
              </p>
              <p>
                All readings are for entertainment purposes only and should not replace professional medical, legal, or financial advice.
              </p>
              <p>
                Users must be 18 years or older to use our services. We maintain a zero-tolerance policy for harassment, inappropriate behavior, or fraudulent activity.
              </p>
            </div>
          </div>

          <div className="card-mystical">
            <h2 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              Privacy Policy
            </h2>
            <div className="font-playfair text-white space-y-4">
              <p>
                We respect your privacy and are committed to protecting your personal information. We collect only the information necessary to provide our services.
              </p>
              <p>
                Your session data is encrypted and secure. We do not share your personal information with third parties except as required by law.
              </p>
              <p>
                You have the right to access, update, or delete your personal information at any time through your account settings.
              </p>
            </div>
          </div>

          <div className="card-mystical">
            <h2 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              Payment Policy
            </h2>
            <div className="font-playfair text-white space-y-4">
              <p>
                SoulSeer operates on a pay-per-minute basis. You are charged only for the time you spend in active sessions with readers.
              </p>
              <p>
                All payments are processed securely through Stripe. We do not store your payment information on our servers.
              </p>
              <p>
                Refunds are available in cases of technical issues or reader misconduct, subject to review by our support team.
              </p>
            </div>
          </div>

          <div className="card-mystical">
            <h2 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              Reader Guidelines
            </h2>
            <div className="font-playfair text-white space-y-4">
              <p>
                Our readers are independent contractors who set their own rates and availability. They are required to maintain professional standards and ethical practices.
              </p>
              <p>
                Readers keep 70% of their earnings, ensuring fair compensation for their services. Payouts are processed daily for balances over $15.
              </p>
              <p>
                All readers must pass our verification process and agree to our code of ethics before joining the platform.
              </p>
            </div>
          </div>

          <div className="card-mystical">
            <h2 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              Contact Information
            </h2>
            <div className="font-playfair text-white">
              <p className="mb-2">
                For questions about these policies, please contact us:
              </p>
              <p>Email: legal@soulseer.com</p>
              <p>Address: SoulSeer Legal Department</p>
              <p className="mt-4 text-sm text-gray-400">
                Last updated: January 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;