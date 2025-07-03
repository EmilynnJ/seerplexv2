import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="card-mystical">
          <div className="text-center mb-8">
            <h2 className="font-alex-brush text-4xl text-mystical-pink mb-2">
              Join SoulSeer
            </h2>
            <p className="font-playfair text-gray-300">
              Create your account to connect with gifted psychics
            </p>
          </div>

          <div className="clerk-signup-wrapper">
            <SignUp
              routing="hash"
              afterSignUpUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsIconButton: "btn-mystical",
                  formButtonPrimary: "btn-mystical",
                  formFieldInput: "input-mystical",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-mystical-pink",
                  footerActionLink: "text-mystical-pink hover:text-pink-300"
                }
              }}
            />
          </div>

          <div className="mt-6 text-center">
            <p className="font-playfair text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-mystical-pink hover:text-pink-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
