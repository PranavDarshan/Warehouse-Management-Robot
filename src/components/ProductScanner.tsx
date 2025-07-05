import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Package, MapPin, CheckCircle, AlertCircle, Loader, Eye, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';
import { ProductScanResult } from '../types';

const ProductScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ProductScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enumerate video input devices
  const enumerateVideoDevices = async () => {
    try {
      // Request permission first to get labels
      try {
        const tmpStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tmpStream.getTracks().forEach(track => track.stop());
      } catch {
        // Permission not granted yet
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      setVideoDevices(videoInputs);

      if(videoInputs.length > 0) {
        setMessage('');
        // If none selected yet, pick first device
        setSelectedDeviceId(prev => prev && videoInputs.some(dev => dev.deviceId === prev) ? prev : videoInputs[0].deviceId);
      } else {
        setMessage('No camera devices found. Please ensure Camo or other cameras are connected.');
      }
    } catch (error) {
      setMessage(`Error enumerating devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Start camera with selected device id
  const startCamera = async () => {
    if (!selectedDeviceId) {
      setMessage('Please select a camera device to start.');
      return;
    }
    setIsScanning(true);
    setMessage('');

    try {
      if (videoRef.current?.srcObject) {
        // Stop previous stream
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          deviceId: { exact: selectedDeviceId },
          width: 1280,
          height: 720,
          facingMode: 'environment',
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setMessage('Failed to start camera. Make sure the selected device is connected and permission granted.');
      setIsScanning(false);
    }
  };

  // Stop camera feed
  const stopCamera = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Capture photo from video feed
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();

    await processImage(imageData);
  }, []);

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      await processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Process captured or uploaded image
  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setMessage('');

    try {
      const response = await api.identifyProduct(imageData);
      if (response.success && response.data) {
        setScanResult(response.data);
        setMessage('Product identified successfully!');
        await api.sendProductScanResult(response.data);
      } else {
        setMessage('Failed to identify product. Please try again.');
      }
    } catch (error) {
      setMessage('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Create delivery task
  const createDeliveryTask = async () => {
    if (!scanResult) return;

    try {
      const response = await api.createWarehouseDelivery(
        scanResult.productId,
        scanResult.rackLocation,
        'Packaging Station A'
      );
      if (response.success) {
        setMessage('Delivery task created! Robot will pick up the product shortly.');
      } else {
        setMessage('Failed to create delivery task.');
      }
    } catch {
      setMessage('Error creating delivery task.');
    }
  };

  // Reset scanner to initial state
  const resetScanner = () => {
    setScanResult(null);
    setCapturedImage(null);
    setMessage('');
    setIsProcessing(false);
    setSelectedDeviceId(videoDevices.length > 0 ? videoDevices[0].deviceId : '');
  };

  // Enumerate devices once on mount
  React.useEffect(() => {
    enumerateVideoDevices();
  }, []);

  const isConnectDisabled = isScanning || isProcessing || !selectedDeviceId;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Product Scanner</h2>
          <p className="text-purple-100 text-sm">AI-Powered Product Identification</p>
        </div>
        <Package className="h-8 w-8 text-white" />
      </div>

<div className="p-6">
        {!scanResult ? (
          <>
            <div className="mb-4 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3 flex-wrap justify-center">
                <label htmlFor="deviceSelect" className="text-gray-700 font-medium min-w-[140px]">
                  Select Camera Source:
                </label>
                <select
                  id="deviceSelect"
                  className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedDeviceId}
                  onChange={e => setSelectedDeviceId(e.target.value)}
                  disabled={isScanning || isProcessing}
                  aria-label="Select camera source"
                >
                  {videoDevices.length === 0 && <option value="">No cameras available</option>}
                  {videoDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera (${device.deviceId.slice(0, 8)})`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isConnectDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isConnectDisabled}
                aria-label="Start camera"
              >
                <Camera className="h-5 w-5" />
                <span>Start Camera</span>
              </button>
            
            </div>

            <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64 lg:h-80 mb-4">
              {!isScanning && !capturedImage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">Ready to scan products</p>
                  </div>
                </div>
              ) : capturedImage ? (
                <div className="relative h-full">
                  <img
                    src={capturedImage}
                    alt="Captured product"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Analyzing product...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-full">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay={true}
                    muted={true}
                    playsInline={true}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-4 border-purple-400 rounded-lg w-48 h-48 opacity-50"></div>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={capturePhoto}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors"
                      aria-label="Capture photo"
                      type="button"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <button
                      onClick={stopCamera}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                      aria-label="Cancel scanning"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {message && !scanResult && (
              <div
                className={`border rounded-lg p-4 mb-4 ${
                  message.toLowerCase().includes('success') || message.toLowerCase().includes('identified')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-center space-x-2">
                  {(message.toLowerCase().includes('success') || message.toLowerCase().includes('identified')) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <p>{message}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Product Identified</h3>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  {Math.round(scanResult.confidence * 100)}% confidence
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Product Name</p>
                    <p className="font-semibold text-gray-900">{scanResult.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">SKU</p>
                    <p className="font-mono text-gray-900">{scanResult.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <p className="text-gray-900">{scanResult.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rack Location</p>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <p className="font-mono text-gray-900">{scanResult.rackLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {scanResult.dimensions && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dimensions (cm)</p>
                      <p className="text-gray-900">
                        {scanResult.dimensions.width} × {scanResult.dimensions.height} × {scanResult.dimensions.depth}
                      </p>
                    </div>
                  )}
                  {scanResult.weight && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weight</p>
                      <p className="text-gray-900">{scanResult.weight} kg</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scanned At</p>
                    <p className="text-gray-900">{scanResult.timestamp.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {capturedImage && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Captured Image</p>
                <img
                  src={capturedImage}
                  alt="Scanned product"
                  className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                />
              </div>
            )}

            {message && (
              <div
                className={`border rounded-lg p-4 ${
                  message.toLowerCase().includes('success') || message.toLowerCase().includes('created')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-center space-x-2">
                  {(message.toLowerCase().includes('success') || message.toLowerCase().includes('created')) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <p>{message}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                onClick={resetScanner}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                type="button"
              >
                Scan Another Product
              </button>
              <button
                onClick={createDeliveryTask}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                type="button"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Send to Packaging</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductScanner;


