import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import {
  Box,
  Typography,
  Modal,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import Home from './pages/Home';
import Lop1 from './pages/Lop1';
import Lop2 from './pages/Lop2';
import Lop3 from './pages/Lop3';
import Lop4 from './pages/Lop4';
import Lop5 from './pages/Lop5';
import About from './pages/About';
import Footer from './pages/Footer';
import HuongDan from './pages/HuongDan';
import ScormViewer from './pages/ScormViewer';

function App() {
  return (
    <Router>
      <Navigation />
      <div style={{ paddingTop: 0 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lop1" element={<Lop1 />} />
          <Route path="/lop2" element={<Lop2 />} />
          <Route path="/lop3" element={<Lop3 />} />
          <Route path="/lop4" element={<Lop4 />} />
          <Route path="/lop5" element={<Lop5 />} />
          <Route path="/scorm-viewer" element={<ScormViewer />} />
          <Route path="/gioithieu" element={<About />} />
          <Route path="/huongdan" element={<HuongDan />} />
          <Route path="/chucnang" element={<About />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function Navigation() {
  const location = useLocation();
  const [selectedYear] = useState('2025-2026');
  const [openLogo, setOpenLogo] = useState(false); // ✅ Trạng thái mở popup logo

  const navItems = [
    { path: '/', name: <HomeIcon /> }, // 🔹 Icon thay cho chữ "Trang chủ"
    { path: '/lop1', name: 'Lớp 1' },
    { path: '/lop2', name: 'Lớp 2' },
    { path: '/lop3', name: 'Lớp 3' },
    { path: '/lop4', name: 'Lớp 4' },
    { path: '/lop5', name: 'Lớp 5' },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '12px',
          background: '#1976d2',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            paddingRight: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          {/* ✅ Logo có thể click để mở popup */}
          <img
            src="/Logo.png"
            alt="Logo"
            style={{
              height: '40px',
              marginRight: '16px',
              flexShrink: 0,
              cursor: 'pointer'
            }}
            onClick={() => setOpenLogo(true)}
          />

          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '8px 12px',
                backgroundColor:
                  location.pathname === item.path ? '#1565c0' : 'transparent',
                borderBottom:
                  location.pathname === item.path ? '3px solid white' : 'none',
                borderRadius: '4px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <Box
          sx={{
            display: {
              xs: 'none',
              sm: 'flex',
            },
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
            Năm học:
          </Typography>
          <Box
            sx={{
              backgroundColor: 'white',
              minWidth: 100,
              maxWidth: 100,
              borderRadius: 1,
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #c4c4c4',
            }}
          >
            <Typography
              sx={{
                color: '#1976d2',
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center',
                padding: '6px 8px',
                width: '100%',
              }}
            >
              {selectedYear}
            </Typography>
          </Box>
        </Box>
      </nav>

      {/* ✅ Modal phóng to logo */}
      <Modal
        open={openLogo}
        onClose={() => setOpenLogo(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}
      >
        <Box
          sx={{
            outline: 'none',
            bgcolor: 'transparent',
          }}
        >
          <img
            src="/Logo.png"
            alt="Logo lớn"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          />
        </Box>
      </Modal>
    </>
  );
}

export default App;
