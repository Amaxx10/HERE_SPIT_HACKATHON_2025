import React from 'react';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Fleet Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Active Vehicles</h3>
          <p className="text-3xl font-bold text-blue-600">127</p>
          <p className="text-sm text-gray-500 mt-2">+12% from last week</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Total Distance</h3>
          <p className="text-3xl font-bold text-green-600">1,432 km</p>
          <p className="text-sm text-gray-500 mt-2">Daily average</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Fuel Efficiency</h3>
          <p className="text-3xl font-bold text-purple-600">87%</p>
          <p className="text-sm text-gray-500 mt-2">Fleet average</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
