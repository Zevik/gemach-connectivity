import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediately redirect to the main Index page
    navigate('/', { replace: true });
  }, [navigate]);

  // This component doesn't render anything, it just redirects
  return null;
};

export default Home; 