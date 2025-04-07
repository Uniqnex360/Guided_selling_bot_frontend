import React, { useState, useEffect, useRef } from 'react';

import {
    Button, Container, Grid,RadioGroup, Radio, Typography,Paper,FormControlLabel, Checkbox, Box, Badge, TextField, Modal, List, ListItem, CircularProgress, IconButton, Divider, Link, Tabs, Tab
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

import { useNavigate, useLocation } from "react-router-dom";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {

    ArrowBack
  } from "@mui/icons-material";

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
    const [tabIndex, setTabIndex] = useState(0);
    const [productTab, setProductTab] = useState('');
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


    const handleEditClick = (section) => {
      setEditMode((prev) => ({ ...prev, [section]: true }));
    };




    const handleSaveClick = (section) => {
      // Handle save functionality for the title section
      if (section === 'title') {
        // Save the updated title

      
        setEditMode((prev) => ({ ...prev, [section]: false }));
        setUpdateTitle(selectedTitle)
        // Update the title (assuming you want to store this in a state)
        console.log('Updated Title:', selectedTitle);
      } else if (section === 'features') {
        // Save the updated features
        setEditMode((prev) => ({ ...prev, [section]: false }));
        // Assuming selectedFeatures stores the updated feature data
        console.log('Updated Features:', selectedFeatures);
        setUpdateFeatures(selectedFeatures)
      } else if (section === 'description') {
        // Save the updated description
        setEditMode((prev) => ({ ...prev, [section]: false }));
        // Assuming selectedDescription stores the updated description
        console.log('Updated Description:', selectedDescription);
        setUpdateDescription(selectedDescription)
      }
    };
    
    // Save function for Features - same as handleSaveClick but for features
    const handleSaveClickFeatures = (section) => {
      setEditMode((prev) => ({ ...prev, [section]: false }));
      // Log the updated features
      console.log('Updated Features:', selectedFeatures);
    };
    
    // Save function for Description - same as handleSaveClick but for description
    const handleSaveClickDescription = (section) => {
      setEditMode((prev) => ({ ...prev, [section]: false }));
      // Log the updated description
      console.log('Updated Description:', selectedDescription);
    };


    
  
    useEffect(() => {
      fetchPromptList();
    }, []);
  
    // Fetch prompt list with GET method
    const fetchPromptList = async () => {
      try {
        const response = await fetch('https://product-assistant-gpt.onrender.com/fetchPromptList/');
        const data = await response.json();
        setPromptList(data.data); // Accessing the 'data' property from the response and storing it
      } catch (error) {
        console.error('Error fetching prompt list:', error);
      }
    };
  
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
        product_obj: {
          product_name: updateTitle || selectedTitle,
          long_description: updateDescription || selectedDescription,
          features: updateFeatures || selectedFeatures,
        },
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
        console.log('API response:', result); // Handle the response as needed
      } catch (error) {
        console.error('Error sending data to API:', error);
      }
    };
  
    // Handle the dropdown selection and trigger POST request
 
  
    

    const handleTitleChange = (e) => {
      const title = e.target.value;
      setSelectedTitle(title);
      // sendSelectedTitleToAPI(title);  // Send the selected title to the API
    };
  

    useEffect(() => {
      if (productTab?.features && Array.isArray(productTab.features)) {
        setSelectedFeatures(productTab.features.map((featureList) => [...featureList]));
      }
    }, [productTab]);
  
    // Handle changes in feature input fields
     // Initialize selectedFeatures when productTab.features changes
  useEffect(() => {
    if (productTab?.features && Array.isArray(productTab.features)) {
      setSelectedFeatures(productTab.features.map((featureList) => [...featureList]));
    }
  }, [productTab]);

  // Handle selecting a feature set when radio button is clicked
  const handleFeatureSetSelect = (event, selectedIndex) => {
    setSelectedFeatureSetIndex(selectedIndex);
  };

  // Handle feature change when editing in text field
  const handleFeatureChange = (e, listIndex, featureIndex) => {
    const updatedFeatures = [...selectedFeatures]; // Create a copy of the selected features array
    if (!updatedFeatures[listIndex]) {
      updatedFeatures[listIndex] = []; // Initialize the feature set array if it doesn't exist
    }
    updatedFeatures[listIndex][featureIndex] = e.target.value; // Update the specific feature
    setSelectedFeatures(updatedFeatures); // Update the state with the modified array
  };
// Handle selecting a feature set when radio button is clicked

  
    // const handleSaveClick = (type) => {
    //   if (type === 'features') {
    //     // Save updated features (replace with actual API call or logic)
    //     console.log('Saving features:', selectedFeatures);
    //   }
    // };
    
    const handleFeaturesChange = (event) => {
      const updatedFeatures = [...selectedFeatures];
      const { value, name } = event.target;
  
      if (name === 'featureSet') {
        updatedFeatures[value] = updatedFeatures[value].map((feature, index) =>
          index === event.target.dataset.index ? event.target.value : feature
        );
      }
  
      setSelectedFeatures(updatedFeatures);
    };
    // const handleFeaturesChange = (e) => {
    //   const selectedFeatureList = JSON.parse(e.target.value);
    //   setSelectedFeatures(selectedFeatureList);
    //   // Trigger API call for selected features if needed
    // };
  
    const handleDescriptionChange = (e) => {
      const description = e.target.value;
      console.log('1111',description)
      setSelectedDescription(description);
      // Trigger API call for selected description if needed
    };
  

    // const sendSelectedTitleToAPI = async (title) => {
    //   try {
    //     fetch(`https://product-assistant-gpt.onrender.com/fetchProductQuestions/${id}`)
    //     .then((response) => response.json())
    //   } catch (error) {
    //     console.error('Error sending title to API:', error);
    //   }
    // };
  
    const defaultImg = "https://via.placeholder.com/400";

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


// Define the handleQuestionClick function
// const handleQuestionClick = (questionId) => {
//     console.log("Question clicked:", questionId);
//     // You can send a message or perform any other action here
//     // Example: Send a message to the chat
//     const question = data.find((item) => item.id === questionId);
//     if (question) {
//         setMessages([...messages, { sender: 'user', text: question.question }]);
//     }
// };
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
 

// const handleSendMessage = () => {
//     if (userMessage.trim()) {
//         setMessages([...messages, { sender: 'user', text: userMessage }]);
//         setUserMessage('');

//         // Simulate a bot response (this can be replaced with actual bot logic)
//         setTimeout(() => {
//             setMessages((prevMessages) => [
//                 ...prevMessages,
//                 { sender: 'bot', text: 'Thank you for your message!' },
//             ]);
//         }, 1000);
//     }
// };





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

  
  // Handle feature checkbox change
  // const handleFeatureSetChange = (event, listIndex) => {
  //   const updatedSelectedFeatures = [...selectedFeatures];
    
  //   if (event.target.checked) {
  //     // Select all features in this feature set
  //     updatedSelectedFeatures[listIndex] = productTab.features[listIndex].map((_, featureIndex) => featureIndex);
  //   } else {
  //     // Deselect all features in this feature set
  //     updatedSelectedFeatures[listIndex] = [];
  //   }
    
  //   setSelectedFeatures(updatedSelectedFeatures);
  // };
  
  const handleBackClick = () => {
    // Correct syntax for query params
    navigate(`/`);
  };

  
  // Handle description checkbox change
  // const handleDescriptionChange = (event, descIndex) => {
  //   const newSelectedDescriptions = [...selectedDescriptions];
  //   if (event.target.checked) {
  //     newSelectedDescriptions.push(descIndex);
  //   } else {
  //     const index = newSelectedDescriptions.indexOf(descIndex);
  //     if (index > -1) {
  //       newSelectedDescriptions.splice(index, 1);
  //     }
  //   }
  //   setSelectedDescriptions(newSelectedDescriptions);
  // };
    const handleUpdateProduct = (updatedProduct) => {
        console.log('3333111',updatedProduct)
        setProductTab(updatedProduct); // Update the product details in parent component
    };

    const handleCloseAIModal = () => {
        setAIModalOpen(false);
    };
    useEffect(() => {
        fetch(`https://product-assistant-gpt.onrender.com/productDetail/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setProduct(data.data.product);
                setMainImage(data.data.product?.logo || defaultImg);
                setLoading(false);
            })
            .catch((error) => console.error("Error fetching product:", error));
    }, [id]);

    // const handleSendMessage = () => {
    //     if (!userMessage) return;

    //     setMessages((prevMessages) => [
    //         ...prevMessages,
    //         { text: userMessage, sender: 'user' }
    //     ]);

    //     setUserMessage('');

    //     setMessages((prevMessages) => [
    //         ...prevMessages,
    //         { text: 'Bot: Thanks for your message!', sender: 'bot' }
    //     ]);
    // };

    // const toggleChat = () => setChatOpen(!chatOpen);

  

    const handleAISuggestionSelect = (suggestion) => {
        setAIModalOpen(false);
    };

    const fetchAIOptions = () => {
        setAISuggestions(['AI Feature 1', 'AI Feature 2', 'AI Description']);
    };

    const handleTabChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    return (
        <Container>

<Box sx={{ display: "flex",marginLeft: '-43px', alignItems: "center", padding: "20px" }}>
              <IconButton sx={{ marginLeft: "-3%" }} onClick={handleBackClick}>
                <ArrowBack />
              </IconButton>
              <Typography gutterBottom sx={{ fontSize: "18px", marginTop: "7px" }}>
               Back to Products
              </Typography>
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
      image={mainImage || defaultImg}
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
            {prompt.name} {/* Display the name of the prompt */}
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
<TabPanel value={tabIndex} index={0}>
  {Array.isArray(productTab?.title) && productTab.title.length > 0 ? (
    <Box>
      <RadioGroup value={selectedTitle} onChange={handleTitleChange}>
        <List sx={{ padding: 0, fontSize: '14px', fontWeight: 'bold', mb: 1, maxWidth: '59ch', overflowWrap: 'break-word' }}>
          {productTab.title.map((title, index) => (
            <ListItem key={index}>
              <FormControlLabel
                value={title}
                control={<Radio />}
                label={<Typography variant="body1">{title}</Typography>}
              />

              {/* Show Edit Icon only if the title is selected and not in editMode */}
              {selectedTitle === title && !editMode.title && (
                <IconButton onClick={() => handleEditClick('title')}>
                  <EditIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
      </RadioGroup>

      {/* Show TextField to edit the title if in editMode */}
      {editMode.title && selectedTitle && (
        <Box>
          <TextField
            value={selectedTitle}
            onChange={handleTitleChange}
            label="Edit Title"
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <IconButton onClick={() => handleSaveClick('title')}>
            <SaveIcon />
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
    <Box display="flex" alignItems="center" marginBottom={1} sx={{ width: '50%' }}>
      <Typography variant="h6" marginRight={2} sx={{ fontSize: '1.2rem' }}>
        Features:
      </Typography>
      <IconButton onClick={() => handleEditClick('features')}>
        <EditIcon />
      </IconButton>
    </Box>

    {editMode.features ? (
      <Box>
        {Array.isArray(productTab?.features) && productTab.features.length > 0 ? (
          productTab.features.map((featureList, listIndex) => (
            <Box key={listIndex} sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Feature Set {listIndex + 1}
              </Typography>
              {featureList.map((feature, featureIndex) => (
                <Box key={featureIndex} sx={{ marginBottom: 1, maxWidth: '59ch', overflowWrap: 'break-word' }}>
                  {listIndex === selectedFeatureSetIndex ? (
                    <TextField
                      sx={{ maxWidth: '59ch', overflowWrap: 'break-word' }}
                      value={selectedFeatures[listIndex] ? selectedFeatures[listIndex][featureIndex] : feature}
                      onChange={(e) => handleFeatureChange(e, listIndex, featureIndex)}
                      label={`Feature ${featureIndex + 1}`}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ paddingLeft: '16px' }}>
                      • {feature}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No features available.
          </Typography>
        )}
        <IconButton onClick={() => handleSaveClick('features')}>
          <SaveIcon />
        </IconButton>
      </Box>
    ) : (
      <RadioGroup
        value={selectedFeatureSetIndex !== null ? selectedFeatureSetIndex : ''}
        onChange={(e) => handleFeatureSetSelect(e, Number(e.target.value))}
      >
        {Array.isArray(productTab.features) && productTab.features.length > 0 ? (
          productTab.features.map((featureList, listIndex) => (
            <React.Fragment key={listIndex}>
              <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Radio value={listIndex} checked={selectedFeatureSetIndex === listIndex} />
                  }
                  label={
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Feature Set {listIndex + 1}
                    </Typography>
                  }
                />
              </ListItem>

              {featureList.map((feature, featureIndex) => (
                <ListItem key={featureIndex} sx={{ padding: '4px 0', fontSize: '0.9rem' }}>
                  <Typography variant="body1">• {feature}</Typography>
                </ListItem>
              ))}
            </React.Fragment>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No features available.
          </Typography>
        )}
      </RadioGroup>
    )}
  </Box>
</TabPanel>

<TabPanel value={tabIndex} index={2}>
  <Typography variant="h6" marginTop={1} marginBottom={1} sx={{ fontSize: '1.2rem' }}>
    Description:
  </Typography>
  
  {productTab?.description?.length > 0 ? (
    <RadioGroup value={selectedDescription} onChange={handleDescriptionChange}>
      {productTab.description.map((desc, index) => (
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
          <FormControlLabel
            value={desc}
            control={<Radio />}
            label={<Typography variant="body2" sx={{ fontSize: '16px' }}>{desc}</Typography>}
          />
          
          {/* Show Edit button only if in editMode and the description is selected */}
          {selectedDescription === desc && !editMode.description && (
            <IconButton onClick={() => handleEditClick('description', desc)}>
              <EditIcon />
            </IconButton>
          )}
        </ListItem>
      ))}
    </RadioGroup>
  ) : (
    <Typography variant="body2" color="textSecondary">
      No description available.
    </Typography>
  )}

  {/* Show text field for editing when in editMode and the selected description is clicked */}
  {editMode.description && selectedDescription && (
    <Box>
      <TextField
        value={selectedDescription}
        onChange={handleDescriptionChange}
        label="Edit Description"
        fullWidth
        variant="outlined"
        margin="normal"
      />
      <IconButton onClick={() => handleSaveClick('description')}>
        <SaveIcon />
      </IconButton>
    </Box>
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
            width: isMaximized ? '100%' : '320px',  // Maximized window will take 100% width
            height: isMinimized ? '50px' : isMaximized ? '100%' : '450px',  // Minimized height is small        
            position: 'fixed',
    
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
    {/* Minimize Button
  <IconButton size="small" sx={{ color: '#fff' }} onClick={handleMinimize}>
              <MinimizeOutlinedIcon fontSize="small" />
            </IconButton>


            <IconButton size="small" sx={{ color: '#fff' }} onClick={handleMaximize}>
              <MaximizeOutlinedIcon fontSize="small" />
            </IconButton> */}

            {/* Close Button */}
            <IconButton size="small" sx={{ color: '#fff' }} onClick={toggleChat}>
              <CloseIcon fontSize="small" />
            </IconButton>
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

    
       {/* Display Questions from 'data' array */}
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
                            <IconButton
                                sx={{ padding: 0 }}
                                onClick={() => handleQuestionClick(item.id)}
                            >
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
                  handleSendMessage();  // Send the message when Enter key is pressed
                }
              }}
            />
            <Button variant="contained" sx={{ textTransform: 'capitalize' }} onClick={handleSendMessage}>
              Send
            </Button>
          </Box>
        </Box>
      )}
            {/* <IconButton onClick={toggleChat} sx={{ position: 'fixed', bottom: 20, right: 20, background: '#007bff', color: 'white', '&:hover': { background: '#0056b3' } }}>
                <ChatIcon />
            </IconButton> */}

      {/* Chat Box */}
      {/* {chatOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 320,
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: 6,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
         
          <Box
            sx={{
              bgcolor: '#007bff',
              color: '#fff',
              p: 1.5,
              position: 'relative',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Product Chat Assistant
            </Typography>
            <IconButton
              size="small"
              sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
              onClick={toggleChat} // Close chat on button click
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

     
          <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
           
            {messages.length === 0 && (
              <Paper sx={{ p: 1, bgcolor: '#f1f1f1', borderRadius: 2, maxWidth: '80%' }}>
                <Typography variant="body2">Hello! Ask me about this product.</Typography>
              </Paper>
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
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: message.sender === 'user' ? '#e0f3ff' : '#f1f1f1',
                    borderRadius: 2,
                    maxWidth: '80%',
                    wordWrap: 'break-word',
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                </Paper>
              </Box>
            ))}
            {responseChat && (
              <Box sx={{ alignSelf: 'flex-start' }}>
                <Paper sx={{ p: 1, bgcolor: '#f1f1f1', borderRadius: 2, maxWidth: '80%' }}>
                  <Typography variant="body2">{responseChat}</Typography>
                </Paper>
              </Box>
            )}
          </Box>

        
          <Box sx={{ display: 'flex', gap: 1, p: 1.5, borderTop: '1px solid #ddd' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type your message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
            <Button variant="contained" onClick={handleSendMessage}>
              Send
            </Button>
          </Box>
        </Box>
      )} */}
        
        </Container>
    );
};

export default ProductDetail;