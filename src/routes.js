// src/routes.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/Products/ProductList";
import ProductDetial from "./components/Products/ProductDetial"; // Make sure the import is correct
import Example from "./components/Products/example"; // Make sure the import is correct

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/details/:id" element={<Example />} /> 
      </Routes>
    </Router>
  );
};

export default AppRoutes;
