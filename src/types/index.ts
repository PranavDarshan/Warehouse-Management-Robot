export interface DeliveryStatus {
  id: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  address: string;
  recipient: string;
  estimatedTime: string;
  packageId: string;
}

export interface CameraFeed {
  id: string;
  isActive: boolean;
  quality: 'low' | 'medium' | 'high';
  url: string;
  timestamp: Date;
}

export interface QRScanResult {
  packageId: string;
  recipientName: string;
  address: string;
  deliveryCode: string;
  timestamp: Date;
}

export interface ProductScanResult {
  productId: string;
  productName: string;
  category: string;
  rackLocation: string;
  confidence: number;
  imageUrl: string;
  timestamp: Date;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  weight?: number;
  sku: string;
}

export interface WarehouseDelivery {
  id: string;
  productId: string;
  fromLocation: string;
  toLocation: string;
  status: 'queued' | 'picking' | 'in-transit' | 'delivered' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: string;
  actualTime?: string;
  robotId?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'operator' | 'supervisor' | 'admin';
  stationId?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}