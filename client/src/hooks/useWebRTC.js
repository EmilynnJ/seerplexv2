import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

export const useWebRTC = (sessionId, userRole, readerRate) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [sessionTime, setSessionTime] = useState(0);
  const [balance, setBalance] = useState(0);
  
  const socketRef = useRef();
  const peerConnectionRef = useRef();
  const dataChannelRef = useRef();
  const billingIntervalRef = useRef();
  const sessionTimerRef = useRef();

  useEffect(() => {
    initializeWebRTC();
    return cleanup;
  }, [sessionId]);

  const initializeWebRTC = async () => {
    try {
      // Initialize Socket.IO
      socketRef.current = io('http://localhost:4000');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      
      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });
      
      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      
      // Setup data channel for chat
      if (userRole === 'client') {
        dataChannelRef.current = peerConnectionRef.current.createDataChannel('chat');
        setupDataChannel();
      } else {
        peerConnectionRef.current.ondatachannel = (event) => {
          dataChannelRef.current = event.channel;
          setupDataChannel();
        };
      }
      
      // Setup signaling
      setupSignaling();
      
      // Start session if client
      if (userRole === 'client') {
        startSession();
      }
      
    } catch (error) {
      console.error('WebRTC initialization failed:', error);
      setConnectionStatus('failed');
    }
  };

  const setupSignaling = () => {
    const socket = socketRef.current;
    const pc = peerConnectionRef.current;
    
    socket.emit('join-session', sessionId);
    
    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          sessionId,
          candidate: event.candidate
        });
      }
    };
    
    socket.on('ice-candidate', (candidate) => {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    });
    
    // Offer/Answer handling
    socket.on('offer', async (offer) => {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { sessionId, answer });
    });
    
    socket.on('answer', async (answer) => {
      await pc.setRemoteDescription(answer);
      setConnectionStatus('connected');
      if (userRole === 'client') {
        startBilling();
      }
    });
    
    socket.on('session-ended', () => {
      endSession();
    });
  };

  const setupDataChannel = () => {
    const dc = dataChannelRef.current;
    
    dc.onopen = () => {
      console.log('Data channel opened');
    };
    
    dc.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
  };

  const startSession = async () => {
    try {
      const pc = peerConnectionRef.current;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('offer', { sessionId, offer });
      
      // Start session timer
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const startBilling = () => {
    // Charge every minute
    billingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.post('/api/sessions/charge', {
          sessionId,
          amount: Math.round(readerRate * 100) // Convert to cents
        });
        
        setBalance(response.data.balance);
        
        if (response.data.balance < readerRate) {
          endSession();
        }
      } catch (error) {
        console.error('Billing failed:', error);
        endSession();
      }
    }, 60000); // 1 minute
  };

  const sendMessage = (text) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const message = {
        text,
        sender: userRole,
        timestamp: Date.now()
      };
      dataChannelRef.current.send(JSON.stringify(message));
      setMessages(prev => [...prev, message]);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const endSession = async () => {
    try {
      // Notify server
      await axios.post(`/api/sessions/${sessionId}/end`);
      
      // Notify other peer
      socketRef.current.emit('end-session', sessionId);
      
      setConnectionStatus('ended');
      cleanup();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const cleanup = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    // Clear intervals
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
    }
    
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
  };

  return {
    localStream,
    remoteStream,
    messages,
    connectionStatus,
    sessionTime,
    balance,
    sendMessage,
    toggleVideo,
    toggleAudio,
    endSession
  };
};