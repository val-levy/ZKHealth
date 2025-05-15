import React from 'react';
import { ShieldIcon } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <ShieldIcon size={24} className="mr-2" />
            <span className="text-xl font-bold">ZKHealth</span>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8 text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p>support@zkhealth.com</p>
              <p>+1 (541) 123-4567</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>© 2025 ZKHealth. All rights reserved.</p>
          <p className="mt-1">
            Secure medical data sharing with zero-knowledge proof technology.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;