import React, { useState, useEffect, useRef } from 'react';

import {
    Button, Container, Grid,RadioGroup, Tooltip,Radio, Typography,Paper,FormControlLabel, Checkbox, Box, Badge, TextField, Modal, List, ListItem, CircularProgress, IconButton, Divider, Link, Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Import the Edit icon
import SaveIcon from '@mui/icons-material/Save'; // Import Save icon
import CancelIcon from '@mui/icons-material/Cancel';
import { API_BASE_URL } from '../../utils/config';


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

function TabContainer({productId, tabContent}) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [aiSuggestions, setAISuggestions] = useState([]);
    const [aiModalOpen, setAIModalOpen] = useState(false);
    const [mainImage, setMainImage] = useState('');

    // const [tabContent, settabContent] = useState({
    //   title: [],
    //   description: [],
    //   features: [],
    // });
    const [tabIndex, setTabIndex] = useState(0);
    // const [tabContent, settabContent] = useState('');
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
    const [selectedFeatures, setSelectedFeatures] = useState(tabContent?.features || []);
  // State for the updated title, features, and description
const [updateTitle, setUpdateTitle] = useState('');
const [updateFeatures, setUpdateFeatures] = useState([]);
const [updateDescription, setUpdateDescription] = useState('');
const [updatedDescription, setUpdatedDescription] = useState(tabContent?.description || []);
 // State for Title Tab (managed within TitleTab)
  const [editedTitle, setEditedTitle] = useState(''); // Likely managed in TitleTab
  const [editModeTitle, setEditModeTitle] = useState(false); // Likely managed in TitleTab

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



const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
};



  // Send POST request with selected prompt id
  const sendSelectedPromptToAPI = async () => {
    const requestPayload = {
      option: selectedPrompt,
      // product_obj: {
        title: updateTitle || selectedTitle,
        description: updateDescription || selectedDescription,
        features: updateFeatures || selectedFeatures,
        product_id: productId
      // },
    };

    // Modify this payload as per your API requirements
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
        // Update the UI with the new data after successful API call
        setSelectedTitle(result.data.title);
        setSelectedDescription(result.data.description);
        setSelectedFeatures(result.data.features);
        console.log("API response:", result);
      }
    } catch (error) {
      console.error('Error sending data to API:', error);
    }
  };

  // Handle the dropdown selection and trigger POST request



    // Handle the dropdown selection and trigger POST request
    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedPrompt(selectedValue);
    
        if (selectedValue) {
          // sendSelectedPromptToAPI(selectedValue);
        }
      };
    
    useEffect(() => {
      if (tabContent?.features) {
        setSelectedFeatures(tabContent.features.map(fs => [...(fs.value || [])]));
        setEditedFeatures(tabContent.features.map(fs => [...(fs.value || [])]));
      }
    }, [tabContent?.features]);
    
    const handleEditClick = (type) => {
      setEditMode({ ...editMode, [type]: true });
    };
    
    const handleFeatureSetSelect = (event, index) => {
      setSelectedFeatureSetIndex(index);
    };
    
    const handleFeatureChange = (event, listIndex, featureIndex) => {
      const newEditedFeatures = editedFeatures.map((featureSet, i) => {
        if (i === listIndex) {
          const updatedFeatureSet = [...featureSet];
          updatedFeatureSet[featureIndex] = event.target.value;
          return updatedFeatureSet;
        }
        return featureSet;
      });
      setEditedFeatures(newEditedFeatures);
    };
    
    const handleSaveClickFeatures = (type) => {
      if (type === 'features') {
        const updatedFeatures = tabContent.features.map((featureSet, index) => ({
          ...featureSet,
          value: editedFeatures[index],
        }));
        handleLocalUpdate({ ...tabContent, features: updatedFeatures });
        // handleBackendUpdate({ features: updatedFeatures });
        setEditMode({ features: false });
        setSelectedFeatureSetIndex(null);
      }
    };
    
    const handleBackendUpdate = (updatedData) => {
      console.log('Backend update called with:', updatedData);
      // Implement your API call here
    };
    
    const handleLocalUpdate = (updatedtabContent) => {
      console.log('Local state updated with:', updatedtabContent);
      // Implement your local state update here
    };
    
    
    
    useEffect(() => {
      const checkedTitle = tabContent?.title?.find(title => title?.checked);
      if (checkedTitle) {
        setSelectedTitle(checkedTitle.value);
      }
    }, [tabContent?.title]);
    
    const handleTitleChange = (event) => {
      setSelectedTitle(event.target.value);
      setEditedTitle(event.target.value);
    };
    
    const handleRadioChange = (type, index, value) => {
      setSelectedTitle(value);
      const updatedTitles = tabContent.title.map((title, i) => ({
        ...title,
        checked: i === index,
      }));
      handleLocalUpdate({ ...tabContent, title: updatedTitles });
      // handleBackendUpdate({ title: updatedTitles });
    };
    
    const handleEditClickTitle = (type, index) => {
      setEditMode({ ...editMode, [type]: true });
      setSelectedEditIndex(index);
      if (type === 'title' && tabContent?.title?.[index]?.value) {
        setEditedTitle(tabContent.title[index].value);
      }
    };
    
    const handleSaveClick = (type) => {
      if (type === 'title' && selectedEditIndex !== null) {
        const updatedTitles = tabContent.title.map((title, index) => {
          if (index === selectedEditIndex) {
            return { ...title, value: editedTitle, checked: true };
          } else {
            return { ...title, checked: false };
          }
        });
        handleLocalUpdate({ ...tabContent, title: updatedTitles });
        // handleBackendUpdate({ title: updatedTitles });
        setEditMode({ ...editMode, title: false });
        setSelectedEditIndex(null);
      }
    };
    
 
    useEffect(() => {
      // Initialize selectedDescription with the checked value on mount
      const checkedDescription = tabContent?.description?.find(desc => desc?.checked);
      if (checkedDescription) {
        setSelectedDescription(checkedDescription.value);
      }
    }, [tabContent?.description]);
    
    const handleRadioChangeDescription = (type, index, value) => {
      setSelectedDescription(value);
      const updatedDescriptions = tabContent.description.map((desc, i) => ({
        ...desc,
        checked: i === index,
      }));
      // Optimistically update the local state
      handleLocalUpdateDescription({ ...tabContent, description: updatedDescriptions });
      // You would typically call your backend update function here
      // handleBackendUpdate({ description: updatedDescriptions });
    };
    
    const handleLocalUpdateDescription = (updatedtabContent) => {
      // This function would update your local state that holds the tabContent data
      console.log('Local state updated with:', updatedtabContent);
      // For example, if you have a state like `setProductData(updatedtabContent)`
    };
    
    const handleDescriptionChange = (event) => {
      setSelectedDescription(event.target.value);
      setEditedDescription(event.target.value); // Update the editing state as well
    };
 
  return (
   
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
          {Array.isArray(tabContent?.title) && tabContent.title.length > 0 ? (
            <Box>
              <RadioGroup value={selectedTitle} onChange={handleTitleChange}>
                <List sx={{ padding: 0, fontSize: '14px', fontWeight: 'bold', mb: 1, maxWidth: '59ch', overflowWrap: 'break-word' }}>
                  {tabContent.title.map((title, index) => (
                    <ListItem key={index}>
                      <FormControlLabel
                        value={title.value}
                        control={<Radio checked={title.checked || false} onChange={(event) => handleRadioChange('title', index, event.target.value)} />}
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
                {Array.isArray(tabContent?.features) && tabContent.features.length > 0 ? (
                  tabContent.features.map((featureSet, listIndex) => (
                    <Box key={listIndex} sx={{ marginBottom: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Feature Set {listIndex + 1}
                      </Typography>
    
                      {Array.isArray(featureSet.value) && featureSet.value.length > 0 ? (
                        featureSet.value.map((feature, featureIndex) => (
                          <Box key={featureIndex} sx={{ marginBottom: 1, maxWidth: '59ch', overflowWrap: 'break-word' }}>
                            <TextField
                              sx={{ maxWidth: '59ch', overflowWrap: 'break-word' }}
                              value={editedFeatures[listIndex] ? editedFeatures[listIndex][featureIndex] : ''}
                              onChange={(e) => handleFeatureChange(e, listIndex, featureIndex)}
                              label={`Feature ${featureIndex + 1}`}
                              fullWidth
                              variant="outlined"
                              margin="normal"
                            />
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body1" color="textSecondary">
                          No features available.
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No features available.
                  </Typography>
                )}
                <IconButton onClick={() => handleSaveClickFeatures('features')}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={() => setEditMode({...editMode, features: false})}>
                  <CancelIcon />
                </IconButton>
              </Box>
            ) : (
              <RadioGroup value={selectedFeatureSetIndex !== null ? selectedFeatureSetIndex.toString() : ''} onChange={(e) => handleFeatureSetSelect(e, Number(e.target.value))}>
                {Array.isArray(tabContent.features) && tabContent.features.length > 0 ? (
                  tabContent.features.map((featureSet, listIndex) => (
                    <React.Fragment key={listIndex}>
                      <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                          control={<Radio value={listIndex} checked={selectedFeatureSetIndex === listIndex} />}
                          label={<Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Feature Set {listIndex + 1}</Typography>}
                        />
                      </ListItem>
    
                      {Array.isArray(featureSet.value) && featureSet.value.length > 0 ? (
                        featureSet.value.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ padding: '4px 0', fontSize: '0.9rem' }}>
                            <Typography variant="body1">• {feature}</Typography>
                          </ListItem>
                        ))
                      ) : (
                        <Typography variant="body1" color="textSecondary">
                          No features available.
                        </Typography>
                      )}
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
    
      {tabContent?.description?.length > 0 ? (
        <RadioGroup value={selectedDescription} onChange={handleDescriptionChange}>
          {tabContent.description.map((desc, index) => {
            const descValue = desc?.value || '';
            const checked = desc?.checked || false;
    
            return (
              <ListItem key={index} sx={{ fontWeight: 'bold', fontSize: '16px', mb: 1, maxWidth: '59ch', overflowWrap: 'break-word', display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  value={descValue}
                  control={<Radio checked={checked} />} // Bind checked state
                  label={<Typography variant="body2" sx={{ fontSize: '16px' }}>{descValue}</Typography>}
                  onChange={(event) => handleRadioChangeDescription('description', index, event.target.value)} // Handle radio change
                />
                {selectedDescription === descValue && !editMode.description && (
                  <IconButton onClick={() => handleEditClick('description', index)}>
                    <EditIcon />
                  </IconButton>
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
    
      {/* Show text field for editing */}
      {editMode.description && selectedEditIndex !== null && (
        <Box>
          <TextField
            value={editedDescription} // Use a separate state for editing
            onChange={(e) => setEditedDescription(e.target.value)}
            label="Edit Description"
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <IconButton onClick={() => handleSaveClick('description')}>
            <SaveIcon />
          </IconButton>
          <IconButton onClick={() => setEditMode({...editMode, description: false,})}>
            <CancelIcon />
          </IconButton>
        </Box>
      )}
    </TabPanel>
    
    
      </Box>
  )
}

export default TabContainer