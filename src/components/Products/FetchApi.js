import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { API_BASE_URL } from "../../utils/config";

export default function FetchApi({ onClose, onUpdateProduct,product:initialProduct}) {
  const { id } = useParams();
  const [product, setProduct] = useState(initialProduct||null);
  const [loading, setLoading] = useState(false);

  const [generateOptions, setGenerateOptions] = useState({
    title: false,
    features: false,
    description: false,
  });

  useEffect(() => {
    if(initialProduct)return
    fetch(`${API_BASE_URL}/productDetail/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data?.data?.product || null);
      })
      .catch((error) => console.error("Error fetching product:", error));
  }, [id]);

  const handleCheckboxChange = (event) => {
    setGenerateOptions({
      ...generateOptions,
      [event.target.name]: event.target.checked,
    });
  };

  const hasAiContent = (val) => {
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string") return val.trim() !== "";
    return !!val;
  };

  const aiTitle = product?.ai_generated_title;
  const aiFeatures = product?.ai_generated_features;
  const aiDescription = product?.ai_generated_description;

  const titleExists = hasAiContent(aiTitle);
  const featuresExists = hasAiContent(aiFeatures);
  const descriptionExists = hasAiContent(aiDescription);

  const handleFetchAiContent = () => {
    const selectedOptions = Object.keys(generateOptions).filter(
      (key) => generateOptions[key]
    );
    if (selectedOptions.length === 0 || !id) {
      console.warn(
        "Please select at least one option to generate or product ID is missing."
      );
      return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/fetchAiContent/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: id,
        title: generateOptions.title,
        features: generateOptions.features,
        description: generateOptions.description,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const mergedProduct = {
            ...product,
            ai_generated_title: data.title || aiTitle || [],
            ai_generated_features: data.features || aiFeatures || [],
            ai_generated_description:
              data.description || aiDescription || [],
          };
          onUpdateProduct(mergedProduct);
        }
      })
      .catch((error) => console.error("Error fetching AI content:", error))
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  const availableCount =
    (!titleExists ? 1 : 0) +
    (!featuresExists ? 1 : 0) +
    (!descriptionExists ? 1 : 0);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "40px",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          p: 1,
          marginTop: "-10px",
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{ color: "#1976d2" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "-15px",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Generate AI Content
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <FormControl component="fieldset">
          <FormGroup>
            {!titleExists && (
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
            )}
            {!featuresExists && (
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
            )}
            {!descriptionExists && (
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
            )}

            {availableCount === 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#666", mt: 1, fontStyle: "italic" }}
              >
                All content has been generated. Use Rewrite to improve it.
              </Typography>
            )}
          </FormGroup>
        </FormControl>
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ textTransform: "capitalize" }}
          onClick={handleFetchAiContent}
          disabled={loading || availableCount === 0}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create AI content"
          )}
        </Button>
      </Box>
    </Box>
  );
}