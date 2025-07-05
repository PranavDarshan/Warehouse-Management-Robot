import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle, AlertTriangle, Truck } from 'lucide-react';
import { DeliveryStatus } from '../types';

const DeliveryDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryStatus[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    inTransit: 0,
    pending: 0
  });

  useEffect(() => {
    // Simulate loading delivery data
    const mockDeliveries: DeliveryStatus[] = [
      {
        id: '1',
        status: 'delivered',
        address: '123 Maple Street, Downtown',
        recipient: 'John Smith',
        estimatedTime: '10:30 AM',
        packageId: 'PKG-001'
      },
      {
        id: '2',
        status: 'in-transit',
        address: '456 Oak Avenue, Midtown',
        recipient: 'Sarah Johnson',
        estimatedTime: '11:15 AM',
        packageId: 'PKG-002'
      },
      {
        id: '3',
        status: 'pending',
        address: '789 Pine Road, Suburbs',
        recipient: 'Mike Wilson',
        estimatedTime: '12:00 PM',
        packageId: 'PKG-003'
      },
      {
        id: '4',
        status: 'in-transit',
        address: '321 Elm Street, Uptown',
        recipient: 'Emily Davis',
        estimatedTime: '12:45 PM',
        packageId: 'PKG-004'
      }
    ];

    setDeliveries(mockDeliveries);
    
    // Calculate stats
    const stats = mockDeliveries.reduce((acc, delivery) => {
      acc.total++;
      acc[delivery.status === 'in-transit' ? 'inTransit' : delivery.status]++;
      return acc;
    }, { total: 0, delivered: 0, inTransit: 0, pending: 0 });
    
    setStats(stats);
  }, []);

  const getStatusIcon = (status: DeliveryStatus['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-transit':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: DeliveryStatus['status']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in-transit':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Today's Deliveries</h2>
          <p className="text-gray-300 text-sm">Real-time delivery status and tracking</p>
        </div>

        <div className="divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(delivery.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{delivery.packageId}</h3>
                    <p className="text-sm text-gray-600">{delivery.recipient}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={getStatusBadge(delivery.status)}>
                    {delivery.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{delivery.estimatedTime}</p>
                </div>
              </div>
              
              <div className="mt-3 flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{delivery.address}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;