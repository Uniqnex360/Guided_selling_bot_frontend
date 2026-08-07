import React, { useState, useEffect, useRef } from "react";
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
  Divider,
  Tabs,
  Tab,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import {  useParams } from "react-router-dom";
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
import { Card, CardContent } from "@mui/material";

import TextareaAutosize from "@mui/material/TextareaAutosize";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import soonImg from "../assets/soon-img.png";
import { useNavigate, useLocation } from "react-router-dom";
import DotLoading from "../Loading/DotLoading";
import { API_BASE_URL } from "../../utils/config";

const DetailLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
  marginRight: theme.spacing(1),
}));

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
  const [aiSuggestions, setAISuggestions] = useState([]);
  const [aiModalOpen, setAIModalOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width:600px)");
  const [mainImage, setMainImage] = useState(product?.images?.[0] || soonImg);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const { id } = useParams();
  const [productTab, setProductTab] = useState({
    title: [],
    description: [],
    features: [],
  });
  const [tabIndex, setTabIndex] = useState(0);

  const [responseChat, setResponseChat] = useState("");
  const messagesEndRef = useRef(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const currentPrice = product?.list_price;
  const originalPrice = product?.was_price;
  const discountPercentage =
    product?.discount &&
    typeof product.discount === "string" &&
    product.discount !== "NaN%"
      ? product.discount
      : typeof product?.discount === "number" && !isNaN(product.discount)
        ? `${product.discount}%`
        : "";
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [promptList, setPromptList] = useState([]);
  const [customPrompt, setCustomPrompt] = useState("");

  const [selectedFeatureSetIndex, setSelectedFeatureSetIndex] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState(
    productTab?.features || [],
  );

 
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [editedTitle, setEditedTitle] = useState("");
  const [getTitle, setGetTitle] = useState([]);
  const [getTitleRewrite, setGetTitleRewrite] = useState([]);

  const [getFeatures, setGetFeatures] = useState([]);
  const [getDescription, setGetDescription] = useState([]);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);
  const [selectedFeatureValue, setSelectedFeatureValue] = useState("");
  const [editingSetIndex, setEditingSetIndex] = useState(null);
  const [editingFeatures, setEditingFeatures] = useState([]);
  const [getRewriteDescription, setGetRewriteDescription] = useState([]);

  const [editedValueDec, setEditedValueDec] = useState([]);
  const [editValueFeatures, setEditValueFeatures] = useState([]);

  const [finalTitle, setFinalTitle] = useState("");
  const [finalDescription, setFinalDescription] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 0;

  const { searchQuery } = location.state || {};
  console.log("searchQuery-Details:", searchQuery);
  const [productIds, setProductIds] = useState([]);

  const [editMode, setEditMode] = useState({
    title: false,
    features: false,
    description: false,
  });
  const [customPromptModalOpen, setCustomPromptModalOpen] = useState(false);
  const currency = product?.currency || "$";
  const [selectedTitle, setSelectedTitle] = useState("");
  const [data, setData] = useState([]);

  const [editValueTitle, seteditValueTitle] = useState("");

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedEditIndex, setSelectedEditIndex] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [updateDesc, setUpdateDesc] = useState("");
  const chatbotRef = useRef(null);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
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
  };

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
    const checkedFeatureSet = productTab?.features?.findIndex(
      (f) => f?.checked,
    );
    if (checkedFeatureSet !== -1) {
      setSelectedFeatureSetIndex(checkedFeatureSet);
    }
  }, [productTab?.features]);

 

  useEffect(() => {
    const defaultIndex = productTab?.features?.findIndex((set) => set.checked);
    if (defaultIndex !== -1 && defaultIndex !== undefined) {
      setSelectedFeatureSetIndex(defaultIndex);
    }
  }, [productTab?.features]);

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
    console.log("oppo", updatedFeatures);
    setEditValueFeatures(updatedFeatures);

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

  }


  const handleFeatureSetChange = (event, listIndex) => {
    const updatedSelectedFeatures = [...selectedFeatures];
    if (event.target.checked) {
      updatedSelectedFeatures[listIndex] = productTab.features[listIndex].map(
        (_, featureIndex) => featureIndex,
      );
    } else {
      updatedSelectedFeatures[listIndex] = [];
    }
    setSelectedFeatures(updatedSelectedFeatures);
  };

  const handleLocalUpdate = (updatedFields) => {
    const updatedProductTab = {
      ...productTab,
      ...updatedFields,
    };

    const checkedDescription = updatedProductTab.description?.find(
      (desc) => desc.checked,
    );
    setGetDescription(checkedDescription ? checkedDescription.value : "");

    setGetTitle(updatedProductTab.title || []);
    console.log("last", updatedProductTab.title);
    setGetFeatures(updatedProductTab.features || []);
    setGetRewriteDescription(updatedProductTab.description || []);

    setGetTitleRewrite(updatedProductTab.title || []);

    setProductTab(updatedProductTab);
    console.log("Local state updated with:", updatedProductTab);
  };

  const handleDescriptionChange = (event) => {
    const clickedValue = event.target.value;

    const isCurrentlySelected = selectedDescription === clickedValue;
    let finalValue;
    let updatedDescriptions;

    if (isCurrentlySelected) {
      finalValue = "";
      updatedDescriptions = productTab.description.map((desc) => ({
        ...desc,
        checked: false,
      }));
    } else {
      finalValue = clickedValue;
      updatedDescriptions = productTab.description.map((desc) => ({
        ...desc,
        checked: desc.value === clickedValue,
      }));
    }

    setSelectedDescription(finalValue);
    setEditedDescription(finalValue);

    handleLocalUpdate({ description: updatedDescriptions });

    const longDescription = finalValue;
    setUpdateDesc(longDescription);

    console.log("✅ Selected Description:", longDescription);
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
    setEditedValueDec(updatedDescriptions);
    console.log("query one", updatedDescriptions);

    const checkedDescriptions = updatedDescriptions.filter(
      (item) => item.checked,
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

    console.log("✅ Final Long Description:", longDescription);
  };

  const handleSaveClick = (type) => {
    if (type === "title") {
      const updatedTitles = productTab.title.map((title, index) =>
        index === selectedEditIndex ? { ...title, value: editedTitle } : title,
      );

      handleLocalUpdate({ ...productTab, title: updatedTitles });

      seteditValueTitle(updatedTitles);
      console.log("0000", updatedTitles);

      const checkedTitle = updatedTitles.find((t) => t.checked)?.value || "";

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
    const willBeChecked = !productTab.title[index].checked;

    const updatedTitles = productTab.title.map((title, idx) => ({
      ...title,

      checked: idx === index ? willBeChecked : false,
    }));

    const newSelectedTitle = willBeChecked ? productTab.title[index].value : "";
    setSelectedTitle(newSelectedTitle);

    handleLocalUpdate({ title: updatedTitles });
    setGetTitle(updatedTitles);
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

  const handleRadioChange = (type, index, value) => {
    setSelectedTitle(value);
    const updatedTitles = productTab.title.map((title, i) => ({
      ...title,
      checked: i === index,
    }));
    handleLocalUpdate({ ...productTab, title: updatedTitles });
  };

  const handleEditClickTitle = (type, index) => {
    setEditMode({ ...editMode, [type]: true });
    setSelectedEditIndex(index);
    if (type === "title" && productTab?.title?.[index]?.value) {
      setEditedTitle(productTab.title[index].value);
      setSelectedTitle(productTab.title[index].value);
    }
  };

  useEffect(() => {
    const checkedDescription = productTab?.description?.find(
      (desc) => desc?.checked,
    );
    if (checkedDescription) {
      setSelectedDescription(checkedDescription.value);
    }
  }, [productTab?.description]);

  const handleLocalUpdateDescription = (updatedProductTab) => {
    console.log("Local state updated with:", updatedProductTab);

    const selectedTitle =
      updatedProductTab.title.find((item) => item.checked)?.value || "";
    setFinalTitle(selectedTitle);

    const selectedDescription =
      updatedProductTab.description.find((item) => item.checked)?.value || "";
    setFinalDescription(selectedDescription);
  };

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

  const handleRestore = () => {
    setIsMaximized(false);
    setIsMinimized(false);
  };

  useEffect(() => {
    if (Array.isArray(productTab?.features)) {
      const initialSelectedFeatures = productTab.features.map(() => []);
      setSelectedFeatures(initialSelectedFeatures);
    }
  }, [productTab?.features]);

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

  const sendSelectedPromptToAPI = async () => {
    const selectedPromptName = isAddingNewPrompt
      ? customPrompt
      : promptList.find((p) => p.id === selectedPrompt)?.name;

    if (!selectedPromptName || selectedPromptName.trim() === "") {
      alert("Please enter or select a prompt before submitting.");
      return;
    }

    const selectedTitles =
  productTab.title?.filter((item) => item.checked) || [];

const selectedDescriptions =
  productTab.description?.filter((item) => item.checked) || [];

const selectedFeatures =
  productTab.features?.filter((item) => item.checked) || [];

if (
  selectedTitles.length === 0 &&
  selectedDescriptions.length === 0 &&
  selectedFeatures.length === 0
) {
  setSnackbarMessage(
    "Please select at least one title, description, or feature set."
  );
  setSnackbarOpen(true);
  return;
}

    const titleData = productTab.title;
    setGetTitleRewrite(titleData);
    console.log("Title Only:", productTab, getFeatures, getDescription);

   const requestPayload = {
  option: selectedPromptName,
  title: selectedTitles,
  description: selectedDescriptions,
  features: selectedFeatures,
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

        console.log("Updated Features:", selectedFeatures);

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

  useEffect(() => {
    if (productTab?.features && Array.isArray(productTab.features)) {
      setSelectedFeatures(
        productTab.features.map((featureList) => {
          return Array.isArray(featureList.value) ? [...featureList.value] : [];
        }),
      );
    }
  }, [productTab]);

  const handleAIOptions = () => {
    setAIModalOpen(true);
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
    console.log("Question clicked:", questionId);

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
          setResponseChat(apiResponse);

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
          setResponseChat(errorResponse);

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
      pathname: "/products",
      search: `?page=${currentPage}`,
    });
  };

  const handleUpdateProduct = (updatedProduct) => {
    console.log("3333111", updatedProduct);
    setProductTab(updatedProduct);
    fetchProductDetails(id);
  };

  const handleCloseAIModal = () => {
    setAIModalOpen(false);
  };

  useEffect(() => {
    fetchProductDetails(id);
  }, []);

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

    console.log("Update payload:", payload);

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/updateProductContent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.status) {
        setSnackbarMessage("Product updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        fetchProductDetails(id);
      } else {
        setSnackbarMessage("Update failed. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error updating product:", error);

      setSnackbarMessage("Something went wrong while updating the product.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id && id !== "undefined") {
      fetchProductDetails(id);
    }
  }, [id]);

  const fetchProductDetails = (id) => {
    setLoading(true);

    fetch(`${API_BASE_URL}/productDetail/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.data?.product) {
          setProduct(data.data.product);
          setMainImage(data.data.product.logo || "default_image.png");
          setProductTab({
            title: data?.data?.product?.ai_generated_title || [],
            description: data?.data?.product?.ai_generated_description || [],
            features: data?.data?.product?.ai_generated_features || [],
          });
        } else {
          console.warn("Product data not found for ID:", id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  };

  const handleAISuggestionSelect = (suggestion) => {
    setAIModalOpen(false);
  };

  const fetchAIOptions = () => {
    setAISuggestions(["AI Feature 1", "AI Feature 2", "AI Description"]);
  };

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  if (loading)
    return (
      <div style={{ marginTop: "10%" }}>
        <DotLoading />
        ...
      </div>
    );

  return (
    <Container sx={{ maxWidth: "100%", margin: "0 auto" }}>
      {/* Navigation Buttons */}
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
        {/* Left Side - Back to Products */}
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
            <Button
            variant="outlined"
            size="small"
            onClick={handleAIOptions}
            sx={{
              backgroundColor: "#f2f3ae",
              color: "black",
              textTransform: "none",
              fontSize: { xs: "12px", sm: "14px" },
              mr: 1,
            }}
          >
            Generate Content With AI
          </Button>
          {/* Prev Icon Button */}
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

          {/* Next Icon Button */}
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
        {/* Left Section: Image & Thumbnails */}
        <Grid item xs={12} md={6}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "center", sm: "flex-start" }}
            gap={2}
          >
            {/* Thumbnails - responsive orientation */}

            <Box
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
              gap={2}
              justifyContent="center"
              alignItems="flex-start"
            >
              {/* Thumbnails */}
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

              {/* Main Image with Hover Zoom using react-image-magnify */}
              <Box sx={{ width: isMobile ? "100%" : "400px" }}>
                <img
                  alt="Product Image"
                  src={mainImage || soonImg}
                  style={{
                    width: isMobile ? "100%" : "400px",
                    height: isMobile ? undefined : "300px",
                    objectFit: "contain",
                    borderRadius: "4px",
                    cursor: "zoom-in",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Section: Product Details and Tabs */}
        <Grid item xs={12} md={6}>
          {" "}
          {/* Occupies half width */}
          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
              {/* Product Title */}
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

              {/* Price Section */}
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
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {currency}
                    <span style={{ marginLeft: "4px" }}>{currentPrice}</span>
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
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {currency}
                      <span style={{ marginLeft: "4px" }}>{originalPrice}</span>
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

              {/* Category, Vendor, Brand */}
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
                  {/* <Button
                    variant="outlined"
                    sx={{
                      backgroundColor: "#f2f3ae",
                      color: "black",
                      textTransform: "none",
                      fontSize: { xs: "14px", sm: "16px" },
                    }}
                    onClick={handleAIOptions}
                    size="small"
                  >
                    Generate Content With AI
                  </Button> */}
                </Box>

                {/* Modal Component */}
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
                {/* Prompt selection or custom input */}
                {!isAddingNewPrompt ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Select
                      value={selectedPrompt}
                      onChange={handleSelectChange}
                      displayEmpty
                      size="small"
                      sx={{
                        minWidth: 180,
                        fontSize: "14px",
                        background: "#fff",
                        zIndex: 10,
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 250,
                            zIndex: 1300,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select a Prompt</em>
                      </MenuItem>
                      {promptList.map((prompt) => (
                        <MenuItem key={prompt.id} value={prompt.id}>
                          {prompt.name}
                        </MenuItem>
                      ))}
                    </Select>

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setCustomPromptModalOpen(true)}
                      sx={{ textTransform: "capitalize" }}
                    >
                      Add
                    </Button>
                  </Box>
                ) : (
                 <Box display="flex" alignItems="center" gap={1}>
  <Button
    variant="outlined"
    onClick={() => setCustomPromptModalOpen(true)}
    sx={{
      textTransform: "none",
      width: "220px",
      justifyContent: "flex-start",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
  >
    {customPrompt}
  </Button>

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

                {/* Rewrite button */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendSelectedPromptToAPI}
                  sx={{ textTransform: "capitalize" }}
                >
                  Rewrite
                </Button>

                {/* Update button */}
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
              <Modal
                open={customPromptModalOpen}
                onClose={() => setCustomPromptModalOpen(false)}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "90%", sm: 650 },
                    bgcolor: "#d8ddca",
                    borderRadius: "22px",
                    p: 2.5,
                    boxShadow: 24,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "white",
                      border: "2px solid #2563eb",
                      borderRadius: "16px",
                      p: 2,
                    }}
                  >
                    <TextareaAutosize
                      minRows={4}
                      placeholder="Please enter your prompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      style={{
                        width: "100%",
                        resize: "none",
                        border: "none",
                        outline: "none",
                        fontSize: "16px",
                        fontFamily: "inherit",
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <IconButton
                        disabled={!customPrompt.trim()}
                        onClick={() => {
                          setIsAddingNewPrompt(true);
                          setCustomPromptModalOpen(false);
                        }}
                        sx={{
                          bgcolor: "#90caf9",
                          color: "white",
                          width: 34,
                          height: 34,
                          "&:hover": {
                            bgcolor: "#64b5f6",
                          },
                          "&.Mui-disabled": {
                            bgcolor: "#ddd",
                          },
                        }}
                      >
                        <ArrowForwardIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      mt: 1.5,
                    }}
                  >
                    {[
                      "Improve writing and readability",
                      "Make the content more concise",
                      "Make the content more detailed",
                      "Optimize content for SEO and GEO",
                    ].map((text) => (
                      <Button
                        key={text}
                        size="small"
                        onClick={() => setCustomPrompt(text)}
                        sx={{
                          bgcolor: "#929786",
                          color: "white",
                          borderRadius: "18px",
                          textTransform: "none",
                          fontSize: "13px",
                          px: 1.5,
                          "&:hover": {
                            bgcolor: "#7f8574",
                          },
                        }}
                      >
                        ✦&nbsp; {text}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Modal>
              {/* Modal Component */}
              <Modal
                open={aiModalOpen}
                onClose={handleCloseAIModal}
                aria-labelledby="ai-modal-title"
                aria-describedby="ai-modal-description"
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: 280, sm: 300 },
                    height: { xs: 280, sm: 300 },
                    bgcolor: "background.paper",
                    border: "2px solid #000",
                    boxShadow: 24,
                    p: 2,
                    borderRadius: "8px",
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
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Left Side - Product Features and Description */}
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
          {/* 🔹 Product Description First */}
          <Card sx={{ maxWidth: 510, mb: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ cursor: "pointer", px: 2, py: 1 }}
              onClick={() => setShowDescription((prev) => !prev)}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: "18px", fontWeight: 600 }}
              >
                Description
              </Typography>
              <IconButton size="large">
                {showDescription ? <ExpandLessIcon /> : <AddIcon />}
              </IconButton>
            </Box>

            <Divider />

            {showDescription && (
              <CardContent sx={{ pt: 1, pb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "16px",
                    color: product?.long_description ? "inherit" : "gray",
                    whiteSpace: "pre-line",
                    textAlign: "justify",
                  }}
                >
                  {product?.long_description || "No description available."}
                </Typography>
              </CardContent>
            )}
          </Card>

          {/* 🔹 Product Features Next */}
          <Box sx={{ maxWidth: "510px", marginTop: "20px" }}>
            <Card sx={{ maxWidth: 510, boxShadow: 2, mb: 2 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ cursor: "pointer", px: 2, py: 1 }}
                onClick={() => setShowFeatures((prev) => !prev)}
              >
                <Typography
                  variant="h6"
                  sx={{ fontSize: "18px", fontWeight: 600 }}
                >
                  Features
                </Typography>
                <IconButton size="large">
                  {showFeatures ? <ExpandLessIcon /> : <AddIcon />}
                </IconButton>
              </Box>
              <Divider />
              {showFeatures && (
                <CardContent sx={{ pt: 1, pb: 2 }}>
                  <List
                    sx={{
                      "& a": {
                        color: "blue !important",
                        textDecoration: "underline",
                      },
                      "& a:visited": {
                        color: "blue !important",
                      },
                      "& a:hover": {
                        color: "darkblue !important",
                      },
                    }}
                  >
                    {product?.features && product.features.length > 0 ? (
                      product.features.map((feature, index) => (
                        <ListItem key={index} sx={{ padding: "4px 0" }}>
                          <Typography sx={{ fontSize: "16px" }}>
                            {/<a|<img/.test(feature) ? (
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: feature.replace(
                                    /<img /g,
                                    '<img style="width: 500px; display: block; margin: 10px 0;" ',
                                  ),
                                }}
                              />
                            ) : (
                              `• ${feature}`
                            )}
                          </Typography>
                        </ListItem>
                      ))
                    ) : (
                      <Typography sx={{ fontSize: "16px", color: "gray" }}>
                        No features available
                      </Typography>
                    )}
                  </List>
                  <Box mt={2}>
                    {product?.pdfUrl && (
                      <a
                        href={product.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "16px",
                          textDecoration: "underline",
                          color: "blue",
                        }}
                      >
                        View the PDF
                      </a>
                    )}
                  </Box>
                </CardContent>
              )}
            </Card>
          </Box>
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
            {/* <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1}>



</Box> */}

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
              {/* Tab feilds */}

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
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {productTab.title.map((title, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.2s ease-in-out",
                            gap: 1,
                          }}
                        >
                          {editMode.title && selectedEditIndex === index ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                width: "100%",
                              }}
                            >
                              <TextField
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                size="small"
                                multiline
                                minRows={2}
                                maxRows={6}
                              />
                              <IconButton
                                onClick={() => handleSaveClick("title")}
                              >
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
                          ) : (
                            <>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  flexGrow: 1,
                                }}
                              >
                                <FormControlLabel
                                  value={title.value}
                                  control={
                                    <Radio
                                      checked={title.checked === true}
                                      onClick={() => {
                                        const isCurrentlyChecked =
                                          title.checked === true;
                                        const updatedTitles =
                                          productTab.title.map((t, i) =>
                                            i === index
                                              ? {
                                                  ...t,
                                                  checked: !isCurrentlyChecked,
                                                }
                                              : { ...t, checked: false },
                                          );
                                        setProductTab({
                                          ...productTab,
                                          title: updatedTitles,
                                        });
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography variant="body1">
                                      {title.value}
                                    </Typography>
                                  }
                                />
                              </Box>
                              <IconButton
                                onClick={() => {
                                  handleEditClickTitle("title", index);
                                }}
                                sx={{
                                  opacity: title.checked ? 1 : 0.3,
                                  transition: "opacity 0.2s ease-in-out",
                                  pointerEvents: title.checked
                                    ? "auto"
                                    : "none",
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "48px",
                      transition: "all 0.2s ease-in-out",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "16px",
                        color: "text.secondary",
                        fontStyle: "italic",
                        textAlign: "center",
                      }}
                    >
                      No title available
                    </Typography>
                  </ListItem>
                )}
              </TabPanel>

              <TabPanel value={tabIndex} index={1}>
                <Box>
                  {Array.isArray(productTab?.features) &&
                  productTab.features.length > 0 ? (
                    productTab.features.map((featureObj, listIndex) => {
                      const featureList = Array.isArray(featureObj.value)
                        ? featureObj.value
                        : [];
                      return (
                        <Box key={listIndex} sx={{ marginBottom: 2 }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{ width: "100%" }}
                          >
                            <FormControlLabel
                              value={listIndex}
                              control={
                                <Radio
                                  checked={
                                    productTab.features[listIndex]?.checked ===
                                    true
                                  }
                                  onClick={() => {
                                    const isCurrentlyChecked =
                                      productTab.features[listIndex]
                                        ?.checked === true;
                                    const updatedFeatures =
                                      productTab.features.map((f, i) =>
                                        i === listIndex
                                          ? {
                                              ...f,
                                              checked: !isCurrentlyChecked,
                                            }
                                          : { ...f, checked: false },
                                      );
                                    setProductTab({
                                      ...productTab,
                                      features: updatedFeatures,
                                    });
                                  }}
                                />
                              }
                              label={
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Feature Set {listIndex + 1}
                                </Typography>
                              }
                              sx={{ marginRight: 2 }}
                            />
                            <Box
                              sx={{
                                ml: "auto",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {editMode.features &&
                              editingSetIndex === listIndex ? (
                                <>
                                  <IconButton onClick={handleSaveClickFeatures}>
                                    <SaveIcon />
                                  </IconButton>
                                  <IconButton onClick={handleCancelFeatures}>
                                    <CancelIcon />
                                  </IconButton>
                                </>
                              ) : (
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
                                  sx={{
                                    opacity: productTab.features[listIndex]
                                      ?.checked
                                      ? 1
                                      : 0.3,
                                    transition: "opacity 0.2s ease-in-out",
                                    pointerEvents: productTab.features[
                                      listIndex
                                    ]?.checked
                                      ? "auto"
                                      : "none",
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                          {featureList.map((feature, featureIndex) => (
                            <Box
                              key={featureIndex}
                              sx={{
                                marginBottom: 1,
                                marginLeft: "3px",
                                maxWidth: "90ch",
                                overflowWrap: "break-word",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {editMode.features &&
                              editingSetIndex === listIndex ? (
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
                                      e.target.value,
                                    )
                                  }
                                  label={`Feature ${featureIndex + 1}`}
                                  fullWidth
                                  variant="outlined"
                                  margin="normal"
                                  size="small"
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
                        </Box>
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
              </TabPanel>

              <TabPanel value={tabIndex} index={2}>
                {productTab?.description?.length > 0 ? (
                  <RadioGroup>
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
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            transition: "all 0.2s ease-in-out",
                            gap: 1,
                          }}
                        >
                          {editMode.description &&
                          selectedEditIndex === index ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                width: "100%",
                                maxWidth: "550px",
                              }}
                            >
                              <TextareaAutosize
                                value={editedDescription}
                                onChange={(e) =>
                                  setEditedDescription(e.target.value)
                                }
                                placeholder="Edit Description"
                                minRows={3}
                                style={{
                                  width: "100%",
                                  fontSize: "16px",
                                  padding: "10px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                  fontFamily:
                                    "Roboto, Helvetica, Arial, sans-serif",
                                  resize: "vertical",
                                  whiteSpace: "pre-line",
                                  textAlign: "justify",
                                }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  alignItems: "flex-start",
                                  mt: 0,
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
                            </Box>
                          ) : (
                            <>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  flexGrow: 1,
                                }}
                              >
                                <FormControlLabel
                                  value={descValue}
                                  control={
                                    <Radio
                                      checked={desc.checked === true}
                                      onClick={() => {
                                        if (desc.checked) {
                                          handleDescriptionChange({
                                            target: { value: null },
                                          });
                                        } else {
                                          handleDescriptionChange({
                                            target: { value: descValue },
                                          });
                                        }
                                      }}
                                      sx={{
                                        alignSelf: "flex-start",
                                        mt: "3px",
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: "16px",
                                        whiteSpace: "pre-line",
                                        textAlign: "justify",
                                      }}
                                    >
                                      {descValue}
                                    </Typography>
                                  }
                                  sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    alignItems: "flex-start",
                                    margin: 0,
                                  }}
                                />
                              </Box>
                              {/* Edit icon aligned to top-right */}
                              <Box
                                sx={{
                                  ml: "auto",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
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
                                  sx={{
                                    opacity: desc.checked ? 1 : 0.3,
                                    transition: "opacity 0.2s ease-in-out",
                                    pointerEvents: desc.checked
                                      ? "auto"
                                      : "none",
                                    alignSelf: "flex-start",
                                    mt: "2px",
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Box>
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

      {/* Chatbot UI */}
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
            width: isMaximized ? defaultWidth : defaultWidth,
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
          {/* Header */}
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
              {/* Minimize Button */}
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

              {/* Maximize Button */}
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

              {/* Close Button */}
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

          {/* Chat Body */}
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
            {/* Display Chat Messages */}
            {/* {data && data.length > 0 && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Frequently Asked Questions:
              </Typography>
              {data.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    backgroundColor: '#f9f9f9',
                    padding: '8px',
                    borderRadius: '5px',
                    marginTop: '5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  
                  <Typography variant="body2">{item.question}</Typography>
                  <IconButton sx={{ padding: 0 }} onClick={() => handleQuestionClick(item.id)}>
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )} */}

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

            {/* Bot Typing Indicator */}
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

            {/* Scroll to bottom reference */}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Box */}
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
              <SendIcon sx={{ fontSize: 18 }} /> {/* 👈 Smaller icon */}
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
