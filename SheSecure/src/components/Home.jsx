import React from 'react';
import background from '../assets/stop violence.jpg';

const HomePage = () => {
  return (
    <div className="h-[calc(100vh-5rem)] bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${background})`}}>
      <div className='ml-[60%]'>
        <div className='text-8xl font-bold text-red-600 text-center pt-20 mb-10'>STOP</div>
        <div className='text-8xl font-bold text-blue-600 text-center my-10'>Violence</div>
        <div className='text-8xl font-bold text-red-600 text-center my-10'>Against</div>
        <div className='text-8xl font-bold text-blue-600 text-center my-10'>Woman</div>
      </div>
    </div>
  );
};

export default HomePage;