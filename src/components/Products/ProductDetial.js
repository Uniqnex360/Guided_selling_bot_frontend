import React, { useState, useEffect, useRef } from 'react';

import {
    Button, Container, Grid,RadioGroup, Tooltip,Radio, Typography,Paper,FormControlLabel, Checkbox, Box, Badge, TextField, Modal, List, ListItem, CircularProgress, IconButton, Divider, Link, Tabs, Tab
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router-dom';
import CardMedia from '@mui/material/CardMedia';
import { styled } from '@mui/material/styles';
import FetchApi from './FetchApi';
import EditIcon from '@mui/icons-material/Edit'; // Import the Edit icon
import SaveIcon from '@mui/icons-material/Save'; // Import Save icon
import MinimizeOutlinedIcon from '@mui/icons-material/MinimizeOutlined';
import MaximizeOutlinedIcon from '@mui/icons-material/MaximizeOutlined';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import CancelIcon from '@mui/icons-material/Cancel';

import soonImg from "../assets/soon-img.png";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {

    ArrowBack
  } from "@mui/icons-material";
import DotLoading from '../Loading/DotLoading';

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

const ProductDetail = () => {
    
  const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [aiSuggestions, setAISuggestions] = useState([]);
    const [aiModalOpen, setAIModalOpen] = useState(false);
    const [mainImage, setMainImage] = useState('');
    const { id } = useParams();
    const [productTab, setProductTab] = useState({
      title: [],
      description: [],
      features: [],
    });
    const [tabIndex, setTabIndex] = useState(0);
    // const [productTab, setProductTab] = useState('');
    const [selectedTitles, setSelectedTitles] = useState([]);
    const [selectedDescriptions, setSelectedDescriptions] = useState([]);
    const [responseChat, setResponseChat] = useState('')
    const messagesEndRef = useRef(null); // Reference for the end of the chat messages
    const [isBotTyping, setIsBotTyping] = useState(false); // State for bot typing indicator
    const currentPrice = product?.msrp;
    const originalPrice = product?.list_price;
    const discountPercentage = product?.discount;
    const [selectedDescription, setSelectedDescription] = useState("");
    const [promptList, setPromptList] = useState([]); // Store fetched prompt list
    const [selectedPrompt, setSelectedPrompt] = useState(''); // Store the selected prompt
    const [selectedFeatureSetIndex, setSelectedFeatureSetIndex] = useState(0); // To track selected feature set
    const [selectedFeatures, setSelectedFeatures] = useState(productTab?.features || []);
  // State for the updated title, features, and description
const [updateTitle, setUpdateTitle] = useState('');
const [updateFeatures, setUpdateFeatures] = useState([]);
const [updateDescription, setUpdateDescription] = useState('');
const [updatedDescription, setUpdatedDescription] = useState(productTab?.description || []);
 // State for Title Tab (managed within TitleTab)
  const [editedTitle, setEditedTitle] = useState(''); // Likely managed in TitleTab
  const [editModeTitle, setEditModeTitle] = useState(false); // Likely managed in TitleTab
  const [getTitle, setGetTitle] = useState([]);
  const [getFeatures, setGetFeatures] = useState([]);
  const [getDescription, setGetDescription] = useState([]);
  const [finalTitle, setFinalTitle] = useState('');
const [finalDescription, setFinalDescription] = useState('');

  // State for Features Tab (managed within FeaturesTab)
  const [editedFeatures, setEditedFeatures] = useState([]); // Likely managed in FeaturesTab
  const [editModeFeatures, setEditModeFeatures] = useState(false); // Likely managed in FeaturesTab

  // State for Description Tab (managed within DescriptionTab - based on your earlier code)
  const [editModeDescription, setEditModeDescription] = useState(false); // Likely managed in DescriptionTab


    const [editMode, setEditMode] = useState({
      title: false,
      features: false,
      description: false,
    });
    const currency = product?.currency || '$'; // Default to $ if currency is not available
    const [selectedTitle, setSelectedTitle] = useState("");
    const [data, setData] = useState([]); // to hold the fetched questions

    // Minimize

    const [isMinimized, setIsMinimized] = useState(false);
const [isMaximized, setIsMaximized] = useState(false);
const [selectedEditIndex, setSelectedEditIndex] = useState(null);
const [editedDescription, setEditedDescription] = useState('');




// On edit button click
const handleEditClick = (field) => {
  if (field === 'features') {
    setEditMode({ ...editMode, features: true });

    // Clone the existing productTab.features into editable state
    const cloned = productTab.features?.map(f => [...f.value]);
    setEditedFeatures(cloned);
  }
};

// On input change
const handleFeatureChange = (newVal, setIndex, featureIndex) => {
  const updated = [...editedFeatures];
  updated[setIndex][featureIndex] = newVal;
  setEditedFeatures(updated);
};

// On save click
const handleSaveClickFeatures = () => {
  const updatedProduct = {
    ...productTab,
    features: productTab.features.map((f, i) => ({
      ...f,
      value: editedFeatures[i]
    })),
  };

  // Save this to API or state
  // Example: updateProduct(updatedProduct);

  setEditMode({ ...editMode, features: false });
};



const handleBackendUpdate = (updatedData) => {
  console.log('Backend update called with:', updatedData);
  // Implement your API call here
};

const handleLocalUpdate = (updatedProductTab) => {
  console.log('Local state updated with:', updatedProductTab);
  // Implement your local state update here

  setGetTitle(updatedProductTab.title)
  setGetFeatures(updatedProductTab.features)
  setGetDescription(updatedProductTab.description )
};

// Title select

useEffect(() => {
  const checkedTitle = productTab?.title?.find(title => title?.checked);
  if (checkedTitle) {
    setSelectedTitle(checkedTitle.value);
  }
}, [productTab?.title]);

const handleTitleChange = (event) => {
  const value = event.target.value;
  setSelectedTitle(value);
  setEditedTitle(value);

  const updatedTitles = productTab.title.map((title) => ({
    ...title,
    checked: title.value === value,
  }));
  handleLocalUpdate({ ...productTab, title: updatedTitles });
  // handleBackendUpdate({ title: updatedTitles });
};


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
    setEditedTitle(productTab.title[index].value);
  }
};

const handleSaveClick = (type) => {
  if (type === 'title' && selectedEditIndex !== null) {
    const updatedTitles = productTab.title.map((title, index) => {
      if (index === selectedEditIndex) {
        return { ...title, value: editedTitle, checked: true };
      } else {
        return { ...title, checked: false };
      }
    });
    handleLocalUpdate({ ...productTab, title: updatedTitles });
    // handleBackendUpdate({ title: updatedTitles });
    setEditMode({ ...editMode, title: false });
    setSelectedEditIndex(null);
  }
};





// Tab discription

useEffect(() => {
  // Initialize selectedDescription with the checked value on mount
  const checkedDescription = productTab?.description?.find(desc => desc?.checked);
  if (checkedDescription) {
    setSelectedDescription(checkedDescription.value);
  }
}, [productTab?.description]);

const handleRadioChangeDescription = (type, index, value) => {
  setSelectedDescription(value);
  const updatedDescriptions = productTab.description.map((desc, i) => ({
    ...desc,
    checked: i === index,
  }));
  // Optimistically update the local state
  handleLocalUpdateDescription({ ...productTab, description: updatedDescriptions });
  // You would typically call your backend update function here
  // handleBackendUpdate({ description: updatedDescriptions });
};

const handleLocalUpdateDescription = (updatedProductTab) => {
  // This function would update your local state that holds the productTab data
  console.log('Local state updated with:', updatedProductTab);
 
  const selectedTitle = updatedProductTab.title.find(item => item.checked)?.value || '';
  setFinalTitle(selectedTitle)
  const selectedDescription = updatedProductTab.description.find(item => item.checked)?.value || '';
  setFinalDescription(selectedDescription)
  // For example, if you have a state like `setProductData(updatedProductTab)`
};



const handleEditClickDescription = (type, index) => {
  setEditMode({ ...editMode, [type]: true });
  setSelectedEditIndex(index);
  if (type === 'description') {
    const currentValue = productTab?.description?.[index]?.value || '';
    setEditedDescription(currentValue);
  }
};


const handleSaveClickDescription = (type) => {
  if (type === 'description' && selectedEditIndex !== null) {
    const updatedDescriptions = productTab.description.map((desc, index) => {
      if (index === selectedEditIndex) {
        return { ...desc, value: editedDescription, checked: true };
      } else {
        return { ...desc, checked: false };
      }
    });

    const updatedProductTab = {
      ...productTab,
      description: updatedDescriptions,
    };

    setProductTab(updatedProductTab); // ✅ Update state
    handleLocalUpdateDescription(updatedProductTab); // Optional
    setSelectedDescription(editedDescription); // Update selected radio
    setEditMode({ ...editMode, description: false });
    setSelectedEditIndex(null);
  }
};

const handleDescriptionChange = (event) => {
  const value = event.target.value;
  setSelectedDescription(value);
  setEditedDescription(value);

  const updatedDescriptions = productTab.description.map((desc) => ({
    ...desc,
    checked: desc.value === value,
  }));

  const updatedProductTab = {
    ...productTab,
    description: updatedDescriptions,
  };

  setProductTab(updatedProductTab); // 👈 Make sure you're updating this state
  handleLocalUpdateDescription(updatedProductTab); // Optional if you want a side effect
};



  // Handle minimize action
 
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
      const response = await fetch('https://product-assistant-gpt.onrender.com/fetchPromptList/');
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






    // Handle the dropdown selection and trigger POST request
    const handleSelectChange = (event) => {
      const selectedValue = event.target.value;
      setSelectedPrompt(selectedValue);
  
      if (selectedValue) {
        // sendSelectedPromptToAPI(selectedValue);
      }
    };
  
    // Send POST request with selected prompt id
    const sendSelectedPromptToAPI = async () => {
      const requestPayload = {
        option: selectedPrompt,
        // product_obj: {
          title: getTitle,
          description: getDescription,
          features: getFeatures,
          product_id: id
        // },
      };
  
      // Modify this payload as per your API requirements
      try {
        const response = await fetch(
          'https://product-assistant-gpt.onrender.com/regenerateAiContents/',
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
          // Update the UI with the new data after successful API call
          setSelectedTitle(result.data.title);
          console.log('9090',selectedTitle)
          setSelectedDescription(result.data.description);
          setSelectedFeatures(result.data.features);
          console.log("API response:", result);
        }
      } catch (error) {
        console.error('Error sending data to API:', error);
      }
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
      setLoading(true);
      fetch(`https://product-assistant-gpt.onrender.com/fetchProductQuestions/${id}`)
        .then((response) => response.json())
        .then((responseData) => {
          setData(responseData.data); // Setting fetched data
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching product details:', error);
          setLoading(false);
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
      fetch('https://product-assistant-gpt.onrender.com/chatbotView/', {
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
 

   // Handle feature checkbox change

   const handleFeatureSetChange = (event, listIndex) => {
    if (event.target.checked) {
      const selected = productTab.features[listIndex];
      setSelectedFeatures([selected]); // wrap inside array since it’s an array of arrays
      console.log('oppo feature',selectedFeatures)
    } else {
      setSelectedFeatures([]);
    }
  };


  const handleBackClick = () => {
    // Correct syntax for query params
    navigate(`/`);
  };

  
    const handleUpdateProduct = (updatedProduct) => {
        console.log('3333111',updatedProduct)
        setProductTab(updatedProduct); // Update the product details in parent component
    };

    const handleCloseAIModal = () => {
        setAIModalOpen(false);
    };
    useEffect(() => {
      setLoading(true);
        fetch(`https://product-assistant-gpt.onrender.com/productDetail/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setProduct(data.data.product);
                setMainImage(data.data.product?.logo || soonImg);
                setLoading(false);
            })
            .catch((error) => console.error("Error fetching product:", error));
    }, [id]);


    const handleUpdateProductTotal = async () => {
      console.log('getT',getDescription)
      const selectedTitle = getTitle.find(item => item.checked)?.value || '';
    
      setLoading(true);
   
      try {
        const response = await fetch('https://product-assistant-gpt.onrender.com/updateProductContent/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: id,
            product_obj: {
              product_name : selectedTitle,
              long_description : selectedDescription ,
              features : []
            }
          })
        });
  
        const data = await response.json();
        console.log('Update response:', data);
  
        if (data?.status) {
          alert('Product updated successfully!');
        } else {
          alert('Update failed');
        }
  
      } catch (error) {
        console.error('Error updating product:', error);
      } finally {
        setLoading(false);
      }
    };
  
  

    const handleAISuggestionSelect = (suggestion) => {
        setAIModalOpen(false);
    };

    const fetchAIOptions = () => {
        setAISuggestions(['AI Feature 1', 'AI Feature 2', 'AI Description']);
    };

    const handleTabChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    if (loading) return <div style={{marginTop:'10%'}}><DotLoading/>...</div>;
    // if (error) return <div>{error}</div>;
  

    return (
        <Container>

<Box sx={{ display: "flex",marginLeft: '-43px', alignItems: "center", padding: "20px" }}>
              <IconButton sx={{ marginLeft: "-3%" }} onClick={handleBackClick}>
                <ArrowBack />
              </IconButton>
              <Typography gutterBottom sx={{ fontSize: "18px", marginTop: "7px" }}>
               Back to Products
              </Typography>

              
  <Button
    onClick={handleUpdateProductTotal}
    disabled={loading}
    sx={{ marginLeft: "auto", textTransform:'capitalize', backgroundColor:'grey', color:'black' }}
  >
    {loading ? 'Updating...' : 'Products Update'}
  </Button>
            </Box>
            <Grid container spacing={3} marginTop={3}>
                {/* Left Section: Image & Thumbnails */}
                <Grid item xs={12} md={6} >
  <Box display="flex" flexDirection="row" alignItems="flex-start" gap={2}>
    {/* Thumbnails on the left - vertical */}
    <Box display="flex" flexDirection="column" gap={2}>
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
              objectFit: "cover"
            }}
            onClick={() => setMainImage(img)}
          />
        );
      })}
    </Box>

    {/* Main Image on the right */}
    <CardMedia
      component="img"
      image={mainImage || soonImg}
      alt="Product Image"
      sx={{
        width: "500px",
        height: "300px",
        borderRadius: "4px",
        objectFit: "contain",
        cursor: "pointer"
      }}
    />
  </Box>
</Grid>


                {/* Right Section: Product Details and Tabs */}
                <Grid item xs={12} md={6}> {/* Occupies half width */}
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <Box>
                          <Typography
  variant="h5"
  sx={{
    fontWeight: 'bold',
    mb: 1,
    maxWidth: '40ch',  // Maximum width based on character count
    overflowWrap: 'break-word',  // Ensures text wraps when it exceeds the width
  }}
>
  {product?.product_name || 'Product Title Not Available'}
</Typography>

{/* SKU & MPN */}
<Box sx={{ display: 'flex', flexDirection: 'column', mb: 1, alignItems: 'flex-start' }}>



<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {currentPrice !== undefined && currentPrice !== null && (
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a73e8', mr: 1, fontSize: '25px' }}>
                        {currency}{currentPrice}
                    </Typography>
                )}
                {originalPrice !== undefined && originalPrice !== null && originalPrice > currentPrice && (
                    <Typography variant="body2" sx={{ color: '#777', textDecoration: 'line-through', mr: 1, fontSize: '0.9rem' }}>
                        {currency}{originalPrice}
                    </Typography>
                )}
                {discountPercentage && (
                    <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold', fontSize: '21px' }}>
                        {discountPercentage} OFF
                    </Typography>
                )}
            </Box>
            
<Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>



                    <DetailLabel>SKU:</DetailLabel>
                    <DetailValue>{product?.sku_number_product_code_item_number || 'N/A'}</DetailValue>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
                    <DetailLabel>MPN:</DetailLabel>
                    <DetailValue>{product?.mpn || 'N/A'}</DetailValue>
                </Box>
            </Box>

            {/* Category & Vendor & Brand */}
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1, alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
                    <DetailLabel>Category:</DetailLabel>
                    <DetailValue>{product?.end_level_category || 'N/A'}</DetailValue>
                </Box>
                {/* Assuming you have a 'vendor' field in your product data */}
                {product?.vendor && (
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
                        <DetailLabel>Vendor:</DetailLabel>
                        <DetailValue>{product?.vendor || 'N/A'}</DetailValue>
                    </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
                    <DetailLabel>Brand:</DetailLabel>
                    <DetailValue>{product?.brand_name || 'N/A'}</DetailValue>
                </Box>
            
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom:'20px' }}>
        <Button variant="outlined" sx={{backgroundColor:'#f2f3ae',  color:'black'}} color="primary" onClick={handleAIOptions} size="small">
            Generate Content With AI
        </Button>
    </Box>
</Box>

{/* Modal Component */}
<Modal
    open={aiModalOpen}
    onClose={handleCloseAIModal}
    aria-labelledby="ai-modal-title"
    aria-describedby="ai-modal-description"
>
    <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: '8px',
    }}>
        <div id="ai-modal-description">
            {/* Render the FetchApi component here */}
            <FetchApi onClose={handleCloseAIModal} onUpdateProduct={handleUpdateProduct} />

        </div>
        {/* <Button onClick={handleCloseAIModal} sx={{ mt: 2 }}>Close</Button> */}
    </Box>
</Modal>


                            <Divider sx={{ my: 2 }} />
            

                        </Box>
                    )}
                </Grid>
            </Grid>

       
   <Grid container  spacing={2}>
  {/* Left Side - Product Features and Description */}
  <Grid item xs={6} sx={{ width: '50%', fontFamily: 'Roboto, Helvetica, sans-serif' }}>
  {/* Product Features */}
  <Box display="flex" alignItems="center" mt={3} mb={1}>
    <Typography variant="h6" mr={2} sx={{ fontSize: '14px', fontWeight: 600 }}>
      Features:
    </Typography>
  </Box>

  <List>
    {product?.features?.map((feature, index) => (
      <ListItem key={index} sx={{ padding: '4px 0' }}>
        <Typography sx={{ fontSize: '14px' }}>
          • {feature}
        </Typography>
      </ListItem>
    ))}
  </List>

  {/* Product Description */}
  <Typography variant="h6" mt={3} mb={1} sx={{ fontSize: '14px', fontWeight: 600 }}>
    Description:
  </Typography>
  <Typography variant="body2" sx={{ fontSize: '14px' }}>
    {product?.long_description || 'No description available.'}
  </Typography>
</Grid>




  {/* Right Side - Empty */}
  <Grid  item xs={6}>
  <Box>

    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="product details tabs" sx={{marginTop:'-50px'}}>
      <Tab label="Product Title" {...a11yProps(0)} />
      <Tab label="Features" {...a11yProps(1)} />
      <Tab label="Description" {...a11yProps(2)} />
    </Tabs>
    <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1}>
  {/* Dropdown to select prompt */}
  <div>
  <select 
    value={selectedPrompt} 
    onChange={handleSelectChange} 
    className="dropdown"
    style={{ padding: '8px', fontSize: '14px' }}
  >
    <option value="">Select a Prompt</option>
    {promptList.length > 0 ? (
      promptList.map((prompt) => (
        <option key={prompt.id} value={prompt.id}>
          {prompt.name}
        </option>
      ))
    ) : (
      <option value="">No prompts available</option>
    )}
  </select>
</div>


  {/* Button to trigger API call */}
  <Button 
    variant="contained" 
    color="primary" 
    onClick={() => sendSelectedPromptToAPI()}  // Trigger the API call when clicked
    sx={{ ml: 2 }} // Optional margin for spacing between dropdown and button
  >
    Update
  </Button>
</Box>


{/* Tab feilds */}


<TabPanel value={tabIndex} index={0}>
      {Array.isArray(productTab?.title) && productTab.title.length > 0 ? (
        <Box>
        <RadioGroup value={selectedTitle} onChange={handleTitleChange}>
  <List
    sx={{
      padding: 0,
      fontSize: '14px',
      fontWeight: 'bold',
      mb: 1,
      maxWidth: '59ch',
      overflowWrap: 'break-word',
    }}
  >
    {productTab.title.map((title, index) => (
      <ListItem key={index}>
        <FormControlLabel
          value={title.value}
          control={<Radio />} // ❌ Removed `checked` from here
          label={<Typography variant="body1">{title.value}</Typography>}
        />
        {selectedTitle === title.value && !editMode.title && (
          <IconButton onClick={() => handleEditClickTitle('title', index)}>
            <EditIcon />
          </IconButton>
        )}
      </ListItem>
    ))}
  </List>
</RadioGroup>


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
              <IconButton onClick={() => setEditMode({...editMode, title: false,})}>
                <CancelIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      ) : (
        <ListItem>
          <Typography variant="body1" color="textSecondary">
            No title found
          </Typography>
        </ListItem>
      )}
    </TabPanel>
    <TabPanel value={tabIndex} index={1}>
  <Box>
    {/* Title */}
    <Box display="flex" alignItems="center" marginBottom={1} sx={{ width: '50%' }}>
      <Typography variant="h6" marginRight={2} sx={{ fontSize: '1.2rem' }}>
        Features:
      </Typography>
    </Box>

    {/* View + Edit Combined Mode */}
   <RadioGroup
  value={selectedFeatureSetIndex !== null ? selectedFeatureSetIndex.toString() : ''}
  onChange={(e) => {
    const selectedIndex = Number(e.target.value);
    setSelectedFeatureSetIndex(selectedIndex);
    setEditMode({ ...editMode, features: true }); // Enable edit mode directly on selection
  }}
>

      {Array.isArray(productTab?.features) && productTab.features.length > 0 ? (
        productTab.features.map((featureSet, index) => {
          const isEditable = editMode.features && selectedFeatureSetIndex === index;

          return (
            <Box key={index} sx={{ marginBottom: 2 }}>
              <ListItem
                secondaryAction={
                  selectedFeatureSetIndex === index && !editMode.features && (
                    <IconButton onClick={() => handleEditClick('features')}>
                      <EditIcon />
                    </IconButton>
                  )
                }
              >
                <FormControlLabel
                  control={<Radio value={index.toString()} />}
                  label={
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Feature Set {index + 1}
                    </Typography>
                  }
                />
              </ListItem>

              {/* Render edit or view mode per set */}
              {isEditable ? (
                <Box sx={{ pl: 4 , 

                  maxWidth: '59ch',
                  overflowWrap: 'break-word',
                  
                }}>
                  {Array.isArray(featureSet.value) && featureSet.value.length > 0 ? (
                    featureSet.value.map((feature, featureIndex) => (
                      <TextField
                        key={featureIndex}
                        value={editedFeatures[index][featureIndex]}
                        onChange={(e) =>
                          handleFeatureChange(e.target.value, index, featureIndex)
                        }
                        label={`Feature ${featureIndex + 1}`}
                        fullWidth
                        margin="normal"
                        sx={{ maxWidth: '59ch' }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">No features available.</Typography>
                  )}

                  {/* Save & Cancel buttons */}
                  <Box sx={{ mt: 1 }}>
                    <IconButton onClick={() => handleSaveClickFeatures('features')}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={() => setEditMode({ ...editMode, features: false })}>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ pl: 4 }}>
                  {Array.isArray(featureSet.value) && featureSet.value.length > 0 ? (
                    featureSet.value.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ padding: '4px 0' }}>
                        <Typography variant="body2">• {feature}</Typography>
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">No features available.</Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })
      ) : (
        <Typography variant="body1" color="textSecondary">No features available.</Typography>
      )}
    </RadioGroup>
  </Box>
</TabPanel>




<TabPanel value={tabIndex} index={2}>
  <Typography variant="h6" mt={1} mb={1} sx={{ fontSize: '1.2rem' }}>
    Description:
  </Typography>

  {productTab?.description?.length > 0 ? (
  <RadioGroup value={selectedDescription} onChange={handleDescriptionChange}>
  {productTab.description.map((desc, index) => {
    const descValue = desc?.value || '';

    return (
      <ListItem
        key={index}
        sx={{
          fontWeight: 'bold',
          fontSize: '16px',
          mb: 1,
          maxWidth: '59ch',
          overflowWrap: 'break-word',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {editMode.description && selectedEditIndex === index ? (
          <>
            <TextField
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              label="Edit Description"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <IconButton onClick={() => handleSaveClickDescription('description')}>
              <SaveIcon />
            </IconButton>
            <IconButton onClick={() => setEditMode({ ...editMode, description: false })}>
              <CancelIcon />
            </IconButton>
          </>
        ) : (
          <FormControlLabel
            value={descValue}
            control={<Radio checked={desc.checked} />}
            label={
              <Typography variant="body2" sx={{ fontSize: '16px' }}>
                {descValue}
              </Typography>
            }
          />
        )}
      </ListItem>
    );
  })}
</RadioGroup>

 
  ) : (
    <Typography variant="body2" color="textSecondary">
      No description available.
    </Typography>
  )}
</TabPanel>



  </Box>
</Grid>

</Grid>


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
      <MinimizeOutlinedIcon fontSize="small" />
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
          {data && data.length > 0 && (
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
          )}

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
          <Button variant="contained" sx={{ textTransform: 'capitalize' }} onClick={handleSendMessage}>
            Send
          </Button>
        </Box>
      </Box>
    )}
      

        
        </Container>
    );
};

export default ProductDetail;