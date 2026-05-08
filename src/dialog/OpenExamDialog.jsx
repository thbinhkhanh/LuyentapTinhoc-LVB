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
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import DeleteConfirmDialog from "../dialog/DeleteConfirmDialog";

const OpenExamDialog = ({ open, onClose, onSelectExam }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedClass, setSelectedClass] = useState("Lớp 3");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [namHoc, setNamHoc] = useState("");

  const navigate = useNavigate();

  // ===== LOAD NĂM HỌC =====
  useEffect(() => {
    const loadNamHoc = async () => {
      try {
        const snap = await getDoc(doc(db, "CONFIG", "config"));
        if (snap.exists()) {
          setNamHoc(snap.data().namHoc);
        }
      } catch (err) {
        console.error("❌ Lỗi load năm học:", err);
      }
    };
    loadNamHoc();
  }, []);

  // ===== HELPER COLLECTION =====
  const getTracNghiemCollection = (lop) => {
    const num = lop.match(/\d+/)?.[0];
    if (!num || !namHoc) return null;

    const isOldYear = namHoc === "2025-2026";

    return isOldYear
      ? `TRACNGHIEM${num}`
      : `TRACNGHIEM${num}_New`;
  };

  // ===== LOAD DANH SÁCH =====
  useEffect(() => {
    if (!open) {
      setDocs([]);
      setSelectedDoc(null);
      return;
    }

    const fetchDocs = async () => {
      setLoading(true);
      try {
        const colName = getTracNghiemCollection(selectedClass);
        if (!colName) return;

        const snapshot = await getDocs(collection(db, colName));

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setDocs(data);
        setSelectedDoc(null);
      } catch (err) {
        console.error("❌ Lỗi load danh sách:", err);
        setDocs([]);
        setSelectedDoc(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [open, selectedClass, namHoc]);

  // ===== MỞ ĐỀ =====
  const handleOpenSelected = (docId) => {
    if (!docId) {
      alert("⚠️ Vui lòng chọn đề trước khi mở!");
      return;
    }

    const lopParam = selectedClass.replace("Lớp ", "");

    if (onSelectExam) {
      onSelectExam(lopParam, docId);
      onClose();
    } else {
      navigate(`/trac-nghiem_test?lop=${lopParam}&bai=${docId}`);
      onClose();
    }
  };

  // ===== CLICK XÓA =====
  const handleDeleteClick = () => {
    if (!selectedDoc) {
      alert("⚠️ Vui lòng chọn đề cần xóa!");
      return;
    }
    setOpenDeleteDialog(true);
  };

  // ===== XÁC NHẬN XÓA =====
  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    const deletedId = selectedDoc;

    try {
      const collectionName = getTracNghiemCollection(selectedClass);
      if (!collectionName) throw new Error("Thiếu collection");

      // 🔥 XÓA TRẮC NGHIỆM
      await deleteDoc(doc(db, collectionName, deletedId));

      // 🔥 XÓA TENBAI
      const lopNumber = selectedClass.replace("Lớp ", "");
      const isOldYear = namHoc === "2025-2026";

      const tenBaiCollection = isOldYear
        ? `TENBAI_Lop${lopNumber}`
        : `TENBAI_Lop${lopNumber}_New`;

      await deleteDoc(doc(db, tenBaiCollection, deletedId));

      // 🔥 UPDATE UI
      setDocs(prev => prev.filter(item => item.id !== deletedId));
      setSelectedDoc(null);

      setOpenDeleteDialog(false);
      setSnackbarOpen(true);

    } catch (error) {
      console.error("❌ Lỗi khi xóa:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #1976d2, #42a5f5)",
            color: "#fff",
            px: 2,
            py: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            📂 Danh sách đề
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* CHỌN LỚP */}
        <Box sx={{ px: 2, py: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Lớp</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Lớp"
            >
              {[3, 4, 5].map((n) => (
                <MenuItem key={n} value={`Lớp ${n}`}>
                  Lớp {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* DANH SÁCH */}
        <DialogContent dividers sx={{ height: 340 }}>
          <Box
            sx={{
              height: "100%",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: 2,
            }}
          >
            {loading ? (
              <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                  sx={{
                    px: 1.5,
                    py: 0.8,
                    cursor: "pointer",
                    borderRadius: 1,
                    backgroundColor:
                      selectedDoc === docItem.id ? "#E3F2FD" : "transparent",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                  onClick={() => setSelectedDoc(docItem.id)}
                >
                  <Typography>{docItem.id}</Typography>
                </Stack>
              ))
            )}
          </Box>
        </DialogContent>

        {/* ACTION */}
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            variant="contained"
            color="error"
            disabled={!selectedDoc}
            onClick={handleDeleteClick}
          >
            Xóa đề
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        examName={selectedDoc}
      />

      {/* SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          ✅ Đã xóa đề thành công
        </Alert>
      </Snackbar>
    </>
  );
};

export default OpenExamDialog;