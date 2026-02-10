import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem, Snackbar, Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import DeleteConfirmDialog from "../dialog/DeleteConfirmDialog";

const OpenExamDialog = ({ open, onClose }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedClass, setSelectedClass] = useState("Lớp 5");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // ===== LOAD DANH SÁCH ĐỀ TUẦN =====
  useEffect(() => {
  if (!open || selectedClass === "Tất cả") {
    setDocs([]);
    setSelectedDoc(null);
    return;
  }

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const colName = `TRACNGHIEM${selectedClass.replace("Lớp ", "")}`;
      const snapshot = await getDocs(collection(db, colName));

      const data = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        // ✅ sắp xếp theo số xuất hiện trong tên (Bài / Tuần đều OK)
        .sort((a, b) => {
          const nA = parseInt(a.id.match(/\d+/)?.[0] || 0);
          const nB = parseInt(b.id.match(/\d+/)?.[0] || 0);
          return nA - nB;
        });

      setDocs(data);
      setSelectedDoc(null);
    } catch (err) {
      console.error("❌ Lỗi load danh sách đề:", err);
      setDocs([]);
      setSelectedDoc(null);
    } finally {
      setLoading(false);
    }
  };

  fetchDocs();
}, [open, selectedClass]);


  // ===== CHỌN XÓA =====
  const handleDeleteSelected = (docId) => {
    if (!docId) {
      alert("⚠️ Vui lòng chọn đề cần xóa!");
      return;
    }

    setDocToDelete(docId);
    setOpenDeleteDialog(true);
  };

  // ===== XÁC NHẬN XÓA =====
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;

    const lopParam = selectedClass.replace("Lớp ", "");
    const docId = docToDelete;

    // ✅ 1. XÓA NGAY TRÊN GIAO DIỆN
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    setSelectedDoc(null);

    setOpenDeleteDialog(false);
    setDocToDelete(null);

    // ✅ 2. HIỆN SNACKBAR THÀNH CÔNG
    setSnackbarOpen(true);

    // ✅ 3. XÓA FIRESTORE (NỀN)
    try {
      const tracNghiemRef = doc(db, `TRACNGHIEM${lopParam}`, docId);
      const tenBaiRef = doc(db, `TENBAI_Lop${lopParam}`, docId);

      await Promise.all([
        deleteDoc(tracNghiemRef),
        deleteDoc(tenBaiRef),
      ]);
    } catch (err) {
      console.error("❌ Lỗi khi xóa Firestore:", err);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* ===== HEADER ===== */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#1976d2", // nền xanh
            color: "#fff",         // chữ trắng
            px: 2,
            py: 1,                 // giảm chiều cao
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            🗑️ Xóa đề trắc nghiệm
          </Typography>

          <IconButton onClick={onClose} sx={{ color: "#fff", p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ===== CHỌN LỚP ===== */}
        <Box sx={{ px: 2, py: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Lớp</InputLabel>
            <Select
              value={selectedClass}
              label="Lớp"
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <MenuItem value="Tất cả">Tất cả</MenuItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={`Lớp ${n}`}>
                  Lớp {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* ===== DANH SÁCH ĐỀ ===== */}
        <DialogContent dividers sx={{ height: 340, px: 2, py: 2 }}>
          <Box
            sx={{
              height: "100%",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: 2,
            }}
          >
            {loading ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : docs.length === 0 ? (
              <Typography align="center" sx={{ p: 2, color: "gray" }}>
                Không có đề nào.
              </Typography>
            ) : (
              docs.map((docItem) => (
                <Stack
                  key={docItem.id}
                  direction="row"
                  alignItems="center"
                  sx={{
                    px: 1.5,
                    py: 0.8,
                    cursor: "pointer",
                    borderRadius: 1,
                    backgroundColor:
                      selectedDoc === docItem.id ? "#FFEBEE" : "transparent",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                  onClick={() => setSelectedDoc(docItem.id)}
                  onDoubleClick={() => handleDeleteSelected(docItem.id)}
                >
                  <Typography>{docItem.id}</Typography>
                </Stack>
              ))
            )}
          </Box>
        </DialogContent>

        {/* ===== ACTION ===== */}
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            color="error"
            disabled={!selectedDoc}
            onClick={() => handleDeleteSelected(selectedDoc)}
          >
            Xóa đề đã chọn
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DIALOG XÁC NHẬN XÓA ===== */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setDocToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          ✅ Đã xóa đề thành công
        </Alert>
      </Snackbar>
    </>
  );
};

export default OpenExamDialog;
