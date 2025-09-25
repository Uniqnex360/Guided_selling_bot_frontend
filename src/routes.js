import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Login from "./components/Login/Login"; 
import ProductList from "./components/Products/ProductList";
import ProductDetial from "./components/Products/ProductDetial";
import ProductDetail from "./components/Products/ProductDetial";

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("jwt_token");
  return token ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/details/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;