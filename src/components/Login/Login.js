import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { API_BASE_URL } from "../../utils/config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        Cookies.set("jwt_token", data.token, { expires: rememberMe ? 7 : 1 });
        setSnackbarOpen(true); // Show success toast
        setTimeout(() => {
          navigate("/products");
        }, 1200); // Wait for toast before navigating
      } else {
        if (data.error && data.error.toLowerCase().includes("invalid credentials")) {
          setError("User not found. Try registering or signing up.");
        } else {
          setError(data.error || "Login failed.");
        }
      }
    } catch (err) {
      setError("Network error.");
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Left Side - Blue Background with Branding */}
      <Box 
        sx={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 4,
          color: 'white',
          position: 'relative'
        }}
      >
        {/* Logo/Icon Container */}
        <Box 
          sx={{ 
            width: 200, 
            height: 200, 
            backgroundColor: 'rgba(255, 255, 255, 0.15)', 
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 6,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Orange Funnel */}
            <Box 
              sx={{
                width: 0,
                height: 0,
                borderLeft: '40px solid transparent',
                borderRight: '40px solid transparent',
                borderTop: '50px solid #f97316',
                mb: 2
              }}
            />
            
            {/* Blue Shopping Bag */}
            <Box 
              sx={{
                width: 60,
                height: 45,
                backgroundColor: '#3b82f6',
                borderRadius: '8px 8px 12px 12px',
                position: 'relative',
                mb: 2
              }}
            >
              {/* Bag Handle */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: 15,
                  right: 15,
                  height: 12,
                  border: '4px solid #3b82f6',
                  borderBottom: 'none',
                  borderRadius: '12px 12px 0 0',
                  backgroundColor: 'transparent'
                }}
              />
            </Box>

            {/* Chart Bars */}
            <Box sx={{ display: 'flex', gap: '6px', alignItems: 'end' }}>
              <Box sx={{ width: 12, height: 25, backgroundColor: '#60a5fa', borderRadius: '2px' }} />
              <Box sx={{ width: 12, height: 35, backgroundColor: '#60a5fa', borderRadius: '2px' }} />
              <Box sx={{ width: 12, height: 45, backgroundColor: '#60a5fa', borderRadius: '2px' }} />
            </Box>
          </Box>
        </Box>
        
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 700, 
            textAlign: 'center', 
            lineHeight: 1.2,
            fontSize: { xs: '2rem', md: '3rem' },
            maxWidth: '500px'
          }}
        >
          Sell smarter with guided insights.
        </Typography>
      </Box>

      {/* Right Side - Login Form */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          padding: 4
        }}
      >
        <Box 
          sx={{ 
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: { xs: 4, md: 6 },
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Avatar/Logo */}
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mx: 'auto',
              mb: 4
            }}
          >
            <Box 
              sx={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '18px solid #60a5fa',
              }}
            />
          </Box>

          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              textAlign: 'center', 
              mb: 1,
              fontSize: '2rem',
              color: '#1f2937'
            }}
          >
            Welcome back 👋
          </Typography>
          
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#9ca3af', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  height: '56px',
                  fontSize: '1rem',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    borderWidth: '2px',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#9ca3af', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#9ca3af' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  height: '56px',
                  fontSize: '1rem',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    borderWidth: '2px',
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{ 
                      color: '#9ca3af',
                      '&.Mui-checked': {
                        color: '#3b82f6',
                      },
                    }}
                  />
                }
                label="Remember me"
                sx={{ 
                  '& .MuiFormControlLabel-label': { 
                    fontSize: '0.95rem', 
                    color: '#6b7280',
                    fontWeight: 500
                  } 
                }}
              />

            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                py: 2,
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                height: '56px',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)',
                },
              }}
            >
              Login
            </Button>
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {/* Snackbar for login success */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={12200}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Login successful!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;