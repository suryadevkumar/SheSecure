import React from 'react';
import logo from '../assets/logo.png';
import background from '../assets/stop violence.jpg';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100" style={{backgroundImage:`url(${background})`}}>
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={logo}
            alt="SheSecure Logo"
            className="h-8 w-8 mr-2"
          />
          <span className="font-semibold text-xl text-gray-800">SheSecure</span>
        </div>
        <div className="space-x-4">
          <a href="#" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md">Home</a>
          <a href="#" className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md">Login</a>
          <a href="#" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">Sign Up</a>
        </div>
      </nav>

      {/* Hero Section */}
      {/* <div className="flex flex-col items-center justify-center py-20 px-8">
        <div className="mb-8">
          <img
            src="https://images.unsplash.com/photo-1496070527953-98faef8b036f?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tYW4lMjBjb25maWRlbnR8ZW58MHx8MHx8fDA%3D"
            alt="Woman Confident"
            className="max-w-md rounded-lg shadow-md"
          />
        </div>
        <h1 className="text-4xl font-semibold text-gray-800 mb-4 text-center">
          Welcome to SheSecure
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Empowering women with safety and security.
        </p>
        <div className="flex space-x-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-md shadow-md">
            Learn More
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-md shadow-md">
            Get Started
          </button>
        </div>
        <div className="mt-8">
          <img
            src="https://images.unsplash.com/photo-1604663299044-ad56ba901647?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHdvbWFuJTIwY29uZmlkZW50fGVufDB8fDB8fHww"
            alt="safety symbol"
            className="max-w-sm rounded-lg shadow-md"
          />
        </div>
      </div> */}
      <div className='ml-[60%]'>
        <div className='text-9xl font-bold text-red-600 text-center mt-36 mb-10'>STOP</div>
        <div className='text-9xl font-bold text-blue-600 text-center my-10'>Violence</div>
        <div className='text-9xl font-bold text-red-600 text-center my-10'>Against</div>
        <div className='text-9xl font-bold text-blue-600 text-center my-10'>Woman</div>
      </div>
    </div>
  );
};

export default HomePage;