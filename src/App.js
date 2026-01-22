import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

// Các trang
import Home from './pages/Home';
import Info from './pages/Info';

import Lop1 from './pages/Lop1';
import Lop2 from './pages/Lop2';
import Lop3 from './pages/Lop3';
import Lop4 from './pages/Lop4';
import Lop5 from './pages/Lop5';

import Lop1New from './pages/Lop1New';
import Lop2New from './pages/Lop2New';
import Lop3New from './pages/Lop3New';
import Lop4New from './pages/Lop4New';
import Lop5New from './pages/Lop5New';


import About from './pages/About';
import Footer from './pages/Footer';
import HuongDan from './pages/HuongDan';
import TracNghiem from './pages/TracNghiem';
import TracNghiemTest from './pages/TracNghiemTest';
import TracNghiemGV from './pages/TracNghiemGV';
import ScormViewer from './pages/ScormViewer';
import Login from './pages/Login';
import QuanTri from './pages/QuanTri';
import TongHopKQ from './pages/TongHopKQ';
import SystemLockedDialog from './dialog/SystemLockedDialog';
import { QuizProvider } from "./context/QuizContext";
import { StudentQuizProvider } from "./context/StudentQuizContext";
import { TeacherQuizProvider } from "./context/TeacherQuizContext";

// Context
import { ConfigProvider, ConfigContext } from './context/ConfigContext';

// Firebase
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

function App() {
  return (
    <TeacherQuizProvider>
      <StudentQuizProvider>
        <QuizProvider>
          <ConfigProvider>
            <Router>
              <Navigation />
              <div style={{ paddingTop: 0 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/info" element={<Info />} />

                  <Route path="/lop1" element={<Lop1 />} />
                  <Route path="/lop2" element={<Lop2 />} />
                  <Route path="/lop3" element={<Lop3 />} />
                  <Route path="/lop4" element={<Lop4 />} />
                  <Route path="/lop5" element={<Lop5 />} />

                  <Route path="/lop1-new" element={<Lop1New />} />
                  <Route path="/lop2-new" element={<Lop2New />} />
                  <Route path="/lop3-new" element={<Lop3New />} />
                  <Route path="/lop4-new" element={<Lop4New />} />
                  <Route path="/lop5-new" element={<Lop5New />} />

                  <Route path="/trac-nghiem" element={<TracNghiem />} />
                  <Route path="/test-de" element={<TracNghiemTest />} />
                  <Route path="/soan-de" element={<TracNghiemGV />} />
                  <Route path="/scorm-viewer" element={<ScormViewer />} />
                  <Route path="/gioithieu" element={<About />} />
                  <Route path="/huongdan" element={<HuongDan />} />
                  <Route path="/chucnang" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/quan-tri" element={<QuanTri />} />
                  <Route path="/tong-hop-kq" element={<TongHopKQ />} />
                </Routes>
                <Footer />
              </div>
            </Router>
          </ConfigProvider>
        </QuizProvider>
      </StudentQuizProvider>
    </TeacherQuizProvider>
  );
}

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useContext(ConfigContext);

  // ===== STATE (LOCAL ONLY – KHÔNG ĐỒNG BỘ NGUY HIỂM) =====
  const [loginState, setLoginState] = useState(
    localStorage.getItem("loggedIn") === "true"
  );
  const [lockedDialogOpen, setLockedDialogOpen] = useState(false);

  // ===== PAGE CHECK =====
  const isInfoPage = location.pathname === "/info";
  const isExamPage =
    location.pathname === "/trac-nghiem" ||
    location.pathname === "/test-de" ||
    location.pathname === "/scorm-viewer";

  // ===== DISABLE LOGIC =====
  // ❗ Chưa login → disable menu cơ bản
  const disableBaseMenu = !loginState;
  
  // ❗ Đang Info / đang Thi mà CHƯA login → disable
  const disableMenu = (isInfoPage || isExamPage) && !loginState;

  // ===== SYNC LOGIN TRONG 1 MÁY =====
  useEffect(() => {
    const syncLogin = () => {
      setLoginState(localStorage.getItem("loggedIn") === "true");
    };

    window.addEventListener("storage", syncLogin);
    return () => window.removeEventListener("storage", syncLogin);
  }, []);

  const selectedYear = config.namHoc || "2025-2026";

  // ===== MENU CONFIG =====
  const baseItems = [
    { path: "/", name: "Trang chủ" },
    { path: "/lop1", name: "Lớp 1", khoi: "Khối 1" },
    { path: "/lop2", name: "Lớp 2", khoi: "Khối 2" },
    { path: "/lop3", name: "Lớp 3", khoi: "Khối 3" },
    { path: "/lop4", name: "Lớp 4", khoi: "Khối 4" },
    { path: "/lop5", name: "Lớp 5", khoi: "Khối 5" },
  ];

  const authItems = loginState
    ? [
        { path: "/tong-hop-kq", name: "Tổng hợp" },
        { path: "/soan-de", name: "Soạn đề" },
        { path: "/test-de", name: "Test đề" },
        { path: "/quan-tri", name: "Hệ thống" },
        {
          path: "/logout",
          name: "Đăng xuất",
          action: async () => {
            // Cập nhật Firestore
            await setDoc(
              doc(db, "CONFIG", "config"),
              { login: false },
              { merge: true }
            );

            // Xóa trạng thái login trong localStorage
            localStorage.setItem("loggedIn", "false");

            // Cập nhật state ngay lập tức
            setLoginState(false);

            // Điều hướng về trang chủ
            navigate("/");
          },
        }

      ]
    : [{ path: "/login", name: "Đăng nhập" }];

  const navItems = [...baseItems, ...authItems];

  // ===== CLICK =====
  const handleMenuClick = (item) => {
    if ((disableMenu || disableBaseMenu) && item.path !== "/login") return;

    if (item.action) {
      item.action();
      return;
    }

    if (item.khoi) {
      if (config.locked) {
        setLockedDialogOpen(true);
        return;
      }

      const soKhoi = item.khoi.replace("Khối ", "");
      const newRouteMap = {
        "Khối 1": "/lop1-new",
        "Khối 2": "/lop2-new",
        "Khối 3": "/lop3-new",
        "Khối 4": "/lop4-new",
        "Khối 5": "/lop5-new",
      };

      const targetOld = `/lop${soKhoi}`;
      const targetNew = newRouteMap[item.khoi];

      if (config.dangNhapTungBai) {
        navigate(config.heThong === "new" ? targetNew : targetOld);
      } else {
        navigate("/info", {
          state: {
            khoi: item.khoi,
            heThong: config.heThong,
            target: config.heThong === "new" ? targetNew : targetOld,
          },
        });
      }
      return;
    }

    navigate(item.path);
  };

  // ===== RENDER =====
  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          padding: "0 12px",
          background: "#1976d2",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            whiteSpace: "nowrap",
            overflowX: "auto",          // ⭐ cho phép cuộn ngang
            WebkitOverflowScrolling: "touch", // ⭐ mượt trên iOS
            maxWidth: "100vw",          // ⭐ không tràn viewport
          }}
        >
          <img src="/Logo.png" alt="Logo" style={{ height: 32 }} />

          {navItems.map((item, index) => {
            const isBaseItem = baseItems.some((b) => b.path === item.path);
            const isLoginItem = item.path === "/login";

            const isDisabled =
              (disableMenu && !isLoginItem) ||
              (disableBaseMenu && isBaseItem);

            return (
              <Box
                key={index}
                onClick={() => !isDisabled && handleMenuClick(item)}
                sx={{
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.4 : 1,
                  color: "white",
                  padding: "4px 10px",
                }}
              >
                {item.name}
              </Box>
            );
          })}
        </div>

        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
          <Typography fontWeight="bold">Năm học:</Typography>
          <Box
            sx={{
              background: "white",
              color: "#1976d2",
              px: 1.5,
              borderRadius: 1,
              fontWeight: "bold",
            }}
          >
            {selectedYear}
          </Box>
        </Box>
      </nav>

      <SystemLockedDialog
        open={lockedDialogOpen}
        onClose={() => setLockedDialogOpen(false)}
      />
    </>
  );
}


export default App;
