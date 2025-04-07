import React, { useState, useEffect, useRef } from 'react';

import {
    Button, Container, Grid, Typography,Paper,FormControlLabel, Checkbox, Box, Badge, TextField, Modal, List, ListItem, CircularProgress, IconButton, Divider, Link, Tabs, Tab
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router-dom';
import CardMedia from '@mui/material/CardMedia';
import { styled } from '@mui/material/styles';
import FetchApi from './FetchApi';

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
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [responseChat, setResponseChat] = useState('')
    const messagesEndRef = useRef(null); // Reference for the end of the chat messages
    const [isBotTyping, setIsBotTyping] = useState(false); // State for bot typing indicator
    const currentPrice = product?.msrp;
    const originalPrice = product?.list_price;
    const discountPercentage = product?.discount;
    const currency = product?.currency || '$'; // Default to $ if currency is not available

    const [data, setData] = useState([]); // to hold the fetched questions
    // Initialize selectedFeatures once productTab.features is available
    useEffect(() => {
      if (Array.isArray(productTab?.features)) {
        // Initialize selectedFeatures as an empty array for each feature set
        const initialSelectedFeatures = productTab.features.map(() => []);
        setSelectedFeatures(initialSelectedFeatures);
      }
    }, [productTab?.features]);
  
   

  
    const defaultImg = "https://via.placeholder.com/400";

    const handleAIOptions = () => {
        setAIModalOpen(true);
    };

// Chat pot

const toggleChat = () => setChatOpen(!chatOpen);

useEffect(() => {
    if (chatOpen && id) {
      setLoading(true);
      fetch(`https://product-assistant-gpt.onrender.com /fetchProductQuestions/${id}`)
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
      fetch('https://product-assistant-gpt.onrender.com /chatbotView/', {
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


    // Handle title checkbox change
  const handleTitleChange = (event, titleIndex) => {
    const newSelectedTitles = [...selectedTitles];
    if (event.target.checked) {
      newSelectedTitles.push(titleIndex);
    } else {
      const index = newSelectedTitles.indexOf(titleIndex);
      if (index > -1) {
        newSelectedTitles.splice(index, 1);
      }
    }
    setSelectedTitles(newSelectedTitles);
  };

   // Handle feature checkbox change
  // Handle feature checkbox change
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
  
  const handleBackClick = () => {
    // Correct syntax for query params
    navigate(`/`);
  };

  // Handle description checkbox change
  const handleDescriptionChange = (event, descIndex) => {
    const newSelectedDescriptions = [...selectedDescriptions];
    if (event.target.checked) {
      newSelectedDescriptions.push(descIndex);
    } else {
      const index = newSelectedDescriptions.indexOf(descIndex);
      if (index > -1) {
        newSelectedDescriptions.splice(index, 1);
      }
    }
    setSelectedDescriptions(newSelectedDescriptions);
  };
    const handleUpdateProduct = (updatedProduct) => {
        console.log('3333111',updatedProduct)
        setProductTab(updatedProduct); // Update the product details in parent component
    };

    const handleCloseAIModal = () => {
        setAIModalOpen(false);
    };
    useEffect(() => {
        fetch(`https://product-assistant-gpt.onrender.com /productDetail/${id}`)
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
                <Grid item xs={12} md={6} sx={{marginRight:'20%',  padding: '30px'}}  > {/* Occupies half width */}
                    <Box display="flex" flexDirection="column" alignItems="center">
                        {/* Main Image */}
                        <CardMedia
                            component="img"
                            image={mainImage || defaultImg}
                            alt="Product Image"
                            sx={{
                                borderRadius: "8px",
                                marginBottom: "16px",
                                height: "250px",
                                width: "321px",
                                // width: "100%",
                                objectFit: "contain",
                            }}
                        />
                        {/* Thumbnails */}
                        <Box display="flex" flexDirection="row" gap={2}>
                            {product?.images?.map((img, index) => {
                                if (!img) return null;
                                return (
                                    <CardMedia
                                        key={`${img}-${index}`}
                                        component="img"
                                        image={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        sx={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            border: mainImage === img ? "2px solid #000" : "none",
                                        }}
                                        onClick={() => setMainImage(img)}
                                    />
                                );
                            })}
                        </Box>
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
    maxWidth: '35ch',  // Maximum width based on character count
    overflowWrap: 'break-word',  // Ensures text wraps when it exceeds the width
  }}
>
  {product?.product_name || 'Product Title Not Available'}
</Typography>

{/* SKU & MPN */}
<Box sx={{ display: 'flex', flexDirection: 'column', mb: 1, alignItems: 'flex-start' }}>



<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {currentPrice !== undefined && currentPrice !== null && (
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a73e8', mr: 1, fontSize: '1.1rem' }}>
                        {currency}{currentPrice}
                    </Typography>
                )}
                {originalPrice !== undefined && originalPrice !== null && originalPrice > currentPrice && (
                    <Typography variant="body2" sx={{ color: '#777', textDecoration: 'line-through', mr: 1, fontSize: '0.9rem' }}>
                        {currency}{originalPrice}
                    </Typography>
                )}
                {discountPercentage && (
                    <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold', fontSize: '0.9rem' }}>
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
            
    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button variant="outlined" color="primary" onClick={handleAIOptions} size="small">
            Generate
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
        width: 400,
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
        <Button onClick={handleCloseAIModal} sx={{ mt: 2 }}>Close</Button>
    </Box>
</Modal>


                            <Divider sx={{ my: 2 }} />
            

                        </Box>
                    )}
                </Grid>
            </Grid>

       
   <Grid container  spacing={2}>
  {/* Left Side - Product Features and Description */}
  <Grid  item xs={6} sx={{width:'50%'}}>
    {/* Product Features */}
    <Box display="flex" alignItems="center" marginTop={3} marginBottom={1}>
      <Typography variant="h6" marginRight={2} sx={{ fontSize: '1.2rem' }}>
        Features:
      </Typography>
    </Box>

    <List>
      {product?.features?.map((feature, index) => (
        <ListItem key={index} sx={{ padding: '4px 0', fontSize: '0.9rem' }}>
       • {feature}
        </ListItem>
      ))}
    </List>

    {/* Product Description */}
    <Typography variant="h6" marginTop={3} marginBottom={1} sx={{ fontSize: '1.2rem' }}>
      Description:
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {product?.long_description || 'No description available.'}
    </Typography>
  </Grid>

  {/* Right Side - Empty */}
  <Grid  item xs={6}>
  <Box>

    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="product details tabs">
      <Tab label="Product Title" {...a11yProps(0)} />
      <Tab label="Features" {...a11yProps(1)} />
      <Tab label="Description" {...a11yProps(2)} />
    </Tabs>

 
<TabPanel value={tabIndex} index={0}>
        <List sx={{ padding: 0 }}>
          {productTab?.title?.length > 0 ? (
            productTab.title.map((title, index) => (
              <ListItem key={index}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTitles.includes(index)}
                      onChange={(e) => handleTitleChange(e, index)}
                    />
                  }
                  label={<Typography variant="body1">{title}</Typography>}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <Typography variant="body1" color="textSecondary">No title found</Typography>
            </ListItem>
          )}
        </List>
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
  <Box>
    <Box display="flex" alignItems="center" marginBottom={1} sx={{ width: '50%' }}>
      <Typography variant="h6" marginRight={2} sx={{ fontSize: '1.2rem' }}>
        Features:
      </Typography>
    </Box>

    {/* Fallback message for features */}
    {Array.isArray(productTab?.features) && productTab.features.length > 0 ? (
      <List sx={{ paddingLeft: 2 }}>
        {productTab.features.map((featureList, listIndex) => (
          <React.Fragment key={listIndex}>
            {/* Render checkbox only for each feature set */}
            <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedFeatures[listIndex]?.length > 0}  // Check if any features are selected in the set
                    onChange={(e) => handleFeatureSetChange(e, listIndex)}  // Handle the selection for the feature set
                  />
                }
                label={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Feature Set {listIndex + 1}
                  </Typography>
                }
              />
            </ListItem>

            {/* Render the individual features under the feature set */}
            {featureList.map((feature, featureIndex) => (
              <ListItem key={featureIndex} sx={{ padding: '4px 0', fontSize: '0.9rem' }}>
                <Typography variant="body1">• {feature}</Typography>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>
    ) : (
      <Typography variant="body1" color="textSecondary">
        No features found
      </Typography>
    )}
  </Box>
</TabPanel>


      {/* Description Tab */}
      <TabPanel value={tabIndex} index={2}>
        <Typography variant="h6" marginTop={1} marginBottom={1} sx={{ fontSize: '1.2rem' }}>
          Description:
        </Typography>

        {productTab?.description?.length > 0 ? (
          productTab.description.map((desc, index) => (
            <ListItem key={index}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedDescriptions.includes(index)}
                    onChange={(e) => handleDescriptionChange(e, index)}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      marginBottom: 1,
                      maxWidth: '100%',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {desc}
                  </Typography>
                }
              />
            </ListItem>
          ))
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
            bottom: 90,
            right: 20,
            width: 320,
            height: '450px',
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
            <IconButton
              size="small"
              sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
              onClick={toggleChat} // Close chat on button click
            >
              <CloseIcon fontSize="small" />
            </IconButton>
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

            {/* Display Chat Messages */}
            {/* {messages.length === 0 && (
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
                <Typography
                    key={index}
                    sx={{
                        textAlign: message.sender === 'user' ? 'right' : 'left',
                        backgroundColor: message.sender === 'user' ? '#d1e7ff' : '#f1f1f1',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        margin: '5px 0',
                        display: 'inline-block',
                        maxWidth: '80%',
                    }}
                >
                    {message.text}
                </Typography>
            ))}
        */}

            {/* {!loading && data.length > 0 && (
              <Paper sx={{ p: 1, bgcolor: '#f1f1f1', borderRadius: 2, maxWidth: '80%' }}>
                <Typography variant="body2">Here are some questions you can ask:</Typography>
                {data.map((item) => (
                  <Typography variant="body2" key={item.id}>
                    - {item.question}
                  </Typography>
                ))}
              </Paper>
            )} */}

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