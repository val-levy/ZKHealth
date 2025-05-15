import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldIcon, LockIcon, FilesIcon, UsersIcon } from 'lucide-react';
import Button from '../components/Button';
const Home = () => {
  return <div className="w-full">
      {/* Hero Section */}
      <section
        className="relative py-16"
        style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      >
        <div className="absolute inset-0 bg-blue-600 opacity-80"></div>
        <div className="relative container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Secure Medical Data Sharing
              </h1>
              <p className="text-xl mb-6 text-white">
                ZKHealth connects patients with healthcare providers through
                secure, private, and efficient data sharing.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/create-account">
                  <Button variant="outline" size="lg">
                    Create Account
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://media.gettyimages.com/id/941762276/photo/doctors-walking-in-clinic.jpg?s=612x612&w=0&k=20&c=OwsH-lT88akwiPOYm1kTVs6c7mXHBUDgUbnQuCssyyg="
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How ZKHealth Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockIcon size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Sharing</h3>
              <p className="text-gray-600">
                Your medical data is encrypted and only accessible to authorized
                healthcare providers you approve.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FilesIcon size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Upload</h3>
              <p className="text-gray-600">
                Upload medical records, test results, and other health documents
                in seconds.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Provider Network</h3>
              <p className="text-gray-600">
                Connect with healthcare providers who can access your
                information with your permission.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">
                Your Privacy Is Our Priority
              </h2>
              <p className="text-gray-600 mb-6">
                ZKHealth uses advanced encryption and zero-knowledge proof
                technology to ensure your medical data remains private while
                still being accessible to the healthcare providers you choose.
              </p>
              <div className="flex items-center mb-4">
                <ShieldIcon className="text-blue-600 mr-2" />
                <span className="font-semibold">HIPAA Compliant</span>
              </div>
              <div className="flex items-center mb-4">
                <LockIcon className="text-blue-600 mr-2" />
                <span className="font-semibold">End-to-End Encryption</span>
              </div>
              <div className="flex items-center">
                <UsersIcon className="text-blue-600 mr-2" />
                <span className="font-semibold">Patient-Controlled Access</span>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Medical data security" className="rounded-lg shadow-lg max-w-full h-auto" />
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers who are already
            using ZKHealth for secure medical data sharing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/create-account">
              <Button variant="outline" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>;
};
export default Home;