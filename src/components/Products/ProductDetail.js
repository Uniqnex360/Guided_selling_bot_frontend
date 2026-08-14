import React, { useState, useEffect, useRef } from "react";
import SendIcon from "@mui/icons-material/Send";
import {
  Button,
  Container,
  useMediaQuery,
  Tooltip,
  Typography,
  Paper,
  Box,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MinimizeOutlinedIcon from "@mui/icons-material/MinimizeOutlined";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import soonImg from "../assets/soon-img.png";
import DotLoading from "../Loading/DotLoading";
import { API_BASE_URL } from "../../utils/config";
import ContentStudio from "./ContentStudio";

const ProductDetail = () => {
  const defaultHeight = "450px";
  const defaultWidth = "320px";
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [updating, setUpdating] = useState(false);
  const [mainImage, setMainImage] = useState(soonImg);
  const [productTab, setProductTab] = useState({
    title: [],
    description: [],
    features: [],
  });
  const [productIds, setProductIds] = useState([]);

  // chat widget state (unchanged)
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [data, setData] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 0;

  // Convert "USD" to "$" symbol
const rawCurrency = product?.currency;
const currencySymbol = (!rawCurrency || rawCurrency.toUpperCase() === "USD") ? "$" : rawCurrency;

// Format numbers with commas (e.g., 1423.84 -> 1,423.84)
const formatPrice = (val) => {
  if (val == null || isNaN(val)) return null;
  const num = Number(val);
  return num % 1 === 0
    ? num.toLocaleString("en-US")
    : num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const currentPrice = formatPrice(product?.list_price);
const originalPrice = formatPrice(product?.was_price);
const pushFieldToProduct = async (field, value) => {
  const fieldMap = {
    title: "product_name",
    description: "long_description",
    features: "features",
  };
  const payload = {
    product_id: id,
    product_obj: { [fieldMap[field]]: value },
  };
  try {
    const response = await fetch(`${API_BASE_URL}/updateProductContent/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data?.status) {
      fetchProductDetails(id);
    }
  } catch (error) {
    console.error("Error pushing field to product:", error);
  }
};
const discountPercentage =
  product?.discount &&
  typeof product.discount === "string" &&
  product.discount !== "NaN%"
    ? product.discount
    : typeof product?.discount === "number" && !isNaN(product.discount)
      ? `${product.discount}%`
      : "";

  const showSnackbar = (severity, message) => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleClickOutside = (e) => {
    if (chatbotRef.current && !chatbotRef.current.contains(e.target)) {
      setChatOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/productList/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: "", search_query: "" }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        const ids = responseData.data.products.map((item) => item.id);
        setProductIds(ids);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProductDetails = (productId) => {
    setLoading(true);
    fetch(`${API_BASE_URL}/productDetail/${productId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.data?.product) {
          setProduct(data.data.product);
          setMainImage(data.data.product.logo || soonImg);
          setProductTab({
            title: data?.data?.product?.ai_generated_title || [],
            description: data?.data?.product?.ai_generated_description || [],
            features: data?.data?.product?.ai_generated_features || [],
          });
        } else {
          console.warn("Product data not found for ID:", productId);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  };
  useEffect(() => {
    if (id && id !== "undefined") fetchProductDetails(id);
  }, [id]);

  const currentIndex = productIds.findIndex((pid) => pid === id);
  const handleNext = () => {
    if (currentIndex !== -1 && currentIndex < productIds.length - 1) {
      navigate(`/details/${productIds[currentIndex + 1]}`);
    }
  };
  const handlePrevious = () => {
    if (currentIndex > 0) navigate(`/details/${productIds[currentIndex - 1]}`);
  };
  const handleBackClick = () => {
    navigate({ pathname: "/products", search: `?page=${currentPage}` });
  };

  const handleUpdateProductTotal = async () => {
    const selectedTitle =
      productTab?.title?.find((item) => item.checked)?.value || "";
    const selectedDescription =
      productTab?.description?.find((item) => item.checked)?.value || "";
    const selectedFeatures =
      productTab?.features?.find((item) => item.checked)?.value || [];

    const payload = {
      product_id: id,
      product_obj: {
        product_name: selectedTitle,
        long_description: selectedDescription,
        features: selectedFeatures,
      },
    };

    setUpdating(true);
    showSnackbar("info", "Updating product...");
    try {
      const response = await fetch(`${API_BASE_URL}/updateProductContent/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.status) {
        showSnackbar("success", "Product updated successfully!");
        fetchProductDetails(id);
      } else {
        showSnackbar("error", "Update failed. Please try again.");
      }
    } catch (error) {
      showSnackbar("error", "Network error while updating.");
    } finally {
      setUpdating(false);
    }
  };

  // ---- chat widget (unchanged) ----
  const toggleChat = () => setChatOpen(!chatOpen);
  useEffect(() => {
    if (chatOpen && id) {
      setLoadingQuestion(true);
      fetch(`${API_BASE_URL}/fetchProductQuestions/${id}`)
        .then((response) => response.json())
        .then((responseData) => {
          setData(responseData.data);
          setLoadingQuestion(false);
        })
        .catch((error) =>
          console.error("Error fetching product details:", error),
        );
    }
  }, [chatOpen, id]);
  const handleQuestionClick = (questionId) => {
    const question = data.find((item) => item.id === questionId);
    if (question) {
      setMessages([...messages, { sender: "user", text: question.question }]);
      sendMessageToAPI(question.question);
    }
  };
  const sendMessageToAPI = (messageText) => {
    setIsBotTyping(true);
    setTimeout(() => {
      fetch(`${API_BASE_URL}/chatbotView/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, product_id: id }),
      })
        .then((response) => response.json())
        .then((data) => {
          const apiResponse =
            data?.data?.response || "Sorry, I couldn't understand your query.";
          setMessages((prev) => [
            ...prev,
            { sender: "user", text: messageText },
            { sender: "chatbot", text: apiResponse },
          ]);
          setIsBotTyping(false);
        })
        .catch((error) => {
          console.error("Error sending message to API:", error);
          setMessages((prev) => [
            ...prev,
            { sender: "user", text: messageText },
            {
              sender: "chatbot",
              text: "Something went wrong. Please try again.",
            },
          ]);
          setIsBotTyping(false);
        });
    }, 1000);
  };
  const handleSendMessage = () => {
    if (userMessage.trim() !== "") {
      sendMessageToAPI(userMessage);
      setUserMessage("");
    }
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleMinimize = () => {
    setIsMinimized(true);
    setIsMaximized(false);
  };
  const handleMaximize = () => {
    setIsMaximized(true);
    setIsMinimized(false);
  };

  const hasAiContent = (arr) =>
    Array.isArray(arr) &&
    arr.some((item) => {
      if (!item) return false;
      const v = item.value;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim() !== "";
      return false;
    });
  const hasAnyContent =
    hasAiContent(productTab?.title) ||
    hasAiContent(productTab?.description) ||
    hasAiContent(productTab?.features);

  if (loading)
    return (
      <div style={{ marginTop: "10%" }}>
        <DotLoading />
        ...
      </div>
    );

  const imagesList = product?.images?.length ? product.images : [mainImage];
  const currentImageIndex = imagesList.indexOf(mainImage) >= 0 ? imagesList.indexOf(mainImage) + 1 : 1;

  return (
    <Container
      maxWidth={false}
      sx={{ maxWidth: "100%", margin: "0 auto", px: { xs: 2, md: 4 }, py: 2 }}
    >
      {/* Header Bar with Breadcrumb, Title & Main Action */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          {/* Breadcrumbs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={handleBackClick}
              sx={{
                fontSize: "0.875rem",
                textTransform: "none",
                color: "#4b5563",
                p: 0,
                minWidth: "auto",
                "&:hover": { bg: "transparent", color: "#111827" },
              }}
            >
              Back to Products
            </Button>
            <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>/</Typography>
            <Typography sx={{ color: "#111827", fontSize: "0.875rem", fontWeight: 500 }}>
              Product details
            </Typography>
          </Box>

<Typography
  variant="caption"
  sx={{
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 400,
    color: "#6b7280",
    fontSize: "0.75rem",
    display: "block",
  }}
>
  PRODUCT WORKSPACE
</Typography>

          <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827", mt: 0.5 }}>
            Product details
          </Typography>

          {/* Subtitle */}
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            Review existing content, generate improvements with AI, and publish.
          </Typography>
        </Box>

        {/* Action Button */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: { xs: 1, sm: 0 } }}>
          <Tooltip title="Previous product">
            <span>
              <IconButton
                onClick={handlePrevious}
                disabled={currentIndex <= 0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#374151",
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next product">
            <span>
              <IconButton
                onClick={handleNext}
                disabled={
                  currentIndex === -1 || currentIndex >= productIds.length - 1
                }
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#374151",
                }}
              >
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {/* <Button
            variant="contained"
            onClick={handleUpdateProductTotal}
            disabled={loading || !hasAnyContent || updating}
            endIcon={
              updating ? (
                <CircularProgress size={14} sx={{ color: "white" }} />
              ) : (
                <ArrowForwardIcon fontSize="small" />
              )
            }
            sx={{
              bgcolor: "#1b4d3e",
              textTransform: "none",
              fontWeight: 400,
              borderRadius: "8px",
              px: 2.5,
              py: 1,
              color: "white",
              "&:hover": { bgcolor: "#143a2f" },
            }}
          >
            {updating ? "Updating..." : "Update product"}
          </Button> */}
        </Box>
      </Box>

      {/* Dual-Tone Product Summary Card */}
      <Box
        sx={{
          bgcolor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left Panel: Media / Light Gray Section */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "0 0 45%" },
            bgcolor: "#f2f4f1",
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: { md: "1px solid #e5e7eb" },
            borderBottom: { xs: "1px solid #e5e7eb", md: "none" },
          }}>
          <Box>
            {/* Main Image Wrapper with Overlay Badge */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <img
                alt="Product"
                src={mainImage || soonImg}
                style={{
                  width: "100%",
                  height: 340,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(4px)",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 400,
                    color: "#374151",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  📷 Main image
                </Typography>
              </Box>
            </Box>

            {/* Thumbnails Row */}
            <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap", alignItems: "center" }}>
              {product?.images?.length > 0 ? (
                product.images.map((img, index) => {
                  if (!img) return null;
                  const isSelected = mainImage === img;
                  return (
                    <Box
                      key={`${img}-${index}`}
                      onClick={() => setMainImage(img)}
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: isSelected ? "2px solid #1b4d3e" : "1px solid #d1d5db",
                        bgcolor: "#fff",
                        p: "2px",
                      }}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                      />
                    </Box>
                  );
                })
              ) : (
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "8px",
                    border: "2px solid #1b4d3e",
                    bgcolor: "#fff",
                    p: "2px",
                  }}
                >
                  <img
                    src={mainImage || soonImg}
                    alt="Thumbnail 1"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                  />
                </Box>
              )}
              {/* Plus Thumbnail Tile */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1",
                  bgcolor: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                +
              </Box>
            </Box>
          </Box>

<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, pt: 1 }}>
  <Typography variant="caption" sx={{ color: "#6b7280", fontFamily: "monospace, sans-serif", fontSize: "0.75rem" }}>
    Product images
  </Typography>
  <Typography variant="caption" sx={{ color: "#6b7280", fontFamily: "monospace, sans-serif", fontSize: "0.75rem" }}>
    {currentImageIndex} of {imagesList.length}
  </Typography>
</Box>
</Box>

        <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column" }}>
          {/* Status & Recency Bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10b981" }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 400, color: "#374151", letterSpacing: "0.05em", fontSize: "0.75rem", fontFamily: "monospace, sans-serif", }}
              >
                ACTIVE LISTING
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "#9ca3af", fontSize: "0.75rem" }}>•</Typography>
            <Typography variant="caption" sx={{ color: "#6b7280", letterSpacing: "0.05em", fontSize: "0.75rem", fontFamily: "monospace, sans-serif"}}>
              LAST UPDATED 2 MIN AGO
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              color: "#111827",
              mb: 2,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              lineHeight: 1.3,
            }}
          >
            {product?.product_name || "Product Title Not Available"}
          </Typography>

      {/* Pricing Bar */}
<Box sx={{ display: "flex", alignItems: "baseline", gap: 1.25, mb: 4 }}>
  {currentPrice && (
    <Typography
      sx={{
        fontWeight: 700,
        color: "#1b4d3e",
        fontSize: { xs: "1.35rem", sm: "1.6rem" },
        letterSpacing: "-0.02em",
      }}
    >
      {currencySymbol}{currentPrice}
    </Typography>
  )}

  {originalPrice && Number(product?.was_price) > Number(product?.list_price) && (
    <Typography
      variant="body2"
      sx={{
        color: "#9ca3af",
        textDecoration: "line-through",
        fontSize: "0.95rem",
      }}
    >
      {currencySymbol}{originalPrice}
    </Typography>
  )}

  {discountPercentage && (
    <Typography
      variant="caption"
      sx={{
        color: "#1b4d3e",
        fontWeight: 600,
        fontSize: "0.8rem",
        letterSpacing: "0.02em",
      }}
    >
      {discountPercentage} OFF
    </Typography>
  )}
</Box>

          {/* Stacked 2x2 Grid for Fields */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
              pt: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", fontWeight: 400, letterSpacing: "0.05em", display: "block", mb: 0.5, fontFamily: "monospace, sans-serif" }}
              >
                SKU
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 400, color: "#111827" }}>
                {product?.sku_number_product_code_item_number || "N/A"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", fontWeight: 400, letterSpacing: "0.05em", display: "block", mb: 0.5, fontFamily: "monospace, sans-serif"}}
              >
                MPN
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 400, color: "#111827" }}>
                {product?.mpn || "N/A"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", fontWeight: 400, letterSpacing: "0.05em", display: "block", mb: 0.5, fontFamily: "monospace, sans-serif" }}
              >
                CATEGORY
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 400, color: "#111827" }}>
                {product?.end_level_category || "N/A"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", fontWeight: 400, letterSpacing: "0.05em", display: "block", mb: 0.5, fontFamily: "monospace, sans-serif" }}
              >
                BRAND
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 400, color: "#111827" }}>
                {product?.brand_name || "N/A"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

     <ContentStudio
  id={id}
  product={product}
  productTab={productTab}
  setProductTab={setProductTab}
  onSnackbar={showSnackbar}
  onApplyToProduct={pushFieldToProduct}
/>

      {/* Chat Widget (unchanged) */}
      <IconButton
        onClick={toggleChat}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "#007bff",
          color: "white",
          "&:hover": { background: "#0056b3" },
        }}
      >
        <ChatIcon />
      </IconButton>
      {chatOpen && (
        <Box
          ref={chatbotRef}
          sx={{
            position: "fixed",
            width: defaultWidth,
            height: isMinimized ? "50px" : isMaximized ? "80%" : defaultHeight,
            transition: "all 0.3s",
            bottom: 90,
            right: 20,
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: 6,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              bgcolor: "#1976d2",
              color: "#fff",
              p: 1.5,
              position: "relative",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Product Chat Assistant
            </Typography>
            <Box
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                display: "flex",
                gap: 1,
              }}
            >
              <Tooltip title="Minimize" arrow>
                <span>
                  <IconButton
                    size="small"
                    sx={{ color: "black" }}
                    onClick={handleMinimize}
                    disabled={isMinimized}
                  >
                    <MinimizeOutlinedIcon
                      fontSize="small"
                      sx={{ mt: "-10px" }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Maximize" arrow>
                <span>
                  <IconButton
                    size="small"
                    sx={{ color: "black" }}
                    onClick={handleMaximize}
                    disabled={isMaximized}
                  >
                    <CropSquareIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Close" arrow>
                <IconButton
                  size="small"
                  sx={{ color: "black" }}
                  onClick={toggleChat}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box
            sx={{
              p: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              overflowY: "auto",
            }}
          >
            {messages.length === 0 && (
              <Typography
                sx={{
                  textAlign: "center",
                  fontStyle: "italic",
                  color: "#aaa",
                  padding: "10px",
                }}
              >
                Hello! Ask me about this product.
              </Typography>
            )}
            {loadingQuestion ? (
              <Box
                sx={{
                  backgroundColor: "#f9f9f9",
                  padding: "8px",
                  borderRadius: "5px",
                  marginTop: "5px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <DotLoading />
              </Box>
            ) : (
              data.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    backgroundColor: "#f9f9f9",
                    padding: "8px",
                    borderRadius: "5px",
                    marginTop: "5px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handleQuestionClick(item.id)}
                >
                  <Typography variant="body2">{item.question}</Typography>
                  <IconButton sx={{ padding: 0 }}>
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              ))
            )}
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <Typography
                  sx={{
                    backgroundColor:
                      message.sender === "user" ? "#d1e7ff" : "#f1f1f1",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                  }}
                >
                  {message.text}
                </Typography>
              </Box>
            ))}
            {isBotTyping && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: "#f1f1f1",
                    borderRadius: 2,
                    maxWidth: "80%",
                  }}
                >
                  <Typography variant="body2">...typing</Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              p: 1.5,
              borderTop: "1px solid #ddd",
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Type your message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSendMessage();
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              sx={{
                minWidth: "40px",
                height: "40px",
                borderRadius: "50%",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail;