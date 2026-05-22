import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const ACCOUNTS = ["Admin", "LVB"];

export default function Login() {
  const [username, setUsername] = useState(ACCOUNTS[0]);
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const docRef = doc(db, "MATKHAU", username);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setSnackbar({
          open: true,
          message: "❌ Không tìm thấy thông tin Admin!",
          severity: "error",
        });
        return;
      }

      const storedPassword = docSnap.data().pass;

      if (password === String(storedPassword)) {
        // ✅ Lưu trạng thái localStorage ngay
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("account", username);

        window.dispatchEvent(new Event("storage"));

        // ✅ Điều hướng ngay lập tức
        navigate("/soan-de");

        // ✅ Ghi login: true lên Firestore **bất đồng bộ**, không await
        const configRef = doc(db, "CONFIG", "config");
        setDoc(configRef, { login: true }, { merge: true }).catch((err) => {
          console.error("❌ Lỗi cập nhật login trên Firestore:", err);
        });

        // ✅ Hiển thị snackbar
        setSnackbar({
          open: true,
          message: "✅ Đăng nhập thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "❌ Sai mật khẩu!",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      setSnackbar({
        open: true,
        message: "❌ Lỗi khi đăng nhập!",
        severity: "error",
      });
    }
  };


  const handleClose = () => {
    navigate("/"); // quay về trang Home nếu đóng
  };

  return (
    <Box sx={{ minHeight: "100vh", pt: 10, px: 3, backgroundColor: "#e3f2fd", display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: { xs: "95%", sm: 400 }, mx: "auto", position: "relative" }}>
        <Card elevation={10} sx={{ p: 3, borderRadius: 4 }}>
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8, color: "red" }}
          >
            <CloseIcon />
          </IconButton>

          <Stack spacing={3} alignItems="center">
            <div style={{ fontSize: 50 }}>🔐</div>
            <Typography variant="h5" fontWeight="bold" color="primary" textAlign="center">
              ĐĂNG NHẬP
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Tài khoản</InputLabel>
              <Select
                value={username}
                label="Tài khoản"
                onChange={(e) => setUsername(e.target.value)}
              >
                {ACCOUNTS.map((acc) => (
                  <MenuItem key={acc} value={acc}>
                    {acc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              fullWidth
              sx={{ fontWeight: "bold", textTransform: "none", fontSize: "1rem" }}
            >
              🔐 Đăng nhập
            </Button>
          </Stack>
        </Card>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
