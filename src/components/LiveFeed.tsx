import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize2, AlertCircle, RefreshCw, Download } from 'lucide-react';

// Data Structures for Camera Management
interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface CameraFeedState {
  id: string;
  isActive: boolean;
  quality: 'low' | 'medium' | 'high';
  timestamp: Date;
  deviceId: string | null;
  feedType: 'robot' | 'camo';
  stream: MediaStream | null;
}

interface CameraManager {
  devices: CameraDevice[];
  currentFeed: CameraFeedState;
  isConnecting: boolean;
  error: string | null;
}

const LiveFeed: React.FC = () => {
  // State management using our data structures
  const [cameraManager, setCameraManager] = useState<CameraManager>({
    devices: [],
    currentFeed: {
      id: 'robot-001',
      isActive: false,
      quality: 'medium',
      timestamp: new Date(),
      deviceId: null,
      feedType: 'robot',
      stream: null
    },
    isConnecting: false,
    error: null
  });

  // New state for selected device from dropdown
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get available camera devices (for Camo integration)
  const getCameraDevices = async () => {
    try {
      // Request permission first
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach(track => track.stop());
      } catch (permError) {
        console.log('Camera permission not granted yet');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));

      setCameraManager(prev => ({
        ...prev,
        devices: videoDevices,
        error: videoDevices.length === 0 ? 'No camera devices found' : null
      }));

      // Reset selectedDeviceId if current is not in new list
      if (!videoDevices.some(d => d.deviceId === selectedDeviceId)) {
        setSelectedDeviceId('');
      }

      console.log('Camera devices found:', videoDevices);
    } catch (error) {
      setCameraManager(prev => ({
        ...prev,
        error: `Error getting devices: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  };

  // Start camera feed using selected device
  const startCamera = async (deviceId?: string) => {
    const idToUse = deviceId || selectedDeviceId;
    if (!idToUse) {
      setCameraManager(prev => ({
        ...prev,
        error: 'Please select a camera device first'
      }));
      return;
    }

    setCameraManager(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Stop existing stream if any
      if (cameraManager.currentFeed.stream) {
        cameraManager.currentFeed.stream.getTracks().forEach(track => track.stop());
      }

      // Start camera stream with selected device
      const constraints = {
        video: {
          deviceId: { exact: idToUse },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Obtained media stream:', stream);

      setCameraManager(prev => ({
        ...prev,
        currentFeed: {
          ...prev.currentFeed,
          id: idToUse,
          isActive: true,
          timestamp: new Date(),
          feedType: 'robot', // Robot camera is the iPhone camera
          deviceId: idToUse,
          stream
        },
        isConnecting: false,
        error: null
      }));

      // When camera started successfully, clear selectedDeviceId
      setSelectedDeviceId('');
    } catch (error) {
      setCameraManager(prev => ({
        ...prev,
        isConnecting: false,
        error: `Failed to start camera: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      console.error('Failed to start camera:', error);
    }
  };

  // Effect: Update video.srcObject when currentFeed.stream changes
  useEffect(() => {
    if (videoRef.current) {
      if (cameraManager.currentFeed.stream) {
        videoRef.current.srcObject = cameraManager.currentFeed.stream;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraManager.currentFeed.stream]);

  // Stop camera feed
  const stopCamera = () => {
    if (cameraManager.currentFeed.stream) {
      cameraManager.currentFeed.stream.getTracks().forEach(track => track.stop());
    }

    setCameraManager(prev => ({
      ...prev,
      currentFeed: {
        ...prev.currentFeed,
        isActive: false,
        stream: null,
        deviceId: null
      }
    }));
  };

  // Change quality
  const changeQuality = (quality: 'low' | 'medium' | 'high') => {
    setCameraManager(prev => ({
      ...prev,
      currentFeed: {
        ...prev.currentFeed,
        quality
      }
    }));
  };

  // Take screenshot
  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;

    ctx?.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cameraManager.currentFeed.feedType}-screenshot-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Initialize devices on mount
  useEffect(() => {
    getCameraDevices();
  }, []);

  // Update timestamp every second when active
  useEffect(() => {
    if (!cameraManager.currentFeed.isActive) return;
    const interval = setInterval(() => {
      setCameraManager(prev => ({
        ...prev,
        currentFeed: {
          ...prev.currentFeed,
          timestamp: new Date()
        }
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [cameraManager.currentFeed.isActive]);

  const { currentFeed, isConnecting, devices, error } = cameraManager;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2" tabIndex={0}>
              Robot Live Feed
            </h2>
            <p className="text-blue-100 text-sm max-w-md" tabIndex={0}>
              Warehouse Robot Camera Stream (iPhone via Camo)
            </p>
          </div>
          
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Camera Device Selection */}
        <div className="mb-6">
          <label htmlFor="cameraSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Select Robot Camera Device:
          </label>
          <div className="flex gap-2 flex-wrap items-center">
            <select
              id="cameraSelect"
              className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              value={selectedDeviceId}
              disabled={currentFeed.isActive || isConnecting}
              aria-disabled={currentFeed.isActive || isConnecting}
              aria-label="Select camera device"
            >
              <option value="">Choose a camera device...</option>
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => startCamera(selectedDeviceId)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              disabled={currentFeed.isActive || isConnecting || !selectedDeviceId}
              aria-disabled={currentFeed.isActive || isConnecting || !selectedDeviceId}
              type="button"
            >
              Connect
            </button>

            <button
              onClick={getCameraDevices}
              className="px-20 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
              disabled={isConnecting}
              aria-disabled={isConnecting}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          {devices.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Make sure Camo is running on your iPhone and laptop, then click Refresh.
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            aria-live="assertive"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Video Container */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64 lg:h-80">
          {!currentFeed.isActive && !isConnecting ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4">
              <div className="text-center max-w-sm">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-gray-400 mb-4 font-semibold">
                  Robot camera feed disconnected
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Select a camera device above to connect
                </p>
              </div>
            </div>
          ) : isConnecting ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <div
                  className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"
                  aria-label="Loading animation"
                  role="status"
                />
                <p className="text-gray-400" aria-live="polite">
                  Connecting to robot camera feed...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Real Video Feed from iPhone Camera */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                aria-live="off"
                aria-label="Live robot camera video feed"
              />

              {/* Live indicator */}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded px-3 py-1">
                <p className="text-white text-sm font-mono select-none" tabIndex={-1}>
                  LIVE • {currentFeed.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <div className="absolute top-4 right-4 bg-red-600 rounded-full w-3 h-3 animate-pulse" aria-hidden="true"></div>

              {/* Controls overlay */}
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={takeScreenshot}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                  title="Take Screenshot"
                  aria-label="Take screenshot of live feed"
                  type="button"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  title="Stop Camera"
                  aria-label="Stop live camera feed"
                  type="button"
                >
                  <Pause className="h-4 w-4" />
                </button>
                <button
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  title="Maximize"
                  aria-label="Maximize video"
                  type="button"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Status Cards */}
        {currentFeed.isActive && (
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-1 gap-4 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center shadow-sm">
              <p className="text-green-600 font-semibold mb-1">Status</p>
              <p className="text-green-800 font-mono select-text">Connected</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default LiveFeed;