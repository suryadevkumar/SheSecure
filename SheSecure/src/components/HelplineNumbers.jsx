import { 
    Phone, 
    Ambulance, 
    Baby, 
    Flame, 
    Shield, 
    HeartHandshake,
    Train,
    Car,
    Users
  } from 'lucide-react';
  
  const EmergencyNumbers = () => {
    const handleCall = (number) => {
      window.open(`tel:${number}`);
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 lg:mb-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full md:max-w-xl transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center">National Numbers</h1>
            <p className="text-blue-100 text-center mt-2">
              In case of an emergency, call an appropriate number for help.
            </p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {/* Police */}
            <div className="p-5 hover:bg-blue-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full group-hover:animate-pulse">
                  <Shield className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">100</p>
                  <p className="text-gray-500">Police</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('100')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call Police"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
            
            {/* Fire Service */}
            <div className="p-5 hover:bg-red-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full group-hover:animate-bounce">
                  <Flame className="text-red-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">101</p>
                  <p className="text-gray-500">Fire Service</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('101')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call Fire Service"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
            
            {/* Ambulance */}
            <div className="p-5 hover:bg-green-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full group-hover:animate-pulse">
                  <Ambulance className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">102</p>
                  <p className="text-gray-500">Pregnancy Medic</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('102')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call Pregnancy Medic"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
            
            {/* Pregnancy Medic */}
            <div className="p-5 hover:bg-pink-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 p-3 rounded-full group-hover:animate-ping">
                  <Baby className="text-pink-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">108</p>
                  <p className="text-gray-500">Ambulance</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('108')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call Ambulance"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
            
            {/* National Helpline */}
            <div className="p-5 hover:bg-purple-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full group-hover:rotate-6 transition-transform">
                  <Phone className="text-purple-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">112</p>
                  <p className="text-gray-500">National helpline</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('112')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call National Helpline"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
            
            {/* Women Helpline */}
            <div className="p-5 hover:bg-yellow-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <HeartHandshake className="text-yellow-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">1091</p>
                  <p className="text-gray-500">Women helpline</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('1091')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call Women Helpline"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
  
            {/* Child Helpline */}
            <div className="p-5 hover:bg-orange-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-full group-hover:animate-pulse">
                  <Users className="text-orange-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">1098</p>
                  <p className="text-gray-500">Child Helpline</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('1098')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call Child Helpline"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
  
            {/* Road Accident */}
            <div className="p-5 hover:bg-red-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full group-hover:animate-bounce">
                  <Car className="text-red-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">1073</p>
                  <p className="text-gray-500">Road accident</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('1073')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call Road Accident Helpline"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
  
            {/* Railway Protection */}
            <div className="p-5 hover:bg-blue-50 transition-colors duration-200 group flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full group-hover:animate-pulse">
                  <Train className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">182</p>
                  <p className="text-gray-500">Railway protection</p>
                </div>
              </div>
              <button 
                onClick={() => handleCall('182')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                aria-label="Call Railway Protection"
              >
                <Phone className="text-green-600 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default EmergencyNumbers;