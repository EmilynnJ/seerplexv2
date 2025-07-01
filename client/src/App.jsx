import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReadingRoom from './pages/ReadingRoom';
import Dashboard from './pages/Dashboard';
import LiveStream from './pages/LiveStream';
import Shop from './pages/Shop';
import Community from './pages/Community';
import Messages from './pages/Messages';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import HelpCenter from './pages/HelpCenter';
import Policies from './pages/Policies';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-cosmic">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reading/:sessionId" element={<ReadingRoom />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live/:streamId?" element={<LiveStream />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/community" element={<Community />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/policies" element={<Policies />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;