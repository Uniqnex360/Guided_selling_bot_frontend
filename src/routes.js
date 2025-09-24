// src/routes.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login"; 
import ProductList from "./components/Products/ProductList";
import ProductDetial from "./components/Products/ProductDetial";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Set the Login page as the default (root) route */}
        <Route path="/" element={<Login />} />
        
        {/* The Product List page will now have a new path, e.g., "/products" */}
        <Route path="/products" element={<ProductList />} />
        
        {/* The Product Detail page path remains the same */}
        <Route path="/details/:id" element={<ProductDetial />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;