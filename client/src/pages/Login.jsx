import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="card-mystical">
          <div className="text-center mb-8">
            <h2 className="font-alex-brush text-4xl text-mystical-pink mb-2">
              Welcome Back
            </h2>
            <p className="font-playfair text-gray-300">
              Sign in to your SoulSeer account
            </p>
          </div>

          <div className="clerk-signin-wrapper">
            <SignIn
              routing="hash"
              afterSignInUrl="/dashboard"
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
              Don't have an account?{' '}
              <Link to="/signup" className="text-mystical-pink hover:text-pink-300 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
