import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/import_products_from_excel/`;

const CleanFileInput = ({ file, onFileChange, loading }) => {
  const fileSelected = !!file;
  const fileName = file ? file.name : 'Click to select Excel file';

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
        <CircularProgress size={48} sx={{ color: '#2563EB' }} />
        <Typography sx={{ mt: 2, color: '#2563EB', fontWeight: 600 }}>
          Importing file, please wait...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 320,
        mx: 'auto',
        textAlign: 'center',
        padding: 3,
        border: fileSelected ? '2px solid #10B981' : '2px dashed #D1D5DB',
        borderRadius: 2,
        backgroundColor: fileSelected ? '#F0FDF4' : '#FFFFFF',
        cursor: loading ? 'default' : 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          borderColor: loading ? '#D1D5DB' : fileSelected ? '#059669' : '#3B82F6',
          backgroundColor: loading ? '#FFFFFF' : fileSelected ? '#E6FEEF' : '#F9FAFB',
        },
      }}
      onClick={() => !loading && document.getElementById("hidden-file-input").click()}
    >
      <input
        type="file"
        id="hidden-file-input"
        accept=".xlsx,.xls"
        onChange={onFileChange}
        style={{ display: 'none' }}
        disabled={loading}
      />

      {fileSelected ? (
        <AttachFileIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
      ) : (
        <CloudUploadIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 1 }} />
      )}

      <Typography variant="body1" sx={{ fontWeight: 600, color: fileSelected ? '#059669' : '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {fileName}
      </Typography>
      <Typography variant="caption" sx={{ color: '#6B7280' }}>
        Max size 5MB. (.xlsx, .xls)
      </Typography>
    </Box>
  );
};

const ImportProducts = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: "Products imported successfully!", severity: "success" });
        setShowConfirmation(true); // Show confirmation dialog
        if (onSuccess) onSuccess();
      } else {
        setSnackbar({ open: true, message: data.error || "Import failed. Please review your file.", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Network error. Check your connection.", severity: "error" });
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? () => {} : onClose}
        aria-labelledby="import-dialog-title"
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle
          id="import-dialog-title"
          sx={{
            fontWeight: 700,
            fontSize: 20,
            color: '#1F2937',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            backgroundColor: '#F9FAFB'
          }}
        >
          <FileDownloadOutlinedIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
          Import Products
        </DialogTitle>

<DialogContent sx={{ p: 3, backgroundColor: '#FFFFFF' }}>
  <CleanFileInput
    file={file}
    onFileChange={handleFileChange}
    loading={loading}
  />

  {!loading && (
    <>
      <Alert
        severity="info"
        variant="outlined"
        sx={{ mt: 3, fontSize: 13, borderColor: '#BFDBFE', color: '#1D4ED8' }}
      >
        Please use our official template to ensure all fields are mapped correctly.
      </Alert>
      <Button
        variant="outlined"
        color="primary"
        sx={{ mt: 2, fontWeight: 600 }}
        startIcon={<FileDownloadOutlinedIcon />}
        href="/product_template.xlsx"
        download
      >
        Download Template
      </Button>
    </>
  )}
</DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              color: '#4B5563',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1,
              '&:hover': { backgroundColor: '#E5E7EB' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            variant="contained"
            sx={{
              backgroundColor: '#3B82F6',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 1,
              textTransform: 'none',
              boxShadow: '0 2px 5px rgba(59,130,246,0.3)',
              '&:hover': { backgroundColor: '#2563EB' }
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadOutlinedIcon />}
          >
            {loading ? "Importing..." : "Upload & Import"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          sx={{ fontWeight: 600, minWidth: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {showConfirmation && (
        <Dialog open onClose={() => { setShowConfirmation(false); onClose(); }}>
          <DialogTitle>Import Completed</DialogTitle>
          <DialogContent>
            <Typography>Products have been imported successfully.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setShowConfirmation(false); onClose(); }} variant="contained" color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ImportProducts;