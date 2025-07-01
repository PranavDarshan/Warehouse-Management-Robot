import { useState, useEffect, useRef } from 'react';
import { CameraFeed } from '../types';

export const useCamera = () => {
  const [cameraFeed, setCameraFeed] = useState<CameraFeed>({
    id: 'vehicle-001',
    isActive: false,
    quality: 'high',
    url: '',
    timestamp: new Date()
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setCameraFeed(prev => ({
        ...prev,
        isActive: true,
        url: 'https://example.com/live-feed',
        timestamp: new Date()
      }));
      setIsConnecting(false);
      
      // Update timestamp every 5 seconds to simulate live feed
      intervalRef.current = setInterval(() => {
        setCameraFeed(prev => ({
          ...prev,
          timestamp: new Date()
        }));
      }, 5000);
    }, 2000);
  };

  const stopCamera = () => {
    setCameraFeed(prev => ({
      ...prev,
      isActive: false,
      url: ''
    }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const changeQuality = (quality: CameraFeed['quality']) => {
    setCameraFeed(prev => ({
      ...prev,
      quality
    }));
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    cameraFeed,
    isConnecting,
    startCamera,
    stopCamera,
    changeQuality
  };
};