import { DeliveryStatus, QRScanResult, ProductScanResult, WarehouseDelivery, ApiResponse, LoginCredentials, User } from '../types';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    username: 'operator001',
    email: 'operator@warehouse.com',
    role: 'operator',
    stationId: 'A1',
    firstName: 'John',
    lastName: 'Smith',
    avatar: undefined
  },
  {
    id: '2',
    username: 'supervisor',
    email: 'supervisor@warehouse.com',
    role: 'supervisor',
    stationId: 'B2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    avatar: undefined
  },
  {
    id: '3',
    username: 'admin',
    email: 'admin@warehouse.com',
    role: 'admin',
    firstName: 'Michael',
    lastName: 'Davis',
    avatar: undefined
  }
];

// Mock backend API functions
export const api = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    await delay(1000); // Simulate network delay
    
    // Find user by username
    const user = mockUsers.find(u => u.username === credentials.username);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Simple password check (in real app, this would be hashed)
    if (credentials.password !== 'demo123') {
      return {
        success: false,
        message: 'Invalid password'
      };
    }
    
    return {
      success: true,
      data: user,
      message: 'Login successful'
    };
  },

  async updateDeliveryStatus(packageId: string, status: DeliveryStatus['status']): Promise<ApiResponse<DeliveryStatus>> {
    await delay(800);
    
    return {
      success: true,
      data: {
        id: Math.random().toString(36).substr(2, 9),
        status,
        address: 'Packaging Station A',
        recipient: 'Station Operator',
        estimatedTime: new Date(Date.now() + 30 * 60000).toLocaleTimeString(),
        packageId
      },
      message: 'Delivery status updated successfully'
    };
  },

  async sendQRScanResult(scanResult: QRScanResult): Promise<ApiResponse<string>> {
    await delay(600);
    
    console.log('Sending QR scan result to backend:', scanResult);
    
    return {
      success: true,
      data: 'scan-confirmation-' + Math.random().toString(36).substr(2, 9),
      message: 'QR scan result processed successfully'
    };
  },

  async sendProductScanResult(scanResult: ProductScanResult): Promise<ApiResponse<string>> {
    await delay(1200); // Longer delay to simulate AI model processing
    
    console.log('Sending product scan to AI model backend:', scanResult);
    
    return {
      success: true,
      data: 'product-identification-' + Math.random().toString(36).substr(2, 9),
      message: 'Product identified and logged successfully'
    };
  },

  async identifyProduct(imageData: string): Promise<ApiResponse<ProductScanResult>> {
    await delay(2000); // Simulate AI model processing time
    
    // Mock product identification results
    const mockProducts = [
      {
        productId: 'PROD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        productName: 'Wireless Bluetooth Headphones',
        category: 'Electronics',
        rackLocation: 'A-12-3',
        confidence: 0.94,
        sku: 'WBH-001',
        dimensions: { width: 15, height: 20, depth: 8 },
        weight: 0.25
      },
      {
        productId: 'PROD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        productName: 'Stainless Steel Water Bottle',
        category: 'Home & Kitchen',
        rackLocation: 'B-08-1',
        confidence: 0.89,
        sku: 'SWB-002',
        dimensions: { width: 7, height: 25, depth: 7 },
        weight: 0.35
      },
      {
        productId: 'PROD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        productName: 'LED Desk Lamp',
        category: 'Office Supplies',
        rackLocation: 'C-15-2',
        confidence: 0.91,
        sku: 'LDL-003',
        dimensions: { width: 12, height: 45, depth: 12 },
        weight: 0.8
      }
    ];
    
    const selectedProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    
    return {
      success: true,
      data: {
        ...selectedProduct,
        imageUrl: imageData,
        timestamp: new Date()
      },
      message: 'Product identified successfully'
    };
  },

  async createWarehouseDelivery(productId: string, fromLocation: string, toLocation: string): Promise<ApiResponse<WarehouseDelivery>> {
    await delay(500);
    
    return {
      success: true,
      data: {
        id: 'WD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        productId,
        fromLocation,
        toLocation,
        status: 'queued',
        priority: 'medium',
        estimatedTime: new Date(Date.now() + 15 * 60000).toLocaleTimeString(),
        robotId: 'ROBOT-' + Math.floor(Math.random() * 5 + 1).toString().padStart(3, '0')
      },
      message: 'Warehouse delivery task created successfully'
    };
  },

  async getCameraStream(vehicleId: string): Promise<ApiResponse<string>> {
    await delay(400);
    
    // Simulate camera stream URL from warehouse robot
    return {
      success: true,
      data: `https://example.com/warehouse-stream/${vehicleId}`,
      message: 'Warehouse robot camera stream connected'
    };
  }
};