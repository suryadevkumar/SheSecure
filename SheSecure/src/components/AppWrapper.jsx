import { ToastContainer } from 'react-toastify';
import useLocationTracking from '../utils/useLocation.js';
import Header from './Header.jsx';
import Footer from './Footer';
import Front from './Front.jsx';
import { useSelector } from 'react-redux';

function AppWrapper() {
  const userType = useSelector((state) => state.auth.user?.userType);
  const token = useSelector((state) => state.auth.token);
  
    if (userType === 'User' && token) {
      useLocationTracking();
    }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000}/>
      <Header />
      <Front />
      <Footer />
    </>
  );
}

export default AppWrapper;
