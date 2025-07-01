import React, { useState, useRef, useEffect } from 'react';
import { Scan, CheckCircle, AlertCircle, Camera, ImagePlus } from 'lucide-react';
import { api } from '../utils/api';
import { QRScanResult } from '../types';

const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [pendingScanData, setPendingScanData] = useState<QRScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId); // Select the first available device by default
      }
    } catch (error) {
      console.error('Error fetching camera devices:', error);
    }
  };

  const startScanning = async () => {
    if (!selectedDeviceId) {
      setMessage('Please select a camera device.');
      return;
    }
    setCapturedImage(null);
    setScanResult(null);
    setPendingScanData(null);
    setIsScanning(true);
    setMessage('');

    try {
      // Request camera access for QR scanning
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.log('Camera not available, using simulation mode');
      // Simulate QR scan after delay
      setTimeout(() => {
        simulateQRScan();
      }, 3000);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas width/height to video dimensions or fallback
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get data URL from canvas
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    setMessage('');
  };

  const simulateQRScan = async () => {
    const mockScanResult: QRScanResult = {
      packageId: 'PKG-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      recipientName: 'Sarah Johnson',
      address: '456 Oak Avenue, Springfield, IL 62701',
      deliveryCode: 'DLV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date()
    };

    setPendingScanData(mockScanResult);
    setIsScanning(false);
    setIsProcessing(true);
    setMessage('');

    try {
      const response = await api.sendQRScanResult(mockScanResult);
      if (response.success) {
        setScanResult(mockScanResult);
        setMessage('QR code scanned and sent to backend successfully!');
      } else {
        setMessage('Failed to process QR scan result.');
      }
    } catch (error) {
      setMessage('Error communicating with backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  // New function to process captured image data to backend
  const processCapturedImage = async () => {
    if (!capturedImage) {
      setMessage('No image captured to process.');
      return;
    }
    setIsProcessing(true);
    setMessage('');
    try {
      // Example API call - adapt according to your backend API
      // Assuming API accepts base64 image or blob - here passing base64 string
      const response = await api.sendCapturedImage({ imageData: capturedImage });
      if (response.success) {
        setMessage('Captured image sent to backend successfully!');
      } else {
        setMessage('Failed to send captured image.');
      }
    } catch (error) {
      setMessage('Error sending captured image to backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmScan = async () => {
    if (!pendingScanData) return;
    setIsProcessing(true);
    setMessage('');
    try {
      const response = await api.sendQRScanResult(pendingScanData);
      if (response.success) {
        setScanResult(pendingScanData);
        setMessage('QR code scanned and sent to backend successfully!');
        setPendingScanData(null);
      } else {
        setMessage('Failed to process QR scan result.');
      }
    } catch (error) {
      setMessage('Error communicating with backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setPendingScanData(null);
    setMessage('');
    setIsProcessing(false);
    setCapturedImage(null);
  };

  useEffect(() => {
    getCameraDevices();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">QR Code Scanner</h2>
            <p className="text-emerald-100 text-sm">Package Verification & Tracking</p>
          </div>
          <Scan className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="p-6">
        {!scanResult && !pendingScanData ? (
          <>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64 lg:h-80 mb-4 flex flex-col items-center justify-center">
              {!isScanning ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-400 mb-4">Ready to scan QR codes</p>
                  {devices.length > 1 && (
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="bg-gray-800 text-white rounded px-3 py-1 mb-4 max-w-xs"
                      aria-label="Select camera device"
                    >
                      {devices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId}`}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={startScanning}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto mb-3"
                  >
                    <Scan className="h-4 w-4" />
                    <span>Start QR Scanner</span>
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center bg-gradient-to-br from-emerald-900 to-gray-900 p-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                    aria-live="off"
                    aria-label="QR code scanner video feed"
                  />
                  <div className="mt-3 flex space-x-3">
                    <button
                      onClick={captureImage}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2"
                      title="Capture Image"
                      aria-label="Capture image from video feed"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span>Capture</span>
                    </button>
                    <button
                      onClick={stopScanning}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                      title="Stop Scanning"
                      aria-label="Stop scanning camera"
                    >
                      Stop Scanning
                    </button>
                  </div>
                  <p className="mt-2 text-emerald-200 text-sm">Position QR code within the frame</p>
                </div>
              )}
            </div>

            {/* Display captured image relay and Process button */}
            {capturedImage && (
              <div className="mt-4 text-center">
                <p className="mb-2 text-gray-700 font-semibold">Captured Image Preview</p>
                <img
                  src={capturedImage}
                  alt="Captured snapshot from QR scanner camera feed"
                  className="mx-auto rounded-lg border border-gray-400 max-w-full h-auto"
                />
                <button
                  onClick={processCapturedImage}
                  disabled={isProcessing}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Process Captured Image'}
                </button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : pendingScanData ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Scan className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Confirm Scan Data</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Package ID</p>
                  <p className="font-mono text-gray-900">{pendingScanData.packageId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Code</p>
                  <p className="font-mono text-gray-900">{pendingScanData.deliveryCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Recipient</p>
                  <p className="text-gray-900">{pendingScanData.recipientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Scanned At</p>
                  <p className="text-gray-900">{pendingScanData.timestamp.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">Delivery Address</p>
                <p className="text-gray-900">{pendingScanData.address}</p>
              </div>

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={confirmScan}
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {isProcessing ? 'Sending...' : 'Scan & Send'}
                </button>
                <button
                  onClick={() => {
                    setPendingScanData(null);
                    setMessage('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">QR Code Scanned Successfully</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Package ID</p>
                  <p className="font-mono text-gray-900">{scanResult.packageId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Code</p>
                  <p className="font-mono text-gray-900">{scanResult.deliveryCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Recipient</p>
                  <p className="text-gray-900">{scanResult.recipientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Scanned At</p>
                  <p className="text-gray-900">{scanResult.timestamp.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">Delivery Address</p>
                <p className="text-gray-900">{scanResult.address}</p>
              </div>
            </div>

            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  <p className="text-blue-800">Sending scan result to backend...</p>
                </div>
              </div>
            )}

            {message && (
              <div
                className={`border rounded-lg p-4 ${
                  message.includes('success')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.includes('success') ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <p>{message}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={resetScanner}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Scan Another QR Code
              </button>
              <button
                onClick={() => api.updateDeliveryStatus(scanResult.packageId, 'delivered')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Mark as Delivered
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;

