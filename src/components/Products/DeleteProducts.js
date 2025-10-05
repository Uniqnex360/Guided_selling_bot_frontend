import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function DeleteProducts({ productId, onDeleted }) {
  const [open, setOpen] = useState(!!productId);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setOpen(!!productId);
  }, [productId]);

  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/delete_product/${productId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setLoading(false);
      setOpen(false);
      if (res.ok) {
        if (onDeleted) onDeleted();
      } else {
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      setLoading(false);
      setOpen(false);
      alert("Error deleting product.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Delete Product</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this product?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleDelete} color="error" disabled={loading}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteProducts;