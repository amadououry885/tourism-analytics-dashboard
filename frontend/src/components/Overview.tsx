import React, { useState } from 'react';
import { MessageCircle, Heart, FileText, Share2, Eye } from 'lucide-react';
import { CitySelector } from './CitySelector';

const Overview: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const socialMetrics = [
    { icon: MessageCircle, label: 'Comments', value: 1, color: 'text-blue-600' },
    { icon: Heart, label: 'Likes', value: '0K', color: 'text-red-600' },
    { icon: FileText, label: 'Total Posts', value: 7, color: 'text-purple-600' },
    { icon: Share2, label: 'Shares', value: '0.1K', color: 'text-green-600' },
    { icon: Eye, label: 'Page Views', value: 2, color: 'text-orange-600' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kedah Tourism Analytics</h1>
        <p className="text-gray-600">Real-time insights and performance metrics</p>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">For Business</span>
          <button className="text-sm font-medium text-gray-700 hover:text-blue-600">Sign In</button>
        </div>
        <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
        <div className="flex items-center gap-2">
          <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Live
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-8">
        <div className="flex items-center divide-x divide-gray-200">
          {socialMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex-1 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">{metric.label}</span>
                    <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ...other overview sections... */}
    </div>
  );
};

export default Overview;
