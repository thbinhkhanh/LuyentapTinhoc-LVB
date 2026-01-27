import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Button,
} from '@mui/material';
import {
  Monitor, Keyboard, Newspaper, Folder, ShieldCheck, ClipboardList,
  Search, Image, Film, FileText, Edit, Video, Code, Lightbulb, UserCheck, Globe, Brush
} from 'lucide-react';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Banner from '../pages/Banner';
import { ConfigContext } from '../context/ConfigContext';


// ================= ICON + COLOR THEO STT =================
const lessonUIByStt = {
  1: { icon: <Monitor size={32} color="#1976d2" />, color: 'primary' },
  2: { icon: <Keyboard size={32} color="#1976d2" />, color: 'success' },
  3: { icon: <Newspaper size={32} color="#1976d2" />, color: 'warning' },
  4: { icon: <Search size={32} color="#1976d2" />, color: 'primary' },
  5: { icon: <Folder size={32} color="#1976d2" />, color: 'success' },
  6: { icon: <ShieldCheck size={32} color="#1976d2" />, color: 'warning' },
  7: { icon: <FileText size={32} color="#1976d2" />, color: 'primary' },
  8: { icon: <Edit size={32} color="#1976d2" />, color: 'success' },
  9: { icon: <Brush size={32} color="#1976d2" />, color: 'primary' },
  10:{ icon: <Globe size={32} color="#1976d2" />, color: 'success' },
  11:{ icon: <Image size={32} color="#1976d2" />, color: 'primary' },
  12:{ icon: <Film size={32} color="#1976d2" />, color: 'success' },
  13:{ icon: <Video size={32} color="#1976d2" />, color: 'warning' },
  14:{ icon: <Keyboard size={32} color="#1976d2" />, color: 'primary' },
  15:{ icon: <Code size={32} color="#1976d2" />, color: 'success' },
  16:{ icon: <Lightbulb size={32} color="#1976d2" />, color: 'warning' },
  17:{ icon: <UserCheck size={32} color="#1976d2" />, color: 'primary' },
  18:{ icon: <Brush size={32} color="#1976d2" />, color: 'primary' },
  19:{ icon: <Globe size={32} color="#1976d2" />, color: 'success' },
};

// ================= CARD =================
const LessonCard = ({ title, icon, color, onClick }) => {
  const bgColors = {
    primary: '#E3F2FD',
    success: '#E8F5E9',
    warning: '#FFF8E1',
    error: '#FFEBEE',
  };

  return (
    <Card
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          bgcolor: bgColors[color] || '#eee',
          borderRadius: '50%',
          width: 80,
          height: 80,
          mx: 'auto',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>

      <Typography fontWeight="bold">
        {title.toUpperCase()}
      </Typography>

      <Button variant="contained" color={color} size="small" sx={{ mt: 2 }}>
        VÀO
      </Button>
    </Card>
  );
};

// ================= MAIN =================
export default function Lop4() {
  const navigate = useNavigate();
  const { config, setConfig } = useContext(ConfigContext);

  const [lessons, setLessons] = useState([]);

  // 1️⃣ Khởi tạo state hocKi từ localStorage hoặc context
  const [hocKi, setHocKi] = useState(
    parseInt(localStorage.getItem('hocKi')) || config.hocKi || 1
  );

  // 2️⃣ Khi context thay đổi, cập nhật lại tab
  useEffect(() => {
    setHocKi(parseInt(localStorage.getItem('hocKi')) || config.hocKi || 1);
  }, [config.hocKi]);

  // ===== LOAD FIRESTORE =====
  useEffect(() => {
    const fetchLessons = async () => {
      const snapshot = await getDocs(collection(db, 'TENBAI_Lop4'));

      const data = snapshot.docs
        .map(doc => ({
          title: doc.id,
          stt: doc.data().stt,
        }))
        .sort((a, b) => a.stt - b.stt);

      setLessons(data);
    };

    fetchLessons();
  }, []);

  // ===== LỌC THEO HỌC KÌ =====
  /*const lessonsByHocKi = lessons.filter(lesson =>
    hocKi === 1 ? lesson.stt <= 10 : lesson.stt > 10
  );*/
  const lessonsByHocKi = lessons.filter(lesson => {
    // 🟠 Bài theo tuần → luôn hiện ở học kì đang chọn
    if (lesson.title.startsWith("Tuần")) return true;

    // 🔵 Bài thường → chia theo stt
    return hocKi === 1 ? lesson.stt <= 10 : lesson.stt > 10;
  });

  // ===== CLICK CARD =====
  const handleSelect = (title) => {
    navigate(`/trac-nghiem?lop=4&bai=${encodeURIComponent(title)}`);
  };

  // ===== THAY ĐỔI HỌC KÌ =====
  const handleHocKiChange = (hk) => {
    setHocKi(hk); // cập nhật state local
    setConfig(prev => ({ ...prev, hocKi: hk })); // cập nhật context
    localStorage.setItem('hocKi', hk); // lưu vào localStorage
    //console.log("Học kì đã chọn:", hk);
  };

  return (
    <>
      <Banner title="TIN HỌC - LỚP 4" />

      <Box sx={{ p: 4, background: '#e3f2fd', minHeight: '100vh' }}>

        {/* ===== TAB HỌC KÌ ===== */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, gap: 2 }}>
          <Button
            variant={hocKi === 1 ? 'contained' : 'outlined'}
            onClick={() => handleHocKiChange(1)}
            sx={{ px: 4, fontWeight: 'bold' }}
          >
            HỌC KÌ I
          </Button>

          <Button
            variant={hocKi === 2 ? 'contained' : 'outlined'}
            onClick={() => handleHocKiChange(2)}
            sx={{ px: 4, fontWeight: 'bold' }}
          >
            HỌC KÌ II
          </Button>
        </Box>

        <Box textAlign="center" mb={3}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}
          >
            DANH SÁCH BÀI HỌC
          </Typography>

          <Box
            sx={{
              width: '60px',
              height: '4px',
              backgroundColor: '#1976d2',
              margin: '0 auto',
              borderRadius: '2px',
            }}
          />
        </Box>

        {/* ===== DANH SÁCH BÀI ===== */}
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          }}
        >
          {/*{lessonsByHocKi.map((lesson) => {
            const ui = lessonUIByStt[lesson.stt] || {};

            return (
              <LessonCard
                key={lesson.stt}
                title={lesson.title}
                icon={ui.icon}
                color={ui.color || 'primary'}
                onClick={() => handleSelect(lesson.title)}
              />
            );
          })}*/}
          {lessonsByHocKi.map((lesson) => {
            const isWeekLesson = lesson.title.startsWith("Tuần");

            const ui = isWeekLesson
              ? {
                  icon: <FileText size={32} color="#f57c00" />, // 🟠 icon cam
                  color: 'warning',
                }
              : lessonUIByStt[lesson.stt] || {};

            return (
              <LessonCard
                key={lesson.title}
                title={lesson.title}
                icon={ui.icon}
                color={ui.color || 'primary'}
                onClick={() => handleSelect(lesson.title)}
              />
            );
          })}

        </Box>
      </Box>
    </>
  );
}
