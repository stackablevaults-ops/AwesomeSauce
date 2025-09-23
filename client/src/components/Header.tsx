import React from 'react';
import { useLocation } from 'wouter';

export default function Header() {
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Kolossus Forge', path: '/kolossus' },
    { name: 'Treasury', path: '/treasury' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Training', path: '/training' },
    { name: 'Evaluation', path: '/evaluation' },
    { name: 'Agents', path: '/agents' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            onClick={() => setLocation('/')}
            className="font-bold text-xl text-blue-600 cursor-pointer"
          >
            AwesomeSauce AI
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location === item.path
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLocation('/register')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => setLocation('/register')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}