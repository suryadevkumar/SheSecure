import { useEffect, useState } from 'react';
import useLocationTracking from '../utils/Location.js';
import Header from './Header.jsx'
import Footer from './Footer';
import Front from './Front.jsx';
import Toaster from './Toaster.jsx';
import { useSelector } from 'react-redux';

function AppWrapper() {
    const [toasterVisible, setToasterVisible] = useState(false);
    const [toasterMessage, setToasterMessage] = useState('');
    const [toasterType, setToasterType] = useState('success');
    const policeStations = useSelector((state) => state.police.policeStations);
  
    // Helper function to display error toaster
    const setErrorToasterMessage = (message) => {
      setToasterMessage(message);
      setToasterType('error');
      setToasterVisible(true);
    };
  
    // Close the toaster automatically after 3 seconds
    useEffect(() => {
      if (toasterVisible) {
        const timer = setTimeout(() => {
          setToasterVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [toasterVisible]);
  
    useLocationTracking();
  
    // if (policeStations.length==0) {
    //   return <div className="loading-screen">Getting your location...</div>;
    // }
  
    return (
      <>
        <Header />
        {toasterVisible && (
          <Toaster 
            message={toasterMessage} 
            type={toasterType} 
            onClose={() => setToasterVisible(false)} 
          />
        )}
        <Front setErrorToasterMessage={setErrorToasterMessage}/>
        <Footer />
      </>
    );
}

export default AppWrapper;