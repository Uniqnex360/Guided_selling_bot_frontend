// import React from "react";
// import { Grid, Typography, Tabs, Tab, Box, Paper } from "@mui/material";

// function Example() {
//   const [tabIndex, setTabIndex] = React.useState(0);

//   const handleTabChange = (event, newValue) => {
//     setTabIndex(newValue);
//   };

//   return (
//     <Box sx={{ p: 2 }}>
//       {/* Top Section */}
//       <Grid container spacing={2}>
//         <Grid item xs={12} md={5}>
//           <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
//             <img
//               src="/assets/product.png"
//               alt="Product"
//               style={{ width: "100%", height: "auto", maxHeight: 400, objectFit: "contain" }}
//             />
//           </Paper>
//         </Grid>

//         <Grid item xs={12} md={7}>
//           <Paper elevation={3} sx={{ p: 2 }}>
//             <Typography variant="h4" gutterBottom>
//               Product Title
//             </Typography>
//             <Typography variant="subtitle1">Price: ₹4,999</Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//               Short product description goes here.
//             </Typography>
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* Bottom Section */}
//    {/* Bottom Section */}
// <Grid container spacing={2} sx={{ mt: 2 }}>
//   {/* Left Side - Features and Description */}
//   <Grid item xs={12} md={6}>
//     <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
//       <Typography variant="h6">Features</Typography>
//       <ul style={{ marginTop: 8 }}>
//         <li>Durable material</li>
//         <li>Elegant design</li>
//         <li>1-year warranty</li>
//       </ul>

//       <Typography variant="h6" sx={{ mt: 2 }}>
//         Description
//       </Typography>
//       <Typography
//   variant="body2"
//   sx={{
//     wordBreak: "break-word",
//     whiteSpace: "pre-line",
//     overflowWrap: "break-word",
//   }}
// >
//   This product is crafted with precision and built to last. Suitable for home and office for home anfor home anfor home anuse.
// </Typography>

//     </Paper>
//   </Grid>

//   {/* Right Side - Tabs */}
//   <Grid item xs={12} md={6}>
//     <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
//       <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
//         <Tab label="Title" />
//         <Tab label="Features" />
//         <Tab label="Description" />
//       </Tabs>

//       <Box sx={{ mt: 2 }}>
//   {tabIndex === 0 && (
//     <Typography
//       sx={{
//         wordBreak: "break-word",
//         whiteSpace: "pre-line",
//         overflowWrap: "break-word",
//       }}
//     >
//       Product Title Tab Content Product Title Tab Content Product Title Tab Content
//     </Typography>
//   )}
//   {tabIndex === 1 && (
//     <ul>
//       <li>Feature A</li>
//       <li>Feature B</li>
//       <li>Feature C</li>
//     </ul>
//   )}
//   {tabIndex === 2 && (
//     <Typography
//       sx={{
//         wordBreak: "break-word",
//         whiteSpace: "pre-line",
//         overflowWrap: "break-word",
//       }}
//     >
//       Full product description with technical details and use cases for different environments.
//     </Typography>
//   )}
// </Box>

//     </Paper>
//   </Grid>
// </Grid>

//     </Box>
//   );
// }

// export default Example;


import {
  Box,
  Typography,
  Button,
  IconButton,
  Rating,
  MenuItem,
  TextField,
  useMediaQuery, Tabs, Tab, Paper, Container, Grid,RadioGroup, Tooltip,Radio, FormControlLabel, Checkbox, Badge,  Modal, List, ListItem, CircularProgress,  Divider, Link,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import React, { useState, useEffect, useRef } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useFetcher, useParams } from 'react-router-dom';
import CardMedia from '@mui/material/CardMedia';
import { styled } from '@mui/material/styles';
import FetchApi from './FetchApi';
import EditIcon from '@mui/icons-material/Edit'; // Import the Edit icon
import SaveIcon from '@mui/icons-material/Save'; // Import Save icon
import MinimizeOutlinedIcon from '@mui/icons-material/MinimizeOutlined';
import MaximizeOutlinedIcon from '@mui/icons-material/MaximizeOutlined';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import CancelIcon from '@mui/icons-material/Cancel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import soonImg from "../assets/soon-img.png";
import { useNavigate, useLocation } from "react-router-dom";
import SendIcon from '@mui/icons-material/Send';

import DotLoading from '../Loading/DotLoading';
import { API_BASE_URL } from "../../utils/config";
// function Example() {


const Example = () => {
  const [tabIndex, setTabIndex] = React.useState(0);
  const navigate = useNavigate();
    
    const location = useLocation();
      const [product, setProduct] = useState(null);
      const [loading, setLoading] = useState(true);
      const [loadingQuestion, setLoadingQuestion] = useState(true);
     // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const [isAddingNewPrompt, setIsAddingNewPrompt] = useState(false);
  
      const [chatOpen, setChatOpen] = useState(false);
      const [messages, setMessages] = useState([]);
      const [userMessage, setUserMessage] = useState('');
      const [aiSuggestions, setAISuggestions] = useState([]);
      const [aiModalOpen, setAIModalOpen] = useState(false);
      const { id } = useParams();
      const [productTab, setProductTab] = useState({
        title: [],
        description: [],
        features: [],
      });
      // const [productTab, setProductTab] = useState('');
      const [selectedTitles, setSelectedTitles] = useState([]);
      const [selectedDescriptions, setSelectedDescriptions] = useState([]);
      const [responseChat, setResponseChat] = useState('')
      const messagesEndRef = useRef(null); // Reference for the end of the chat messages
      const [isBotTyping, setIsBotTyping] = useState(false); // State for bot typing indicator
      const currentPrice = product?.list_price;
      const originalPrice = product?.was_price;
      const discountPercentage = product?.discount;
      const [selectedDescription, setSelectedDescription] = useState("");
      const [selectedPrompt, setSelectedPrompt] = useState('');
  const [promptList, setPromptList] = useState([]);
  const [showCustomPromptInput, setShowCustomPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
       const [selectedFeatureSetIndex, setSelectedFeatureSetIndex] = useState(0); // To track selected feature set
      const [selectedFeatures, setSelectedFeatures] = useState(productTab?.features || []);
    // State for the updated title, features, and description
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateFeatures, setUpdateFeatures] = useState([]);
  const [updateDescription, setUpdateDescription] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState(productTab?.description || []);
   // State for Title Tab (managed within TitleTab)
   const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // or error, info
   const [selectedTitleIndex, setSelectedTitleIndex] = useState(null);
    const [editedTitle, setEditedTitle] = useState(''); // Likely managed in TitleTab
    const [editModeTitle, setEditModeTitle] = useState(false); // Likely managed in TitleTab
    const [getTitle, setGetTitle] = useState([]);
    const [getFeatures, setGetFeatures] = useState([]);
    const [getDescription, setGetDescription] = useState([]);
    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);
    const [selectedFeatureValue, setSelectedFeatureValue] = useState("");
  const [editingSetIndex, setEditingSetIndex] = useState(null);
  const [editingFeatures, setEditingFeatures] = useState([]);
    const [getRewriteDescription, setGetRewriteDescription] = useState([]);
    
    const [editedValueDec, setEditedValueDec] = useState([]);
    const [editValueFeatures, setEditValueFeatures] = useState([]);
  
    const [finalTitle, setFinalTitle] = useState('');
  const [finalDescription, setFinalDescription] = useState('');
    const [editModeDescription, setEditModeDescription] = useState(false); // Likely managed in DescriptionTab
    const queryParams = new URLSearchParams(location.search);
    const currentPage = queryParams.get('page') || 0;
    const isMobile = useMediaQuery("(max-width:600px)");
  const [mainImage, setMainImage] = useState(product?.images?.[0] || soonImg);

    const { searchQuery } = location.state || {};
    console.log("searchQuery-Details:", searchQuery);
    const [productIds, setProductIds] = useState([]);
    
      const [editMode, setEditMode] = useState({
        title: false,
        features: false,
        description: false,
      });
      const currency = product?.currency || '$'; // Default to $ if currency is not available
      const [selectedTitle, setSelectedTitle] = useState("");
      const [data, setData] = useState([]); // to hold the fetched questions
      
      // Minimize
      const [editValueTitle, seteditValueTitle] = useState("");
   
  
      const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedEditIndex, setSelectedEditIndex] = useState(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');

  
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };





  const handleBackClick = () => {
    navigate({
      pathname: '/',
      search: `?page=${currentPage}`
    });
  };
  













  
  // Custom Typography for product details labels
  const DetailLabel = styled(Typography)(({ theme }) => ({
      fontWeight: 600, // Semi-bold for better emphasis
      fontSize: '0.9rem', // Slightly larger than body text
      color: theme.palette.text.secondary, // Muted color
      marginRight: theme.spacing(1),
  }));
  
  // Custom Typography for product details values
  const DetailValue = styled(Typography)(({ theme }) => ({
      fontSize: '0.9rem',
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
              {value === index && (
                  <Box sx={{ pt: 2 }}>
                      {children}
                  </Box>
              )}
          </div>
      );
  }
  
  function a11yProps(index) {
      return {
          id: `product-tab-${index}`,
          'aria-controls': `product-tabpanel-${index}`,
      };
  }
  
  
  
  // const currentIndex = productIds.findIndex(
  //   (pid) => pid.toString() === id.toString()
  // );
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/productList/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category_id: '',
        search_query: ''
   
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        const ids = responseData.data.products.map((item) => item.id);
        setProductIds(ids);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching product data:', error);
        setLoading(false);
      });
  };
  
  // Get current index **after** productIds is available
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
    const checkedFeatureSet = productTab?.features?.findIndex(f => f?.checked);
    if (checkedFeatureSet !== -1) {
      setSelectedFeatureSetIndex(checkedFeatureSet);
    }
  }, [productTab?.features]);
  
  
  const handleFeatureSetSelect = (e, index) => {
    setSelectedFeatureSetIndex(index);
    setEditingSetIndex(null); // Reset any edit mode
  
    const updatedFeatures = productTab.features.map((set, i) => ({
      ...set,
      checked: i === index,
    }));
  
    handleLocalUpdate({ features: updatedFeatures });
  };
  
  
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
          checked: true, // ✅ Only edited one is checked
        };
      } else {
        return {
          ...feature,
          checked: false, // ✅ Others must be unchecked
        };
      }
    });
  
    const updatedProductTab = {
      ...productTab,
      features: updatedFeatures,
    };
  
    setProductTab(updatedProductTab);
    setGetFeatures(updatedFeatures); // optional but helpful for local getFeatures
    setEditMode({ ...editMode, features: false });
    setEditingSetIndex(null);
    setSelectedFeatureSetIndex(editingSetIndex); // ✅ Reflect the checked one as selected
  console.log('oppo',updatedFeatures)
  setEditValueFeatures(updatedFeatures)
  
    if(updatedFeatures){
  
        fetch(`${API_BASE_URL}/updategeneratedContent/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: id,
           
            features: updatedFeatures, // replace with getFeatures if needed
            
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Save success:', data);
            // Optionally show success snackbar or update UI
          })
          .catch((error) => {
            console.error('Save error:', error);
            // Optionally show error snackbar
          })
          .finally(() => {
            setLoading(false);
          });
        }
    
  };
  
  
  const handleCancelFeatures = () => {
    setEditingSetIndex(null);
    setEditMode({ ...editMode, features: false });
  
    // Reset editingFeatures so we don’t retain edited values
    const checkedFeature = productTab.features.find((f) => f.checked);
    const featuresCopy = productTab.features.map(set => [...set.value]);
    setEditingFeatures(featuresCopy);
  
    const checkedIndex = productTab.features.findIndex(f => f.checked);
    setSelectedFeatureSetIndex(checkedIndex !== -1 ? checkedIndex : null);
  };
  
  
  
  
  const handleEditClickFeatures = (featureIndex) => {
    setSelectedFeatureIndex(featureIndex);
    const featureValue = productTab.features[selectedFeatureSetIndex]?.value[featureIndex];
    setSelectedFeatureValue(featureValue || '');
  };
  
  
  const handleFeatureSetChange = (event, listIndex) => {
    const updatedSelectedFeatures = [...selectedFeatures];
    if (event.target.checked) {
      // Select all features in this feature set
      updatedSelectedFeatures[listIndex] = productTab.features[listIndex].map((_, featureIndex) => featureIndex);
    } else {
      // Deselect all features in this feature set
      updatedSelectedFeatures[listIndex] = [];
    }
    setSelectedFeatures(updatedSelectedFeatures);
  };
  
  const handleLocalUpdate = (updatedFields) => {
    const updatedProductTab = {
      ...productTab,
      ...updatedFields,
    };
  
    console.log('Local state updated with:', updatedProductTab);
  
    // ✅ Handle description
    const checkedDescription = updatedProductTab.description?.find(desc => desc.checked);
    setGetDescription(checkedDescription ? checkedDescription.value : '');
  
    // ✅ Handle title and features
    setGetTitle(updatedProductTab.title || []);
    setGetFeatures(updatedProductTab.features || []);
    setGetRewriteDescription(updatedProductTab.description || []);
  
  
    // ✅ Update the entire productTab state
    setProductTab(updatedProductTab);
  };
  
  
  const handleDescriptionChange = (event) => {
    const value = event.target.value;
    setSelectedDescription(value);
    setEditedDescription(value);
  
    // Update the descriptions and mark the selected one as checked
    const updatedDescriptions = productTab.description.map((desc) => ({
      ...desc,
      checked: desc.value === value,
    }));
  
    // Update local product tab state
    handleLocalUpdate({ description: updatedDescriptions });
  
    // Get only the checked value
    const selectedChecked = updatedDescriptions.find(desc => desc.checked);
    const longDescription = selectedChecked ? selectedChecked.value : '';
  
    // Set to state
    setUpdateDesc(longDescription);
  
    console.log('✅ Selected Description:', longDescription);
  };
  
  
  const handleSaveClickDescription = () => {
    const updatedDescriptions = [...productTab.description];
  
    // Update the selected index with edited value and set checked true
    updatedDescriptions[selectedEditIndex] = {
      ...updatedDescriptions[selectedEditIndex],
      value: editedDescription.trim(), // Optional: Trim whitespace
      checked: true,
    };
  
    // Update the state with new descriptions
    setProductTab((prev) => ({
      ...prev,
      description: updatedDescriptions,
    }));
    setGetRewriteDescription(updatedDescriptions)
    setEditedValueDec(updatedDescriptions)
  console.log('query one',updatedDescriptions)
    // Filter out only checked descriptions
    const checkedDescriptions = updatedDescriptions.filter(item => item.checked);
  
    // Extract values and join them into a single string
    const longDescription = checkedDescriptions.map(item => item.value).join('\n\n');
  
    // Set the final long description into state
    setUpdateDesc(longDescription);
  
    // Close edit mode
    setEditMode({ ...editMode, description: false });
    setSelectedEditIndex(null);
    if(updatedDescriptions){
      fetch(`${API_BASE_URL}/updategeneratedContent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: id,
         
          description: updatedDescriptions,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Save success:', data);
          // Optionally show success snackbar or update UI
        })
        .catch((error) => {
          console.error('Save error:', error);
          // Optionally show error snackbar
        })
        .finally(() => {
          setLoading(false);
        });
      }
    
    // Debug log
    console.log('✅ Final Long Description:', longDescription);
  };
  
  
  const handleSaveClick = (type) => {
    if (type === 'title') {
      // 1. Update the specific title using index
      const updatedTitles = productTab.title.map((title, index) =>
        index === selectedEditIndex
          ? { ...title, value: editedTitle }
          : title
      );
  
      // 2. Update the state for display or local changes
      handleLocalUpdate({ ...productTab, title: updatedTitles });
  
      // 3. Set the updated list to another state (for API)
      seteditValueTitle(updatedTitles);
  console.log('0000',updatedTitles)
      // 4. Find the checked title's updated value
      const checkedTitle = updatedTitles.find(t => t.checked)?.value || '';
  
      // 5. Send only that checked+edited value to API
      if (updatedTitles) {
     
          fetch(`${API_BASE_URL}/updategeneratedContent/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_id: id,
              title: updatedTitles,
            
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Save success:', data);
              // Optionally show success snackbar or update UI
            })
            .catch((error) => {
              console.error('Save error:', error);
              // Optionally show error snackbar
            })
            .finally(() => {
              setLoading(false);
            });
          }
        };
      
  
      // 6. Close edit state
      setSelectedTitle(editedTitle);
      setEditMode({ ...editMode, title: false });
      setSelectedEditIndex(null);
    }
  
  
  
  const handleTitleChange = (index) => {
    setSelectedTitleIndex(index);
  
    // Update the checked property for each title
    const updatedTitles = productTab.title.map((title, idx) => ({
      ...title,
      checked: idx === index,
    }));
  
    // Assuming handleLocalUpdate updates the productTab state
    handleLocalUpdate({ title: updatedTitles });
  
    console.log('oppo',updateTitle)
  };
  
  
  
  
  useEffect(() => {
    const checkedTitle = productTab?.title?.find(title => title?.checked);
    if (checkedTitle) {
      setSelectedTitle(checkedTitle.value);
    } else if (productTab?.title?.length > 0) {
      setSelectedTitle(productTab.title[0].value); // fallback to first
    }
  }, [productTab?.title]);
  
  
  // Title select
  
  useEffect(() => {
    const checkedTitle = productTab?.title?.find(title => title?.checked);
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
    // handleBackendUpdate({ title: updatedTitles });
  };
  
  
  
  const handleEditClickTitle = (type, index) => {
    setEditMode({ ...editMode, [type]: true });
    setSelectedEditIndex(index);
    if (type === 'title' && productTab?.title?.[index]?.value) {
      setEditedTitle(productTab.title[index].value); // Set the edited title
      setSelectedTitle(productTab.title[index].value); // Preserve selected title
    }
  };
  
  
  
  
  useEffect(() => {
    // Initialize selectedDescription with the checked value on mount
    const checkedDescription = productTab?.description?.find(desc => desc?.checked);
    if (checkedDescription) {
      setSelectedDescription(checkedDescription.value);
    }
  }, [productTab?.description]);
  
  
  const handleLocalUpdateDescription = (updatedProductTab) => {
    console.log('Local state updated with:', updatedProductTab);
  
    // Get the selected title based on checked item
    const selectedTitle = updatedProductTab.title.find(item => item.checked)?.value || '';
    setFinalTitle(selectedTitle);
  
    // Get the selected description based on checked item
    const selectedDescription = updatedProductTab.description.find(item => item.checked)?.value || '';
    setFinalDescription(selectedDescription);
  };
  
  
  const handleEditClickDescription = (index) => {
    setEditMode({ ...editMode, description: true });
    setSelectedEditIndex(index);
    const currentValue = productTab?.description?.[index]?.value || '';
    setEditedDescription(currentValue);
  };
  
   
  
    const handleMinimize = () => {
      setIsMinimized(true);
      setIsMaximized(false); // Reset maximize when minimized
    };
  
    // Handle maximize action
    const handleMaximize = () => {
      setIsMaximized(true);
      setIsMinimized(false); // Reset minimize when maximized
    };
  
  
    // Handle restore window size
    const handleRestore = () => {
      setIsMaximized(false);
      setIsMinimized(false);
    };
  
      // Initialize selectedFeatures once productTab.features is available
      useEffect(() => {
        if (Array.isArray(productTab?.features)) {
          // Initialize selectedFeatures as an empty array for each feature set
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
          setPromptList(data.data); // ✅ Correctly setting prompt list
        }
      } catch (error) {
        console.error('Error fetching prompt list:', error);
      }
    };
  
    fetchPromptList();
  }, []);
  
  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === '__add_new__') {
      setIsAddingNewPrompt(true);
      setSelectedPrompt('');
    } else {
      setSelectedPrompt(value);
      setIsAddingNewPrompt(false);
    }
  };
  
  const sendSelectedPromptToAPI = async () => {
    const selectedPromptName = isAddingNewPrompt
      ? customPrompt
      : promptList.find((p) => p.id === selectedPrompt)?.name;
  
    if (!selectedPromptName || selectedPromptName.trim() === '') {
      alert('Please enter or select a prompt before submitting.');
      return;
    }
  
    const isTitleEmpty = !getTitle || getTitle.length === 0;
    const isDescriptionEmpty = !getRewriteDescription || getRewriteDescription.length === 0;
    const isFeaturesEmpty = !getFeatures || getFeatures.length === 0;
  
    if (isTitleEmpty && isDescriptionEmpty && isFeaturesEmpty) {
      setSnackbarMessage('Please provide at least one of title, description, or features!');
      setSnackbarOpen(true);
      return;
    }
  
    const requestPayload = {
      option: selectedPromptName,
      title: getTitle || '',
      description: getRewriteDescription || '',
      features: getFeatures || '',
      product_id: id,
    };
  
    try {
      const response = await fetch(
        `${API_BASE_URL}/regenerateAiContents/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        }
      );
  
      const result = await response.json();
  
      if (result.status) {
        const updatedTitle = result.data?.title || [];
        const updatedDescription = result.data?.description || [];
        const updatedFeaturesRes = result.data?.features || [];
  
        setProductTab({
          title: updatedTitle,
          description: updatedDescription,
          features: updatedFeaturesRes,
        });
  
        const selectedTitle = updatedTitle.find((item) => item?.checked)?.value || '';
        setGetTitle(selectedTitle);
  
        const selectedDescription = updatedDescription.find((item) => item?.checked)?.value || '';
        setUpdateDesc(selectedDescription);
    // const updatedFeatures = updatedFeaturesRes
    //   .filter((item) => item?.checked)
    //   .flatMap((item) => item.value); // flatten the array of arrays
      setGetFeatures(result.data.features)
        console.log('Updated productTab11111:', result.data.features);
        setSnackbarMessage('AI content Rewrite successfully!');
      } else {
        setSnackbarMessage(result.message || 'Failed to regenerate AI content.');
      }
    } catch (error) {
      console.error('Error sending data to API:', error);
      setSnackbarMessage('Something went wrong. Please try again.');
    }
  
    setSnackbarOpen(true);
  };
  
  
  
    
      // Handle the dropdown selection and trigger POST request
   
    
      
      useEffect(() => {
        if (productTab?.features && Array.isArray(productTab.features)) {
          setSelectedFeatures(
            productTab.features.map((featureList) => {
              // Ensure featureList.value is an array, if it's not, default it to an empty array.
              return Array.isArray(featureList.value) ? [...featureList.value] : [];
            })
          );
        }
      }, [productTab]);
      
      const handleAIOptions = () => {
          setAIModalOpen(true);
      };
  
  // Chat pot
  
  const toggleChat = () => setChatOpen(!chatOpen);
  
  useEffect(() => {
      if (chatOpen && id) {
        setLoadingQuestion(true);
        fetch(`${API_BASE_URL}/fetchProductQuestions/${id}`)
          .then((response) => response.json())
          .then((responseData) => {
            setData(responseData.data); // Setting fetched data
            setLoadingQuestion(false);
          })
          .catch((error) => {
            console.error('Error fetching product details:', error);
            // setLoading(false);
          });
      }
    }, [chatOpen, id]);
  
  
  
  const handleQuestionClick = (questionId) => {
      console.log("Question clicked:", questionId);
      // Example: Send the clicked question as a message
      const question = data.find((item) => item.id === questionId);
      if (question) {
          setMessages([...messages, { sender: 'user', text: question.question }]);
          sendMessageToAPI(question.question);
      }
  };
  
  const sendMessageToAPI = (messageText) => {
      const requestPayload = {
        message: messageText,
        product_id: id,
      };
  
      // Show the bot typing indicator
      setIsBotTyping(true);
  
      // Simulate delay before API call
      setTimeout(() => {
        fetch('${API_BASE_URL}/chatbotView/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        })
          .then((response) => response.json())
          .then((data) => {
            const apiResponse = data?.data?.response || 'Sorry, I couldn\'t understand your query.';
            setResponseChat(apiResponse);  // Store the API response
  
            // Append the API response to messages
            const newMessages = [
              ...messages,
              { sender: 'user', text: messageText },
              { sender: 'chatbot', text: apiResponse },
            ];
            setMessages(newMessages);
  
            setIsBotTyping(false);  // Hide the typing indicator
          })
          .catch((error) => {
            console.error('Error sending message to API:', error);
  
            // Fallback response if there's an error
            const errorResponse = 'Something went wrong. Please try again.';
            setResponseChat(errorResponse);  // Fallback response
  
            const newMessages = [
              ...messages,
              { sender: 'user', text: messageText },
              { sender: 'chatbot', text: errorResponse },
            ];
            setMessages(newMessages);
  
            setIsBotTyping(false);  // Hide the typing indicator on error
          });
      }, 1000);  // Simulate a slight delay before the API call
    };
  
  const handleSendMessage = () => {
      if (userMessage.trim() !== "") {
        const newMessages = [...messages, { sender: 'user', text: userMessage }];
        setMessages(newMessages);  // Add user message
        sendMessageToAPI(userMessage); // Send the user message to API
        setUserMessage(""); // Clear the input field after sending
      }
    };
  
      // Scroll to bottom of the chat when new messages are added
      useEffect(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, [messages]);
   
    
      const handleUpdateProduct = (updatedProduct) => {
          console.log('3333111',updatedProduct)
          setProductTab(updatedProduct); // Update the product details in parent component
      };
  
      const handleCloseAIModal = () => {
          setAIModalOpen(false);
      };
   
  
      useEffect(() => {
        fetchProductDetails(id);
      }, []); // Empty dependency array means it runs only once after initial render
  
      const handleUpdateProductTotal = async () => {
        const selectedTitleFinal = Array.isArray(getTitle) && getTitle.find(item => item.checked)?.value || '';
      
        
        // ✅ Extract the features with checked: true
        const selectedFeatures = Array.isArray(getFeatures)
          ? getFeatures.find(item => item.checked)?.value || []
          : [];
      
        console.log('getTitle:', selectedFeatures);
      
        console.log('selectedFeatures:', selectedFeatures);
      
        setLoading(true);
      
        try {
          const response = await fetch(`${API_BASE_URL}/updateProductContent/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              product_id: id,
              product_obj: {
                product_name: selectedTitleFinal || selectedTitle,
                long_description: updateDesc ,
                features: selectedFeatures // ✅ Only send the checked set's value
              }
            })
          });
      
          const data = await response.json();
          console.log('Update response:', data);
          if (data?.status) {
            // ✅ Show success message in green
            setSnackbarMessage('Product updated successfully!');
  setSnackbarSeverity('success');
  setSnackbarOpen(true);
  
            setSnackbarOpen(true);
            fetchProductDetails(id); // Refresh data after save
          } else {
            setSnackbarMessage('Update failed. Please try again.');
            setSnackbarOpen(true);
          }
      
        } catch (error) {
          console.error('Error updating product:', error);
          setSnackbarMessage('Something went wrong while updating the product.');
          setSnackbarOpen(true);
        } finally {
          setLoading(false);
        }
      };
  
      useEffect(() => {
        if (id && id !== 'undefined') {
          fetchProductDetails(id);
        }
      }, [id]);
      
      // Function to fetch product details
      const fetchProductDetails = (id) => {
        setLoading(true);
      
        fetch(`${API_BASE_URL}/productDetail/${id}`)
          .then((response) => response.json())
          .then((data) => {
            if (data?.data?.product) {
              setProduct(data.data.product);
              setMainImage(data.data.product.logo || 'default_image.png');
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
          setAISuggestions(['AI Feature 1', 'AI Feature 2', 'AI Description']);
      };
  
      if (loading) return <div style={{marginTop:'10%'}}><DotLoading/>...</div>;
      // if (error) return <div>{error}</div>;
    
  











  return (
    <Box p={2}>

<Box
  mb={2}
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mt: 2,
    flexWrap: 'wrap',
  }} 
>
  {/* Left Side - Back to Products */}
  <Box>
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={handleBackClick}
      sx={{ fontSize:'16px', textTransform: 'none' }}
    >
      Back to Products
    </Button>
  </Box>

  {/* Right Side - Prev and Next Buttons */}
  <Box sx={{ display: 'flex', gap: 2 }}>
  {/* Prev Button */}
  <Button
    variant="contained"
    onClick={handlePrevious}
    disabled={currentIndex === 0}
    startIcon={<ArrowBackIcon />}
    size="small"
    sx={{
      bgcolor: '#fbc02d',
      color: 'white',
      borderRadius: '30px',
      px: 1.5,
      py: 0.5,
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      minHeight: '32px',
      '&:hover': {
        bgcolor: '#f9a825',
      },
    }}
  >
    Prev
  </Button>

  {/* Next Button */}
  <Button
    variant="contained"
    onClick={handleNext}
    disabled={currentIndex === productIds.length - 1}
    endIcon={<ArrowForwardIcon />}
    size="small"
    sx={{
      bgcolor: '#66bb6a',
      color: 'white',
      borderRadius: '30px',
      px: 1.5,
      py: 0.5,
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      minHeight: '32px',
      '&:hover': {
        bgcolor: '#43a047',
      },
    }}
  >
    Next
  </Button>
</Box>

</Box>





      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        gap={4}
        justifyContent="center"
      >
        {/* Image Section */}
        <Box width={isMobile ? "100%" : "40%"}>

        
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
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: isMobile ? '100%' : '70px',
          alignItems: 'center',
        
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
                border: mainImage === img ? "2px solid #000" : "1px solid #ccc",
                objectFit: "cover",
              }}
              onClick={() => setMainImage(img)}
            />
          );
        })}
      </Box>

      {/* Main Image with Hover Zoom using react-image-magnify */}
      <Box sx={{ width: isMobile ? '100%' : '400px' }}>

      
  <img
    alt="Product Image"
    src={mainImage || soonImg}
    style={{
      width: isMobile ? '100%' : '300px',
      height: isMobile ? undefined : '225px',
      objectFit: 'contain',
      borderRadius: '4px',
      cursor: 'zoom-in'
    }}
  />
</Box>
    </Box>

    <Box
  sx={{
    mt: 6,
    maxWidth: {
      xs: '100%',   // full width on small screens
      sm: '100%',
      md: '530px',  // fixed max width on medium and larger screens
    },
    px: {
      xs: 2,        // horizontal padding on small screens
      sm: 2,
      md: 0,
    },
  }}
>
  {/* Product Features */}
  <Box sx={{ mt: 2, maxWidth: '530px' }}>
  {/* Product Features */}
  <Box display="flex" alignItems="center" mt={3} mb={1}>
    <Typography variant="h6" mr={2} sx={{ fontSize: '18px', fontWeight: 600 }}>
      Features:
    </Typography>
  </Box>

  <List>
    {product?.features?.map((feature, index) => (
      <ListItem key={index} sx={{ padding: '4px 0' }}>
        <Typography sx={{ fontSize: '16px' }}>
          {/* Check if the feature contains an anchor tag */}
          {feature.includes('<a') ? (
            <span dangerouslySetInnerHTML={{ __html: feature }} />
          ) : (
            `• ${feature}`
          )}
        </Typography>
      </ListItem>
    ))}
  </List>

  {/* Example URL link */}
  <Box mt={2}>
  {product?.pdfUrl && (
    <a
      href={product.pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ fontSize: '16px', textDecoration: 'underline' }}
    >
      View the PDF
    </a>
  )}
</Box>

</Box>


  {/* Product Description */}
  <Typography variant="h6" mt={3} mb={1} sx={{ fontSize: '18px', fontWeight: 600 }}>
    Description:
  </Typography>
  <Typography variant="body2" sx={{ fontSize: '16px' }}>
    {product?.long_description || 'No description available.'}
  </Typography>
</Box>
        </Box>

        {/* Info Section */}
        <Box width={isMobile ? "100%" : "50%"}>
         
          <Typography variant="h4" sx={{fontSize:'25px'}} fontWeight="bold" gutterBottom>
          {product?.product_name || 'Product Title Not Available'}
          </Typography>

            {/* Price Section */}
                               <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 2, gap: 1 }}>
                                 {currentPrice !== undefined && currentPrice !== null && (
                                   <Typography
                                    
                                     sx={{
                                       fontWeight: 'bold',
                                       color: '#1a73e8',
                                       fontSize: { xs: '16px', sm: '20px' },
                                     }}
                                   >
                                     {currency}{currentPrice}
                                   </Typography>
                                 )}
                                 {originalPrice !== undefined && originalPrice !== null && originalPrice > currentPrice && (
                                   <Typography
                                     variant="body2"
                                     sx={{
                                       color: '#777',
                                       textDecoration: 'line-through',
                                       fontSize: { xs: '14px', sm: '16px' },
                                     }}
                                   >
                                     {currency}{originalPrice}
                                   </Typography>
                                 )}
                                 {discountPercentage && (
                                   <Typography
                                     variant="body2"
                                     sx={{
                                       color: 'green',
                                       fontWeight: 'bold',
                                       fontSize: { xs: '14px', sm: '16px' },
                                     }}
                                   >
                                     {discountPercentage} OFF
                                   </Typography>
                                 )}
                               </Box>
       <Box sx={{ display: 'flex', flexDirection: 'row', mb: 2, gap: 4 }}>
  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
    <DetailLabel>SKU:</DetailLabel>
    <DetailValue>{product?.sku_number_product_code_item_number || 'N/A'}</DetailValue>
  </Box>
  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
    <DetailLabel>MPN:</DetailLabel>
    <DetailValue>{product?.mpn || 'N/A'}</DetailValue>
  </Box>
</Box>
{/* Category, Vendor, Brand */}
<Box sx={{ display: 'flex', flexDirection: 'row', mb: 2, gap: 4, flexWrap: 'wrap' }}>
  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
    <DetailLabel>Category:</DetailLabel>
    <DetailValue>{product?.end_level_category || 'N/A'}</DetailValue>
  </Box>
  {product?.vendor && (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
      <DetailLabel>Vendor:</DetailLabel>
      <DetailValue>{product?.vendor}</DetailValue>
    </Box>
  )}
  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
    <DetailLabel>Brand:</DetailLabel>
    <DetailValue>{product?.brand_name || 'N/A'}</DetailValue>
  </Box>
</Box>


          <Box mt={2}>
           <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 2 }}>
                                 <Button
                                   variant="outlined"
                                   sx={{
                                     backgroundColor: '#f2f3ae',
                                     color: 'black',
                                     textTransform: 'none',
                                     fontSize: { xs: '14px', sm: '16px' },
                                   }}
                                   onClick={handleAIOptions}
                                   size="small"
                                 >
                                   Generate Content With AI
                                 </Button>
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
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: 280, sm: 300 },
                            height: { xs: 280, sm: 300 },
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 2,
                            borderRadius: '8px',
                          }}
                        >
                          <div id="ai-modal-description">
                            <FetchApi onClose={handleCloseAIModal} onUpdateProduct={handleUpdateProduct} />
                          </div>
                        </Box>
                      </Modal>
                    


          </Box>

          <Box mt={2} display="flex" gap={2} alignItems="center">
               <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1}>
             {/* Dropdown to select prompt */}
             <div>
             {!isAddingNewPrompt ? (
               <select
                 value={selectedPrompt}
                 onChange={handleSelectChange}
                 style={{ padding: '8px', fontSize: '14px' }}
               >
                 <option value="">Select a Prompt</option>
                 {promptList.map((prompt) => (
                   <option key={prompt.id} value={prompt.id}>
                     {prompt.name}
                   </option>
                 ))}
                 <option value="__add_new__">➕ Enter new Prompt</option>
               </select>
             ) : (
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <input
                   type="text"
                   placeholder="Enter custom prompt"
                   value={customPrompt}
                   onChange={(e) => setCustomPrompt(e.target.value)}
                   style={{ padding: '8px', fontSize: '14px', width: '200px' }}
                 />
                 <button
                   onClick={() => {
                     setCustomPrompt('');
                     setIsAddingNewPrompt(false); // Go back to dropdown
                   }}
                   style={{ padding: '6px 10px' }}
                 >
                   Cancel
                 </button>
               </div>
             )}
           </div>
           
           
           
           
             {/* Button to trigger API call */}
             <Button 
               variant="contained" 
               color="primary" 
               onClick={() => sendSelectedPromptToAPI()}  // Trigger the API call when clicked
               sx={{ ml: 2, textTransform:'capitalize' }} // Optional margin for spacing between dropdown and button
             >
               Rewrite
             </Button>

                   <Button
               onClick={handleUpdateProductTotal}
               disabled={loading}
               color="primary"
               sx={{
                marginLeft:'5px',
                
                 backgroundColor: theme => theme.palette.primary.main, // Using primary color from the theme
                 textTransform: 'capitalize',
                 color: 'white',
               }}
             >
               {loading ? 'Updating...' : ' Update'}
             </Button>
           </Box>
           
          </Box>

    

         
            <Box mt={2}>
            <Tabs
  value={tabIndex}
  onChange={handleTabChange}
  aria-label="product details tabs"
  variant="scrollable"
  scrollButtons="auto"
  sx={{
    minHeight: '40px',
    '& .MuiTab-root': {
      minHeight: '40px',
      fontSize: '16px',
      textTransform: 'capitalize',
      color: 'black',
    },
    '& .Mui-selected': {
      color: 'black !important',
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
      xs: '100%',   // Extra small screens (mobile)
      sm: '100%',   // Small screens (tablets)
      md: '660px',  // Medium screens and above
    },
  }}
>
       <TabPanel value={tabIndex} index={0}>
  {Array.isArray(productTab?.title) && productTab.title.length > 0 ? (
    <Box sx={{ width: '100%' }}>
      <List
        sx={{
          padding: 0,
          mb: 1,
          width: '100%',
          // maxWidth: { xs: '100%', sm: '90%', md: '80%', lg: '59ch' }, // responsive width
          fontSize: { xs: '13px', md: '14px' }, // font size adjusts
          fontWeight: 'bold',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
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
                  label={<Typography variant="body1">{title.value}</Typography>}
                />

                {title.checked === true && !editMode.title && (
                  <IconButton onClick={() => handleEditClickTitle('title', index)}>
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
              <IconButton onClick={() => handleSaveClick('title')}>
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
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
  <Typography variant="body1" sx={{ fontSize: '16px', textAlign: 'center' }} color="textSecondary">
    No title available
  </Typography>
</Box>

        </ListItem>
      )}
    </TabPanel>


    <TabPanel value={tabIndex} index={1}>
  <Box>
    <Box display="flex" alignItems="center" marginBottom={1}>
      {/* <Typography variant="h6" marginRight={2} sx={{ fontSize: '1.2rem' }}>
        Features:
      </Typography> */}
    </Box>

    {editMode.features ? (
      <Box>
        {Array.isArray(productTab?.features) && productTab.features.length > 0 ? (
          productTab.features.map((featureObj, listIndex) => {
            const featureList = Array.isArray(featureObj.value) ? featureObj.value : [];

            return (
              <Box key={listIndex} sx={{ marginBottom: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Feature Set {listIndex + 1}
                  </Typography>

                  {/* 👇 Show edit icon only for selected set */}
                  {/* {selectedFeatureSetIndex === listIndex && editingSetIndex === null && ( */}
                  {productTab.features[listIndex]?.checked === true && (
                    <IconButton onClick={() => setEditingSetIndex(listIndex)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {/* )} */}

                         {/* 👇 Show save only in edit mode */}
        {productTab.features[listIndex]?.checked === true && editingSetIndex === listIndex && (
  <Box>
    <IconButton onClick={handleSaveClickFeatures}>
      <SaveIcon />
    </IconButton>
    <IconButton onClick={handleCancelFeatures}>
      <CancelIcon />
    </IconButton>
  </Box>
)}
                </Box>

                {featureList.map((feature, featureIndex) => (
                  <Box
                    key={featureIndex}
                    sx={{ marginBottom: 1}}
                  >
                    {editingSetIndex === listIndex ? (
                      <TextField
                       
                        value={editingFeatures[listIndex]?.[featureIndex] || feature}
                        onChange={(e) =>
                          handleFeatureChange(listIndex, featureIndex, e.target.value)
                        }
                        label={`Feature ${featureIndex + 1}`}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                      />
                    ) : (
                      <Typography variant="body1" sx={{ paddingLeft: '16px',}}>
                        • {feature}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            );
          })
        ) : (
          <Typography variant="body1" sx={{ fontSize: '16px',  }} color="textSecondary">
            No features available.
          </Typography>
        )}

 

      </Box>
    ) : (
      <RadioGroup
  value={selectedFeatureSetIndex ?? ''}
  onChange={(e) => handleFeatureSetSelect(e, Number(e.target.value))}
>
  {Array.isArray(productTab?.features) && productTab.features.length > 0 ? (
    productTab.features.map((featureObj, listIndex) => {
      const featureList = Array.isArray(featureObj.value) ? featureObj.value : [];

      return (
        <React.Fragment key={listIndex}>
          <ListItem sx={{ display: 'flex', alignItems: 'center' ,}}>
            <FormControlLabel
              value={listIndex}
              control={
                <Radio
                  checked={productTab.features[listIndex]?.checked === true}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Feature Set {listIndex + 1}
                  </Typography>
                  {productTab.features[listIndex]?.checked === true && (
                    <IconButton
                      onClick={() => {
                        setEditingSetIndex(listIndex);
                        const featuresCopy = productTab.features.map(set => [...set.value]);
                        setEditingFeatures(featuresCopy);
                        setEditMode({ ...editMode, features: true });
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
                padding: '4px 0',
                fontSize: '0.9rem',
              
                paddingLeft:'18px'
              }}
            >
              <Typography variant="body1">• {feature}</Typography>
            </ListItem>
          ))}
        </React.Fragment>
      );
    })
  ) : (
    <Typography variant="body1" sx={{ fontSize: '16px' }} color="textSecondary">
      No features available.
    </Typography>
  )}
</RadioGroup>

    )}
  </Box>
</TabPanel>






<TabPanel value={tabIndex} index={2}>
  {/* <Typography variant="h6" mt={1} mb={1} sx={{ fontSize: '1.2rem' }}>
    Description:
  </Typography> */}

  {productTab?.description?.length > 0 ? (
  <RadioGroup value={selectedDescription} onChange={handleDescriptionChange}>
    {productTab.description.map((desc, index) => {
      const descValue = desc?.value || '';
      const isSelected = selectedDescription === descValue;

      return (
        <ListItem
          key={index}
          sx={{
            fontWeight: 'bold',
            fontSize: '16px',
            mb: 1,
           
            display: 'flex',
            // alignItems: 'center',
          }}
        >
          {editMode.description && selectedEditIndex === index ? (
            <>
   <TextareaAutosize
  value={editedDescription}
  onChange={(e) => setEditedDescription(e.target.value)}
  placeholder="Edit Description"
  minRows={2}
  style={{
    width: '100%',
    maxWidth: '550px',
    fontSize: '14px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontFamily: 'Roboto, Helvetica, sans-serif', // Add this line to inherit the parent's font family
  }}
/>

              <IconButton onClick={handleSaveClickDescription}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => setEditMode({ ...editMode, description: false })}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <>
              <FormControlLabel
                value={descValue}
                control={<Radio checked={isSelected} />}
                label={
                  <Typography variant="body2" sx={{ fontSize: '16px' }}>
                    {descValue}
                  </Typography>
                }
              />

              {/* ✅ Only show edit icon if this item is selected */}
              {isSelected && (
                <IconButton
                  onClick={() => {
                    setSelectedEditIndex(index);
                    setEditedDescription(descValue);
                    setSelectedDescription(descValue);
                    setEditMode({ ...editMode, description: true });
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
  <Typography variant="body2" sx={{ fontSize: '16px' }} color="textSecondary">
    No description available.
  </Typography>
)}

</TabPanel>

</Box>

</Box>
        </Box>
      </Box>


     {/* Chatbot UI */}
     <IconButton
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: '#007bff',
          color: 'white',
          '&:hover': { background: '#0056b3' },
        }}
      >
        <ChatIcon />
      </IconButton>


      {chatOpen && (
      <Box
        sx={{
          position: 'fixed',
          width: isMaximized ? '31%' : '320px', // Maximized window will take 100% width
          height: isMinimized ? '50px' : isMaximized ? '80%' : '450px', // Minimized height is small, maximized height is full
          transition: 'all 0.3s',
          bottom: 90,
          right: 20,
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: 6,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: '#007bff', color: '#fff', p: 1.5, position: 'relative' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Product Chat Assistant
          </Typography>

          <Box sx={{ position: 'absolute', right: 8, top: 8, display: 'flex', gap: 1 }}>
  {/* Minimize Button */}
  <Tooltip title="Minimize" arrow>
  <IconButton size="small" sx={{ color: 'black' }} onClick={handleMinimize}>
    <MinimizeOutlinedIcon fontSize="small" sx={{ mt: '-12px' }} />
  </IconButton>
</Tooltip>


  {/* Maximize Button */}
  <Tooltip title="Maximize" arrow>
    <IconButton size="small" sx={{ color: 'black' }} onClick={handleMaximize}>
      <CropSquareIcon fontSize="small" />
      {/* CropSquareIcon matches the Windows maximize icon better */}
    </IconButton>
  </Tooltip>

  {/* Close Button */}
  <Tooltip title="Close" arrow>
    <IconButton size="small" sx={{ color: 'black' }} onClick={toggleChat}>
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
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflowY: 'auto', // Make the messages box scrollable
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
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#aaa',
                padding: '10px',
              }}
            >
              Hello! Ask me about this product.
            </Typography>
          )}

{loadingQuestion ? (
  // Loading state: show DotLoading inside a single Box
  <Box
    sx={{
      backgroundColor: '#f9f9f9',
      padding: '8px',
      borderRadius: '5px',
      marginTop: '5px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <DotLoading />
  </Box>
) : (
  // Loaded state: map through questions
  data.map((item) => (
    <Box
      key={item.id}
      sx={{
        backgroundColor: '#f9f9f9',
        padding: '8px',
        borderRadius: '5px',
        marginTop: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2">{item.question}</Typography>
      <IconButton sx={{ padding: 0 }} onClick={() => handleQuestionClick(item.id)}>
        <ArrowForwardIcon />
      </IconButton>
    </Box>
  ))
)}


          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px',
              }}
            >
              <Typography
                sx={{
                  backgroundColor: message.sender === 'user' ? '#d1e7ff' : '#f1f1f1',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  maxWidth: '80%',
                  wordBreak: 'break-word', // Ensure long words are wrapped
                }}
              >
                {message.text}
              </Typography>
            </Box>
          ))}

          {/* Bot Typing Indicator */}
          {isBotTyping && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
              <Paper sx={{ p: 1, bgcolor: '#f1f1f1', borderRadius: 2, maxWidth: '80%' }}>
                <Typography variant="body2">...typing</Typography>
              </Paper>
            </Box>
          )}

          {/* Scroll to bottom reference */}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Box */}
        <Box sx={{ display: 'flex', gap: 1, p: 1.5, borderTop: '1px solid #ddd' }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Type your message..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage(); // Send the message when Enter key is pressed
              }
            }}
          />
    

<Button
  variant="contained"
  sx={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center' }}
  onClick={handleSendMessage}
>
  <SendIcon sx={{ ml: 1 }} /> {/* Adds the send icon next to the button */}
</Button>


        </Box>
      </Box>
    )}
      
    
      <Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert
    onClose={() => setSnackbarOpen(false)}
    severity={
      snackbarMessage.includes('successfully') ? 'success' : 'error'
    }
    variant="filled" // ✅ Makes the color background solid
    sx={{ width: '100%' }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>


    </Box>













  );
};

export default Example;
