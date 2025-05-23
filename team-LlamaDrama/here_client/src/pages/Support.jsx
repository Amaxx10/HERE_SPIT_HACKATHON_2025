import React from 'react';

const Support = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Support Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Contact Support</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4"></textarea>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Submit Request
            </button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">FAQ</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-md font-medium text-gray-800">How do I integrate the API?</h3>
              <p className="text-gray-600 mt-2">Check our documentation for detailed integration guides and code samples.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="text-md font-medium text-gray-800">What are the pricing plans?</h3>
              <p className="text-gray-600 mt-2">We offer flexible pricing based on usage. Contact sales for custom quotes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
