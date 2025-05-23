import React from 'react';

const Analytics = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Route Analytics</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500">Route Efficiency</h3>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{width: '85%'}}></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">85%</span>
              </div>
            </div>
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500">On-Time Delivery</h3>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '92%'}}></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
