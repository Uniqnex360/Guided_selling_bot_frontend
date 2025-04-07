import React, { useState, useEffect } from 'react';
import { Button, FormControl, FormGroup, FormControlLabel, Checkbox, Box, IconButton, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

export default function FetchApi({ onClose, onUpdateProduct }) {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const defaultImg = "https://via.placeholder.com/400";

    const [generateOptions, setGenerateOptions] = useState({
        title: false,
        features: false,
        description: false,
    });

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

    const handleCheckboxChange = (event) => {
        setGenerateOptions({
            ...generateOptions,
            [event.target.name]: event.target.checked,
        });
    };

    const handleFetchAiContent = () => {
        const selectedOptions = Object.keys(generateOptions).filter(
            (key) => generateOptions[key]
        );

        if (selectedOptions.length === 0 || !id) {
            console.warn("Please select at least one option to generate or product ID is missing.");
            return;
        }

        setLoading(true); // Show loading indicator during API call

        fetch(`https://product-assistant-gpt.onrender.com /fetchAiContent/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: id,
                title: generateOptions.title,
                features: generateOptions.features,
                description: generateOptions.description,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('oppo', data?.data);  // Log fetched data to console
                const updatedProduct = data?.data;  // Assign the actual product data to updatedProduct
                console.log("AI Content Fetched:", data);  // Log the full response
            
                if (data?.status) {
                    // Update product details with AI response
                    onUpdateProduct(updatedProduct);  // Pass updated product details back to parent component
                }
            })
            
            .catch((error) => console.error("Error fetching AI content:", error))
            .finally(() => {
                setLoading(false); // Hide loading indicator
                onClose(); // Close the modal
            });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            {/* Close button aligned at the top right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={onClose} aria-label="close" sx={{ color: '#1976d2' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Generate AI Content
                </Typography>

                {/* Options to generate AI content */}
                <FormControl component="fieldset">
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={generateOptions.title}
                                    onChange={handleCheckboxChange}
                                    name="title"
                                />
                            }
                            label="Title"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={generateOptions.features}
                                    onChange={handleCheckboxChange}
                                    name="features"
                                />
                            }
                            label="Features"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={generateOptions.description}
                                    onChange={handleCheckboxChange}
                                    name="description"
                                />
                            }
                            label="Description"
                        />
                    </FormGroup>
                </FormControl>
            </Box>

            {/* Action button to fetch AI content */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" onClick={handleFetchAiContent} disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Fetch AI Content'}
                </Button>
            </Box>
        </Box>
    );
}
