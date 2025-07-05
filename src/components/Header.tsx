import React from 'react';
import { Warehouse, Signal, User, Package, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700';
      case 'supervisor':
        return 'bg-blue-50 text-blue-700';
      case 'operator':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStationId = () => {
    return user?.stationId || 'A1';
  };

  return (
    <header className="bg-white shadow-lg border-b-4 border-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Warehouse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WarehousePro</h1>
              <p className="text-xs text-gray-500">AI-Powered Warehouse Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Signal className="h-4 w-4" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-purple-50 rounded-full px-3 py-1">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Station #{getStationId()}</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 rounded-full px-3 py-1 ${getRoleColor(user.role)}`}>
                  <User className="h-4 w-4" />
                  <div className="text-sm">
                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                    <span className="ml-2 text-xs opacity-75">({user.role})</span>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;