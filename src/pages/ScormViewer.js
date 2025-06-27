import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Box } from '@mui/material';

export default function ScormViewer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy link bài học từ query param: ?link=...
  const query = new URLSearchParams(location.search);
  const link = query.get('link');

  if (!link) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <h2>Không có bài học để hiển thị</h2>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Button variant="contained" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </Box>
      <iframe
        src={link}
        title="Bài học SCORM"
        style={{ flexGrow: 1, border: 'none' }}
        allowFullScreen
      />
    </Box>
  );
}
