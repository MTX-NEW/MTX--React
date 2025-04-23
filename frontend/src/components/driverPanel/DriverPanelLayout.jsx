import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Offcanvas } from 'react-bootstrap';
import { 
  Typography, 
  Button,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/assets/TripManagement.css';
import '@/assets/css/DriverPanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faCalendarDay, 
  faCalendarWeek,
  faUser,
  faClock,
  faSignOutAlt,
  faCog,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import useAuth from '@/hooks/useAuth';

const DriverPanelLayout = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const currentUserId = user?.id;
  
  const handleOffcanvasToggle = () => {
    setShowOffcanvas(!showOffcanvas);
  };

  const navigateTo = (path) => {
    navigate(path);
    setShowOffcanvas(false);
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  const drawerItems = [
    { text: 'My Trips', icon: <DirectionsCarIcon />, path: '/driver-panel/trips' },
    { text: 'Time Off Requests', icon: <FontAwesomeIcon icon={faCalendarAlt} />, path: '/driver-panel/time-off' },
  ];

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="driver-panel-layout">
      <Navbar bg="primary" variant="dark" expand={false} className="shadow-sm">
        <Container fluid className="px-2">
          <div className="d-flex align-items-center">
            <IconButton
              color="inherit"
              aria-label="open menu"
              edge="start"
              onClick={handleOffcanvasToggle}
              className="me-2 text-white"
              size="small"
            >
              <MenuIcon />
            </IconButton>
            
            <Navbar.Brand className="fw-bold fs-6">
              <span className="d-none d-sm-inline">MedTransExpress</span> Driver
            </Navbar.Brand>
          </div>
          
          <Button 
            color="inherit" 
            onClick={handleBackToMain} 
           
            size="small"
            className="text-white"
          >
            <span className="d-none d-sm-inline">Main App</span>
            <ArrowBackIcon className="d-sm-none" />
          </Button>
        </Container>
      </Navbar>
      
      <Offcanvas 
        show={showOffcanvas} 
        onHide={handleOffcanvasToggle}
        placement="start"
        backdrop={true}
        className="driver-panel-sidebar"
      >
        <Offcanvas.Header closeButton className="bg-primary text-white py-2">
          <div className="d-flex align-items-center">
            <Avatar className="me-2 bg-white text-primary" sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
              D
            </Avatar>
            <div>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className="text-white mb-0">
                Driver
              </Typography>
              <Typography variant="caption" className="text-white-50">
                ID: {currentUserId}
              </Typography>
            </div>
          </div>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="p-0">
          <List component="nav" className="py-0">
            {drawerItems.map((item) => (
              <ListItemButton 
                key={item.text} 
                onClick={() => navigateTo(item.path)}
                sx={{
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  py: 1.5
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Offcanvas.Body>
      </Offcanvas>
      
      <Container className="flex-grow-1 py-2 px-2 px-sm-3" fluid>
        <Outlet />
      </Container>
      
      <footer className="bg-light py-2 mt-auto border-top">
        <Container fluid className="px-3">
          <Typography variant="caption" color="text.secondary" align="center" className="d-block">
            © {new Date().getFullYear()} MedTransExpress
          </Typography>
        </Container>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <nav className="mobile-bottom-nav shadow">
        <div className="mobile-bottom-nav__item">
          <Link to="/driver-panel" className={`mobile-bottom-nav__item-content ${isActive('/driver-panel') && !isActive('/trips') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </Link>
        </div>
       {/* 
        <div className="mobile-bottom-nav__item">
          <Link to="/driver-panel/trips" className={`mobile-bottom-nav__item-content ${isActive('/trips') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faCalendarWeek} />
            <span>Trips</span>
          </Link>
        </div>
        */}
        <div className="mobile-bottom-nav__item">
          <Link to="/driver-panel/time-off" className={`mobile-bottom-nav__item-content ${isActive('/time-off') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Time Off</span>
          </Link>
        </div>
        
        <div className="mobile-bottom-nav__item">
          <Link to="/driver-panel/settings" className={`mobile-bottom-nav__item-content ${isActive('/settings') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faCog} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <style jsx="true">{`
        /* Mobile optimizations */
        @media (max-width: 576px) {
          :global(.navbar-brand) {
            font-size: 1rem !important;
          }
          
          :global(.btn-sm) {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }
          
          :global(.container-fluid) {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }
        
        .driver-panel-layout {
          min-height: 100vh;
          padding-bottom: 60px;
          position: relative;
        }
        
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background-color: white;
          display: flex;
          justify-content: space-around;
          height: 60px;
          box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .mobile-bottom-nav__item {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .mobile-bottom-nav__item-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #6c757d;
          font-size: 0.75rem;
          text-decoration: none;
          padding: 0.25rem;
          width: 100%;
          height: 100%;
        }
        
        .mobile-bottom-nav__item-content svg {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
        }
        
        .mobile-bottom-nav__item-content.active {
          color: var(--bs-primary);
          font-weight: 500;
        }
        
        /* Hide on larger screens */
        @media (min-width: 992px) {
          .mobile-bottom-nav {
            display: none;
          }
          
          .driver-panel-layout {
            padding-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DriverPanelLayout; 