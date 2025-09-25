import React, { useState, useEffect, useRef, useCallback } from "react";
import SendIcon from "@mui/icons-material/Send";

import {
  Button,
  Container,
  Grid,
  RadioGroup,
  useMediaQuery,
  Tooltip,
  Radio,
  Typography,
  Paper,
  FormControlLabel,
  Box,
  TextField,
  Modal,
  List,
  ListItem,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import CardMedia from "@mui/material/CardMedia";
import { styled } from "@mui/material/styles";
import FetchApi from "./FetchApi";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import MinimizeOutlinedIcon from "@mui/icons-material/MinimizeOutlined";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import CancelIcon from "@mui/icons-material/Cancel";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";

import TextareaAutosize from "@mui/material/TextareaAutosize";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import soonImg from "../assets/soon-img.png";
import { useNavigate, useLocation } from "react-router-dom";
import DotLoading from "../Loading/DotLoading";
import { API_BASE_URL } from "../../utils/config";

// Custom Typography for product details labels
const DetailLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
  marginRight: theme.spacing(1),
}));

// Custom Typography for product details values
const DetailValue = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  color: theme.palette.text.primary,
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `product-tab-${index}`,
    "aria-controls": `product-tabpanel-${index}`,
  };
}

const ProductDetail = () => {
  const defaultHeight = "450px";
  const defaultWidth = "320px";

  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isAddingNewPrompt, setIsAddingNewPrompt] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [mainImage, setMainImage] = useState(product?.images?.[0] || soonImg);
  const { id } = useParams();
  const [productTab, setProductTab] = useState({
    title: [],
    description: [],
    features: [],
  });
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [promptList, setPromptList] = useState([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const messagesEndRef = useRef(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const currentPrice = product?.list_price;
  const originalPrice = product?.was_price;
  const discountPercentage = product?.discount;
  const [selectedFeatureSetIndex, setSelectedFeatureSetIndex] = useState(0);
  const [editingSetIndex, setEditingSetIndex] = useState(null);
  const [editingFeatures, setEditingFeatures] = useState([]);
  const [updateDesc, setUpdateDesc] = useState("");
  const [getTitle, setGetTitle] = useState([]);
  const [getFeatures, setGetFeatures] = useState([]);
  const [getRewriteDescription, setGetRewriteDescription] = useState([]);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [selectedEditIndex, setSelectedEditIndex] = useState(null);
  const [editMode, setEditMode] = useState({
    title: false,
    features: false,
    description: false,
  });
  const [selectedTitle, setSelectedTitle] = useState("");
  const [data, setData] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const chatbotRef = useRef(null);
  const currency = product?.currency || "$";

  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 0;
  const [productIds, setProductIds] = useState([]);

  const handleClickOutside = (e) => {
    if (chatbotRef.current && !chatbotRef.current.contains(e.target)) {
      setChatOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/productList/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_id: "",
        search_query: "",
      }),
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
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const currentIndex = productIds.findIndex((pid) => pid === id);

  const handleNext = () => {
    if (currentIndex !== -1 && currentIndex < productIds.length - 1) {
      const nextId = productIds[currentIndex + 1];
      navigate(`/details/${nextId}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevId = productIds[currentIndex - 1];
      navigate(`/details/${prevId}`);
    }
  };

  useEffect(() => {
    const checkedFeatureSet = productTab?.features?.findIndex((f) => f?.checked);
    if (checkedFeatureSet !== -1) {
      setSelectedFeatureSetIndex(checkedFeatureSet);
    }
  }, [productTab?.features]);

  const handleFeatureSetSelect = (e, index) => {
    setSelectedFeatureSetIndex(index);
    setEditingSetIndex(null);

    const updatedFeatures = productTab.features.map((set, i) => ({
      ...set,
      checked: i === index,
    }));
    handleLocalUpdate({ features: updatedFeatures });
  };

  const handleFeatureChange = (setIndex, featureIndex, newValue) => {
    const updated = [...editingFeatures];
    updated[setIndex][featureIndex] = newValue;
    setEditingFeatures(updated);
  };

  const handleSaveClickFeatures = () => {
    const updatedFeatures = productTab.features.map((feature, index) => {
      if (index === editingSetIndex) {
        return {
          ...feature,
          value: editingFeatures[index],
          checked: true,
        };
      } else {
        return {
          ...feature,
          checked: false,
        };
      }
    });

    const updatedProductTab = {
      ...productTab,
      features: updatedFeatures,
    };

    setProductTab(updatedProductTab);
    setGetFeatures(updatedFeatures);
    setEditMode({ ...editMode, features: false });
    setEditingSetIndex(null);
    setSelectedFeatureSetIndex(editingSetIndex);

    if (updatedFeatures) {
      fetch(`${API_BASE_URL}/updategeneratedContent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: id,
          features: updatedFeatures,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Save success:", data);
        })
        .catch((error) => {
          console.error("Save error:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleCancelFeatures = () => {
    setEditingSetIndex(null);
    setEditMode({ ...editMode, features: false });
    const featuresCopy = productTab.features.map((set) => [...set.value]);
    setEditingFeatures(featuresCopy);
    const checkedIndex = productTab.features.findIndex((f) => f.checked);
    setSelectedFeatureSetIndex(checkedIndex !== -1 ? checkedIndex : null);
  };

  const handleLocalUpdate = (updatedFields) => {
    const updatedProductTab = {
      ...productTab,
      ...updatedFields,
    };
    const checkedDescription = updatedProductTab.description?.find(
      (desc) => desc.checked
    );
    setUpdateDesc(checkedDescription ? checkedDescription.value : "");
    setGetTitle(updatedProductTab.title || []);
    setGetFeatures(updatedProductTab.features || []);
    setGetRewriteDescription(updatedProductTab.description || []);
    setProductTab(updatedProductTab);
  };

  const handleDescriptionChange = (event) => {
    const value = event.target.value;
    setSelectedDescription(value);
    setEditedDescription(value);
    const updatedDescriptions = productTab.description.map((desc) => ({
      ...desc,
      checked: desc.value === value,
    }));
    handleLocalUpdate({ description: updatedDescriptions });
    const selectedChecked = updatedDescriptions.find((desc) => desc.checked);
    const longDescription = selectedChecked ? selectedChecked.value : "";
    setUpdateDesc(longDescription);
  };

  const handleSaveClickDescription = () => {
    const updatedDescriptions = [...productTab.description];
    updatedDescriptions[selectedEditIndex] = {
      ...updatedDescriptions[selectedEditIndex],
      value: editedDescription.trim(),
      checked: true,
    };
    setProductTab((prev) => ({
      ...prev,
      description: updatedDescriptions,
    }));
    setGetRewriteDescription(updatedDescriptions);
    const checkedDescriptions = updatedDescriptions.filter(
      (item) => item.checked
    );
    const longDescription = checkedDescriptions
      .map((item) => item.value)
      .join("\n\n");
    setUpdateDesc(longDescription);
    setEditMode({ ...editMode, description: false });
    setSelectedEditIndex(null);
    if (updatedDescriptions) {
      fetch(`${API_BASE_URL}/updategeneratedContent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: id,
          description: updatedDescriptions,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Save success:", data);
        })
        .catch((error) => {
          console.error("Save error:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleSaveClick = (type) => {
    if (type === "title") {
      const updatedTitles = productTab.title.map((title, index) =>
        index === selectedEditIndex ? { ...title, value: editedTitle } : title
      );
      handleLocalUpdate({ ...productTab, title: updatedTitles });

      if (updatedTitles) {
        fetch(`${API_BASE_URL}/updategeneratedContent/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: id,
            title: updatedTitles,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Save success:", data);
          })
          .catch((error) => {
            console.error("Save error:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
    setSelectedTitle(editedTitle);
    setEditMode({ ...editMode, title: false });
    setSelectedEditIndex(null);
  };

  const handleTitleChange = (index) => {
    const updatedTitles = productTab.title.map((title, idx) => ({
      ...title,
      checked: idx === index,
    }));
    handleLocalUpdate({ title: updatedTitles });
  };

  useEffect(() => {
    const checkedTitle = productTab?.title?.find((title) => title?.checked);
    if (checkedTitle) {
      setSelectedTitle(checkedTitle.value);
    } else if (productTab?.title?.length > 0) {
      setSelectedTitle(productTab.title[0].value);
    }
  }, [productTab?.title]);

  useEffect(() => {
    const checkedTitle = productTab?.title?.find((title) => title?.checked);
    if (checkedTitle) {
      setSelectedTitle(checkedTitle.value);
    }
  }, [productTab?.title]);

  const handleEditClickTitle = (type, index) => {
    setEditMode({ ...editMode, [type]: true });
    setSelectedEditIndex(index);
    if (type === "title" && productTab?.title?.[index]?.value) {
      setEditedTitle(productTab.title[index].value);
      setSelectedTitle(productTab.title[index].value);
    }
  };

  useEffect(() => {
    const checkedDescription = productTab?.description?.find((desc) => desc?.checked);
    if (checkedDescription) {
      setSelectedDescription(checkedDescription.value);
    }
  }, [productTab?.description]);

  const handleEditClickDescription = (index) => {
    setEditMode({ ...editMode, description: true });
    setSelectedEditIndex(index);
    const currentValue = productTab?.description?.[index]?.value || "";
    setEditedDescription(currentValue);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMaximized(true);
    setIsMinimized(false);
  };

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
        .catch((error) => {
          console.error("Error fetching product details:", error);
        });
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
    const requestPayload = {
      message: messageText,
      product_id: id,
    };
    setIsBotTyping(true);
    setTimeout(() => {
      fetch(`${API_BASE_URL}/chatbotView/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })
        .then((response) => response.json())
        .then((data) => {
          const apiResponse =
            data?.data?.response || "Sorry, I couldn't understand your query.";
          const newMessages = [
            ...messages,
            { sender: "user", text: messageText },
            { sender: "chatbot", text: apiResponse },
          ];
          setMessages(newMessages);
          setIsBotTyping(false);
        })
        .catch((error) => {
          console.error("Error sending message to API:", error);
          const errorResponse = "Something went wrong. Please try again.";
          const newMessages = [
            ...messages,
            { sender: "user", text: messageText },
            { sender: "chatbot", text: errorResponse },
          ];
          setMessages(newMessages);
          setIsBotTyping(false);
        });
    }, 1000);
  };

  const handleSendMessage = () => {
    if (userMessage.trim() !== "") {
      const newMessages = [...messages, { sender: "user", text: userMessage }];
      setMessages(newMessages);
      sendMessageToAPI(userMessage);
      setUserMessage("");
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleBackClick = () => {
    navigate({
      pathname: "/",
      search: `?page=${currentPage}`,
    });
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProductTab(updatedProduct);
    fetchProductDetails(id);
  };

  const handleCloseAIModal = () => {
    setAIModalOpen(false);
  };

  const fetchProductDetails = useCallback(
    (productId) => {
      setLoading(true);
      fetch(`${API_BASE_URL}/productDetail/${productId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data?.data?.product) {
            setProduct(data.data.product);
            setMainImage(data.data.product.logo || "default_image.png");
            setProductTab({
              title: data?.data?.product?.ai_generated_title || [],
              description:
                data?.data?.product?.ai_generated_description || [],
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
    },
    [setLoading, setProduct, setMainImage, setProductTab]
  );

  useEffect(() => {
    if (id && id !== "undefined") {
      fetchProductDetails(id);
    }
  }, [id, fetchProductDetails]);

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  const sendSelectedPromptToAPI = async () => {
    const selectedPromptName = isAddingNewPrompt
      ? customPrompt
      : promptList.find((p) => p.id === selectedPrompt)?.name;

    if (!selectedPromptName || selectedPromptName.trim() === "") {
      alert("Please enter or select a prompt before submitting.");
      return;
    }

    const isTitleEmpty = !getTitle || getTitle.length === 0;
    const isDescriptionEmpty =
      !getRewriteDescription || getRewriteDescription.length === 0;
    const isFeaturesEmpty = !getFeatures || getFeatures.length === 0;

    if (isTitleEmpty && isDescriptionEmpty && isFeaturesEmpty) {
      setSnackbarMessage(
        "Please provide at least one of title, description, or features!"
      );
      setSnackbarOpen(true);
      return;
    }
    const requestPayload = {
      option: selectedPromptName,
      title: getTitle || "",
      description: getRewriteDescription || "",
      features: getFeatures || "",
      product_id: id,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/regenerateAiContents/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const result = await response.json();
      if (result.status && result.message === "success") {
        const updatedTitle = result.data?.title || [];
        const updatedDescription = result.data?.description || [];
        const updatedFeaturesRes = result.data?.features || [];

        setProductTab({
          title: updatedTitle,
          description: updatedDescription,
          features: updatedFeaturesRes,
        });

        const selectedTitle =
          updatedTitle.find((item) => item?.checked)?.value || "";
        setGetTitle(selectedTitle);

        const selectedDescription =
          updatedDescription.find((item) => item?.checked)?.value || "";
        setUpdateDesc(selectedDescription);

        const selectedFeatures = updatedFeaturesRes
          .filter((item) => item?.checked)
          .flatMap((item) => item?.value || []);
        setGetFeatures(selectedFeatures);

        setSnackbarMessage("AI content Rewrite successfully!");
      } else {
        setSnackbarMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error sending data to API:", error);
      setSnackbarMessage("Something went wrong. Please try again.");
    }
    setSnackbarOpen(true);
  };

  const handleUpdateProductTotal = async () => {
    const selectedTitleFinal =
      (Array.isArray(getTitle) && getTitle.find((item) => item.checked)?.value) ||
      "";

    const selectedFeatures = Array.isArray(getFeatures)
      ? getFeatures.find((item) => item.checked)?.value || []
      : [];

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/updateProductContent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: id,
          product_obj: {
            product_name: selectedTitleFinal || selectedTitle,
            long_description: updateDesc,
            features: selectedFeatures,
          },
        }),
      });

      const data = await response.json();
      if (data?.status) {
        setSnackbarMessage("Product updated successfully!");
        setSnackbarOpen(true);
        fetchProductDetails(id);
      } else {
        setSnackbarMessage("Update failed. Please try again.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setSnackbarMessage("Something went wrong while updating the product.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPromptList = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/fetchPromptList/`);
        const data = await response.json();

        if (data?.status && Array.isArray(data.data)) {
          setPromptList(data.data);
        }
      } catch (error) {
        console.error("Error fetching prompt list:", error);
      }
    };
    fetchPromptList();
  }, []);

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === "__add_new__") {
      setIsAddingNewPrompt(true);
      setSelectedPrompt("");
    } else {
      setSelectedPrompt(value);
      setIsAddingNewPrompt(false);
    }
  };

  if (loading)
    return (
      <div style={{ marginTop: "10%" }}>
        <DotLoading />
      </div>
    );

  return (
    <Container sx={{ maxWidth: "100%", margin: "0 auto" }}>
      <Box
        mb={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{ fontSize: "16px", textTransform: "none" }}
          >
            Back to Products
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            sx={{
              bgcolor: "#fbc02d",
              color: "white",
              borderRadius: "50%",
              minWidth: "32px",
              minHeight: "32px",
              "&:hover": {
                bgcolor: "#f9a825",
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex === productIds.length - 1}
            sx={{
              bgcolor: "#66bb6a",
              color: "white",
              borderRadius: "50%",
              minWidth: "32px",
              minHeight: "32px",
              "&:hover": {
                bgcolor: "#43a047",
              },
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3} marginTop={3}>
        <Grid item xs={12} md={6}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "center", sm: "flex-start" }}
            gap={2}
          >
            <Box
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
              gap={2}
              justifyContent="center"
              alignItems="flex-start"
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  width: isMobile ? "100%" : "70px",
                  alignItems: "center",
                }}
              >
                {product?.images?.map((img, index) => {
                  if (!img) return null;
                  return (
                    <CardMedia
                      key={`${img}-${index}`}
                      component="img"
                      image={img}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{
                        borderRadius: "4px",
                        height: "60px",
                        width: "60px",
                        cursor: "pointer",
                        border:
                          mainImage === img
                            ? "2px solid #000"
                            : "1px solid #ccc",
                        objectFit: "cover",
                      }}
                      onClick={() => setMainImage(img)}
                    />
                  );
                })}
              </Box>

              <Box sx={{ width: isMobile ? "100%" : "400px" }}>
                <img
                  alt="Product Image"
                  src={mainImage || soonImg}
                  style={{
                    width: isMobile ? "100%" : "300px",
                    height: isMobile ? undefined : "225px",
                    objectFit: "contain",
                    borderRadius: "4px",
                    cursor: "zoom-in",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontSize: { xs: "18px", sm: "20px", md: "24px", lg: "28px" },
                  maxWidth: { xs: "100%", sm: "90%", md: "80%", lg: "37ch" },
                  fontWeight: "bold",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {product?.product_name || "Product Title Not Available"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  mb: 2,
                  gap: 1,
                }}
              >
                {currentPrice !== undefined && currentPrice !== null && (
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      color: "#1a73e8",
                      fontSize: { xs: "16px", sm: "20px" },
                    }}
                  >
                    {currency}
                    {currentPrice}
                  </Typography>
                )}
                {originalPrice !== undefined &&
                  originalPrice !== null &&
                  originalPrice > currentPrice && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#777",
                        textDecoration: "line-through",
                        fontSize: { xs: "14px", sm: "16px" },
                      }}
                    >
                      {currency}
                      {originalPrice}
                    </Typography>
                  )}
                {discountPercentage && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "green",
                      fontWeight: "bold",
                      fontSize: { xs: "14px", sm: "16px" },
                    }}
                  >
                    {discountPercentage} OFF
                  </Typography>
                )}
              </Box>
              <Box
                sx={{ display: "flex", flexDirection: "row", mb: 2, gap: 4 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <DetailLabel>SKU:</DetailLabel>
                  <DetailValue>
                    {product?.sku_number_product_code_item_number || "N/A"}
                  </DetailValue>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <DetailLabel>MPN:</DetailLabel>
                  <DetailValue>{product?.mpn || "N/A"}</DetailValue>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  mb: 2,
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <DetailLabel>Category:</DetailLabel>
                  <DetailValue>
                    {product?.end_level_category || "N/A"}
                  </DetailValue>
                </Box>
                {product?.vendor && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <DetailLabel>Vendor:</DetailLabel>
                    <DetailValue>{product?.vendor}</DetailValue>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <DetailLabel>Brand:</DetailLabel>
                  <DetailValue>{product?.brand_name || "N/A"}</DetailValue>
                </Box>
              </Box>

              <Box mt={2}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    mb: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    sx={{
                      backgroundColor: "#f2f3ae",
                      color: "black",
                      textTransform: "none",
                      fontSize: { xs: "14px", sm: "16px" },
                    }}
                    onClick={() => setAIModalOpen(true)}
                    size="small"
                  >
                    Generate Content With AI
                  </Button>
                </Box>

                <Modal
                  open={aiModalOpen}
                  onClose={handleCloseAIModal}
                  aria-labelledby="ai-modal-title"
                  aria-describedby="ai-modal-description"
                >
                  <Box
                    sx={{
                      borderRadius: "40px",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: { xs: 280, sm: 300 },
                      height: { xs: 272, sm: 300 },
                      bgcolor: "background.paper",
                      border: "2px solid #000",
                      boxShadow: 24,
                      p: 2,
                      borderRadius: "15px",
                    }}
                  >
                    <div id="ai-modal-description">
                      <FetchApi
                        onClose={handleCloseAIModal}
                        onUpdateProduct={handleUpdateProduct}
                      />
                    </div>
                  </Box>
                </Modal>
              </Box>

              <Box mt={2} display="flex" gap={2} alignItems="center">
                {!isAddingNewPrompt ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <select
                      value={selectedPrompt}
                      onChange={handleSelectChange}
                      style={{ padding: "8px", fontSize: "14px" }}
                    >
                      <option value="">Select a Prompt</option>
                      {promptList.map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>
                          {prompt.name}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setIsAddingNewPrompt(true)}
                      sx={{ textTransform: "capitalize" }}
                    >
                      Add
                    </Button>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <input
                      type="text"
                      placeholder="Enter custom prompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      style={{
                        padding: "8px",
                        fontSize: "14px",
                        width: "200px",
                      }}
                    />
                    <Button
                      onClick={() => {
                        setCustomPrompt("");
                        setIsAddingNewPrompt(false);
                      }}
                      sx={{ textTransform: "capitalize" }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendSelectedPromptToAPI}
                  sx={{ textTransform: "capitalize" }}
                >
                  Rewrite
                </Button>

                <Button
                  onClick={handleUpdateProductTotal}
                  disabled={loading}
                  color="primary"
                  sx={{
                    marginLeft: "5px",
                    backgroundColor: (theme) => theme.palette.primary.main,
                    textTransform: "capitalize",
                    color: "white",
                  }}
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Box
          sx={{
            mt: 6,
            width: "526px",
            maxWidth: {
              xs: "100%",
              sm: "100%",
              md: "530px",
            },
            px: {
              xs: 2,
              sm: 2,
              md: 0,
            },
          }}
        >
          {/* Product Features */}
          <Box sx={{ maxWidth: "510px", marginTop: "30px" }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Features
            </Typography>
            <Grid container spacing={1}>
              {product?.features && product.features.length > 0 ? (
                product.features.map((feature, index) => (
                  <Grid item xs={12} key={index}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="#4CAF50"
                      >
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                      </svg>
                      <Typography sx={{ fontSize: "16px" }}>
                        {feature}
                      </Typography>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: "16px", color: "gray" }}>
                    No features available.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Product Description */}
          <Typography
            variant="h6"
            sx={{
              fontSize: "18px",
              fontWeight: 600,
              marginTop: "24px",
              marginBottom: "8px",
            }}
          >
            Description
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "16px",
              color: product?.long_description ? "inherit" : "gray",
              whiteSpace: "pre-wrap",
            }}
          >
            {product?.long_description || "No description available."}
          </Typography>
        </Box>

        <Grid item xs={12} sm={12} md={6}>
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
              marginTop: { xs: "0px", md: "-20px" },
            }}
          >
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              aria-label="product details tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                marginTop: "30px",
                minHeight: "40px",
                "& .MuiTab-root": {
                  minHeight: "40px",
                  fontSize: "16px",
                  textTransform: "capitalize",
                  color: "black",
                },
                "& .Mui-selected": {
                  color: "black !important",
                },
              }}
            >
              <Tab label="Product Title" {...a11yProps(0)} />
              <Tab label="Features" {...a11yProps(1)} />
              <Tab label="Description" {...a11yProps(2)} />
            </Tabs>

            <Box
              sx={{
                mt: 2,
                width: {
                  xs: "100%",
                  sm: "100%",
                  md: "600px",
                },
              }}
            >
              <TabPanel value={tabIndex} index={0}>
                {Array.isArray(productTab?.title) &&
                productTab.title.length > 0 ? (
                  <Box sx={{ width: "100%" }}>
                    <List
                      sx={{
                        padding: 0,
                        mb: 1,
                        width: "100%",
                        maxWidth: {
                          xs: "100%",
                          sm: "90%",
                          md: "80%",
                          lg: "90ch",
                        },
                        fontSize: { xs: "13px", md: "14px" },
                        fontWeight: "bold",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {productTab.title.map((title, index) => (
                        <ListItem key={index}>
                          <FormControlLabel
                            value={title.value}
                            control={
                              <Radio
                                checked={title.checked === true}
                                onChange={() => handleTitleChange(index)}
                              />
                            }
                            label={
                              <Typography variant="body1">
                                {title.value}
                              </Typography>
                            }
                          />

                          {title.checked === true && !editMode.title && (
                            <IconButton
                              onClick={() =>
                                handleEditClickTitle("title", index)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                        </ListItem>
                      ))}
                    </List>

                    {editMode.title && selectedEditIndex !== null && (
                      <Box>
                        <TextField
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          label="Edit Title"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                        />
                        <IconButton onClick={() => handleSaveClick("title")}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            setEditMode({
                              ...editMode,
                              title: false,
                            })
                          }
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <ListItem>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "16px",
                        textAlign: "center",
                        marginLeft: "19%",
                      }}
                      color="textSecondary"
                    >
                      No title available
                    </Typography>
                  </ListItem>
                )}
              </TabPanel>

              <TabPanel value={tabIndex} index={1}>
                <Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    marginBottom={1}
                    sx={{ width: "60%" }}
                  >
                  </Box>

                  {editMode.features ? (
                    <Box>
                      {Array.isArray(productTab?.features) &&
                      productTab.features.length > 0 ? (
                        productTab.features.map((featureObj, listIndex) => {
                          const featureList = Array.isArray(featureObj.value)
                            ? featureObj.value
                            : [];

                          return (
                            <React.Fragment key={listIndex}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Feature Set {listIndex + 1}
                                </Typography>

                                {productTab.features[listIndex]?.checked ===
                                  true && (
                                  <IconButton
                                    onClick={() =>
                                      setEditingSetIndex(listIndex)
                                    }
                                    size="small"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                )}

                                {productTab.features[listIndex]?.checked ===
                                  true &&
                                  editingSetIndex === listIndex && (
                                    <Box>
                                      <IconButton
                                        onClick={handleSaveClickFeatures}
                                      >
                                        <SaveIcon />
                                      </IconButton>
                                      <IconButton
                                        onClick={handleCancelFeatures}
                                      >
                                        <CancelIcon />
                                      </IconButton>
                                    </Box>
                                  )}
                              </Box>

                              {featureList.map((feature, featureIndex) => (
                                <Box
                                  key={featureIndex}
                                  sx={{
                                    marginBottom: 1,
                                    marginLeft: "3px",
                                    maxWidth: "90ch",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  {editingSetIndex === listIndex ? (
                                    <TextField
                                      sx={{ maxWidth: "90ch" }}
                                      value={
                                        editingFeatures[listIndex]?.[
                                          featureIndex
                                        ] || feature
                                      }
                                      onChange={(e) =>
                                        handleFeatureChange(
                                          listIndex,
                                          featureIndex,
                                          e.target.value
                                        )
                                      }
                                      label={`Feature ${featureIndex + 1}`}
                                      fullWidth
                                      variant="outlined"
                                      margin="normal"
                                    />
                                  ) : (
                                    <Typography
                                      variant="body1"
                                      sx={{ paddingLeft: "16px" }}
                                    >
                                      • {feature}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{ fontSize: "16px", marginLeft: "18%" }}
                          color="textSecondary"
                        >
                          No features available.
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <RadioGroup
                      value={selectedFeatureSetIndex ?? ""}
                      onChange={(e) =>
                        handleFeatureSetSelect(e, Number(e.target.value))
                      }
                    >
                      {Array.isArray(productTab?.features) &&
                      productTab.features.length > 0 ? (
                        productTab.features.map((featureObj, listIndex) => {
                          const featureList = Array.isArray(featureObj.value)
                            ? featureObj.value
                            : [];

                          return (
                            <React.Fragment key={listIndex}>
                              <ListItem
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <FormControlLabel
                                  value={listIndex}
                                  control={
                                    <Radio
                                      checked={
                                        productTab.features[listIndex]
                                          ?.checked === true
                                      }
                                    />
                                  }
                                  label={
                                    <Box display="flex" alignItems="center">
                                      <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        Feature Set {listIndex + 1}
                                      </Typography>
                                      {productTab.features[listIndex]?.checked ===
                                        true && (
                                        <IconButton
                                          onClick={() => {
                                            setEditingSetIndex(listIndex);
                                            const featuresCopy =
                                              productTab.features.map((set) => [
                                                ...set.value,
                                              ]);
                                            setEditingFeatures(featuresCopy);
                                            setEditMode({
                                              ...editMode,
                                              features: true,
                                            });
                                          }}
                                          size="small"
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItem>

                              {featureList.map((feature, featureIndex) => (
                                <ListItem
                                  key={featureIndex}
                                  sx={{
                                    padding: "4px 0",
                                    fontSize: "0.9rem",
                                    maxWidth: "90ch",
                                    overflowWrap: "break-word",
                                    paddingLeft: "18px",
                                  }}
                                >
                                  <Typography variant="body1">
                                    • {feature}
                                  </Typography>
                                </ListItem>
                              ))}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{ fontSize: "16px", marginLeft: "18%" }}
                          color="textSecondary"
                        >
                          No features available.
                        </Typography>
                      )}
                    </RadioGroup>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={tabIndex} index={2}>
                {productTab?.description?.length > 0 ? (
                  <RadioGroup
                    value={selectedDescription}
                    onChange={handleDescriptionChange}
                  >
                    {productTab.description.map((desc, index) => {
                      const descValue = desc?.value || "";
                      const isSelected = selectedDescription === descValue;

                      return (
                        <ListItem
                          key={index}
                          sx={{
                            fontWeight: "bold",
                            fontSize: "16px",
                            maxWidth: "90ch",
                            overflowWrap: "break-word",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {editMode.description &&
                          selectedEditIndex === index ? (
                            <Box
                              sx={{
                                position: "relative",
                                width: "100%",
                                maxWidth: "550px",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <IconButton
                                  onClick={handleSaveClickDescription}
                                >
                                  <SaveIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    setEditMode({
                                      ...editMode,
                                      description: false,
                                    })
                                  }
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Box>

                              <TextareaAutosize
                                value={editedDescription}
                                onChange={(e) =>
                                  setEditedDescription(e.target.value)
                                }
                                placeholder="Edit Description"
                                minRows={3}
                                style={{
                                  width: "100%",
                                  fontSize: "14px",
                                  padding: "10px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                  fontFamily: "Roboto, Helvetica, sans-serif",
                                }}
                              />
                            </Box>
                          ) : (
                            <>
                              <FormControlLabel
                                value={descValue}
                                control={<Radio checked={isSelected} />}
                                label={
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: "16px" }}
                                  >
                                    {descValue}
                                  </Typography>
                                }
                              />
                              {isSelected && (
                                <IconButton
                                  onClick={() => {
                                    setSelectedEditIndex(index);
                                    setEditedDescription(descValue);
                                    setSelectedDescription(descValue);
                                    setEditMode({
                                      ...editMode,
                                      description: true,
                                    });
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              )}
                            </>
                          )}
                        </ListItem>
                      );
                    })}
                  </RadioGroup>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "16px",
                      marginLeft: "15%",
                      alignItems: "center",
                    }}
                    color="textSecondary"
                  >
                    No description available.
                  </Typography>
                )}
              </TabPanel>
            </Box>
          </Box>
        </Grid>
      </Grid>

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
                if (e.key === "Enter" && !e.shiftKey) {
                  handleSendMessage();
                }
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
          severity={
            snackbarMessage.includes("successfully") ? "success" : "error"
          }
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