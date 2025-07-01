import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle, AlertTriangle, Truck, Notebook as Robot, ArrowRight } from 'lucide-react';
import { WarehouseDelivery } from '../types';

const WarehouseDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<WarehouseDelivery[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    inTransit: 0,
    queued: 0,
    picking: 0
  });

  useEffect(() => {
    // Simulate loading warehouse delivery data
    const mockDeliveries: WarehouseDelivery[] = [
      {
        id: 'WD-001',
        productId: 'PROD-WBH001',
        fromLocation: 'A-12-3',
        toLocation: 'Packaging Station A',
        status: 'delivered',
        priority: 'medium',
        estimatedTime: '10:30 AM',
        actualTime: '10:28 AM',
        robotId: 'ROBOT-001'
      },
      {
        id: 'WD-002',
        productId: 'PROD-SWB002',
        fromLocation: 'B-08-1',
        toLocation: 'Packaging Station B',
        status: 'in-transit',
        priority: 'high',
        estimatedTime: '11:15 AM',
        robotId: 'ROBOT-002'
      },
      {
        id: 'WD-003',
        productId: 'PROD-LDL003',
        fromLocation: 'C-15-2',
        toLocation: 'Packaging Station A',
        status: 'picking',
        priority: 'medium',
        estimatedTime: '11:45 AM',
        robotId: 'ROBOT-003'
      },
      {
        id: 'WD-004',
        productId: 'PROD-KBD004',
        fromLocation: 'A-05-1',
        toLocation: 'Packaging Station C',
        status: 'queued',
        priority: 'low',
        estimatedTime: '12:15 PM'
      }
    ];

    setDeliveries(mockDeliveries);
    
    // Calculate stats
    const stats = mockDeliveries.reduce((acc, delivery) => {
      acc.total++;
      if (delivery.status === 'in-transit') {
        acc.inTransit++;
      } else {
        acc[delivery.status]++;
      }
      return acc;
    }, { total: 0, delivered: 0, inTransit: 0, queued: 0, picking: 0 });
    
    setStats(stats);
  }, []);

  const getStatusIcon = (status: WarehouseDelivery['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-transit':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'picking':
        return <Robot className="h-5 w-5 text-purple-600" />;
      case 'queued':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: WarehouseDelivery['status']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in-transit':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'picking':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'queued':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: WarehouseDelivery['priority']) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'low':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Queued</p>
              <p className="text-2xl font-bold text-gray-900">{stats.queued}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Robot className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Picking</p>
              <p className="text-2xl font-bold text-gray-900">{stats.picking}</p>
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
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Warehouse Delivery Tasks</h2>
          <p className="text-gray-300 text-sm">Real-time robot delivery tracking</p>
        </div>

        <div className="divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(delivery.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{delivery.id}</h3>
                    <p className="text-sm text-gray-600">{delivery.productId}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={getPriorityBadge(delivery.priority)}>
                    {delivery.priority.toUpperCase()}
                  </span>
                  <span className={getStatusBadge(delivery.status)}>
                    {delivery.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">From:</span>
                  <span className="ml-1 font-mono">{delivery.fromLocation}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ArrowRight className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-medium">To:</span>
                  <span className="ml-1">{delivery.toLocation}</span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  {delivery.robotId && (
                    <div className="flex items-center text-purple-600">
                      <Robot className="h-4 w-4 mr-1" />
                      <span>{delivery.robotId}</span>
                    </div>
                  )}
                  <div className="text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    ETA: {delivery.estimatedTime}
                  </div>
                </div>
                {delivery.actualTime && (
                  <div className="text-green-600 font-medium">
                    Completed: {delivery.actualTime}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;