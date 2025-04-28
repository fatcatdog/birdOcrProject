// src/components/Header.js
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/Header.css';

const Header = () => {

  const navigate = useNavigate();
  const [token, setToken] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
      const checkIfTokenExists = async () => {

        let tok = localStorage.getItem('token')

        if (typeof tok !== 'undefined' && tok !== null){
            setToken(true)
        }

      };
      checkIfTokenExists();
    }, []);

  return (
    <header>
      <nav>
        <ul>
          <li>
            <NavLink to="/gallery" >
                Gallery
            </NavLink>
          </li>
          <li>
            <NavLink to="/upload">
              Upload
            </NavLink>
          </li>
          {token && <li>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </li>}
          
          {/* Add more NavLinks for other routes as needed */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;