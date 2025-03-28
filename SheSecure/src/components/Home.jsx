import React from 'react';
import background from '../assets/stop violence.jpg';
import { Header1 } from './Header';
import { Footer } from './Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100" style={{backgroundImage:`url(${background})`}}>
      <Header1/>
      <div className='ml-[60%]'>
        <div className='text-9xl font-bold text-red-600 text-center mt-36 mb-10'>STOP</div>
        <div className='text-9xl font-bold text-blue-600 text-center my-10'>Violence</div>
        <div className='text-9xl font-bold text-red-600 text-center my-10'>Against</div>
        <div className='text-9xl font-bold text-blue-600 text-center my-10'>Woman</div>
      </div>
      <Footer/>
    </div>
  );
};

export default HomePage;