import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function DeleteProducts({ productId, onDeleted }) {
  const handleDelete = async () => {
    if (!window.confirm("Are you  you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete_product/${productId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Product deleted successfully!");
        if (onDeleted) onDeleted();
      } else {
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      alert("Error deleting product.");
    }
  };

  return (
    <button onClick={handleDelete} style={{ display: 'none' }} />
  );
}

export default DeleteProducts;