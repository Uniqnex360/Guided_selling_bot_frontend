import React, { useEffect, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import MinimizeOutlinedIcon from '@mui/icons-material/MinimizeOutlined';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import {
    Typography,
    Box,
    TextField,
    IconButton,
    Paper,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Tooltip,
    TablePagination,
    FormControlLabel,
    FormControl,
    Select,
    MenuItem,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Snackbar,
    Alert,
    Slider,
    Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';
import { ListAlt as ListAltIcon, GridView as GridViewIcon } from '@mui/icons-material';
import DotLoading from '../Loading/DotLoading';
import { API_BASE_URL } from '../../utils/config';

const ProductList = () => {
    // State variables
    const [products, setProducts] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [sortConfig, setSortConfig] = useState({ key: 'sku', direction: 'asc' });
    const [loading, setLoading] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [categoryOptions, setCategoryOptions] = useState([]);
    const queryParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(queryParams.get('page'), 10) || 0;
    const [page, setPage] = useState(initialPage);
    const [categoryFilters, setCategoryFilters] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [maximized, setMaximized] = useState(true);
    const [dialogSize, setDialogSize] = useState({ width: 400, height: 450 });
    const [priceRange, setPriceRange] = useState([0, 140]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    const priceRangeOptions = [
        { id: 1, label: 'Low ($0 - $50)', value: [0, 50], count: 58 },
        { id: 2, label: 'Mid ($50 - $99)', value: [50, 99], count: 49 },
        { id: 3, label: 'High ($99 & above)', value: [99, 1000], count: 33 },
    ];
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [favorites, setFavorites] = useState(new Set());

    // Helper functions
    const toggleDialogSize = () => {
        setMaximized(prev => !prev);
    };

    const getSortSymbol = (column) => {
        if (sortConfig.key === column) {
            return sortConfig.direction === 'asc' ? '↑' : '↓';
        }
        return '↕';
    };

    const toggleFavorite = (productId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(productId)) {
                newFavorites.delete(productId);
            } else {
                newFavorites.add(productId);
            }
            return newFavorites;
        });
    };

    // API functions
    const fetchCategories = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/fourth_level_categories/`)
            .then(response => response.json())
            .then(data => {
                setCategoryOptions(data.data.categories || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    };

    const fetchFilters = (categoryId) => {
        setLoading(true);
        fetch(`${API_BASE_URL}/category_filters/?category_id=${categoryId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                const filters = data.data.filters;
                const filtersWithCheckbox = filters.map((filter) => ({
                    ...filter,
                    options: filter.config.options.map((option) => ({
                        label: option.toString().trim(),
                        checked: false,
                    })),
                }));
                setCategoryFilters(filtersWithCheckbox);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching filters:', error);
                setLoading(false);
            });
    };

    const fetchProducts = () => {
        setLoading(true);
        const requestBody = {
            ...(selectedCategoryId && { category_id: selectedCategoryId }),
            search_query: searchQuery?.trim() || '',
            ...(selectedBrands.length > 0 && { brands: selectedBrands }),
        };
        if (
            selectedCategoryId &&
            selectedFilters &&
            Object.keys(selectedFilters).length > 0 &&
            Object.values(selectedFilters).some(arr => Array.isArray(arr) && arr.length > 0)
        ) {
            requestBody.attributes = selectedFilters;
        }
        fetch(`${API_BASE_URL}/productList/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
            .then(response => response.json())
            .then(responseData => {
                let productList = responseData.data?.products || [];

                // Client-side filtering for brands if selectedBrands has values
                if (selectedBrands.length > 0) {
                    productList = productList.filter(product => selectedBrands.includes(product.brand_name));
                }

                setProducts(productList);
                setFilteredProducts(productList);

                // Extract unique brands from the filtered product list
                const uniqueBrands = [...new Set(productList.map(product => product.brand_name))].filter(Boolean);
                const brandsWithCount = uniqueBrands.map(brandName => ({
                    id: brandName,
                    name: brandName,
                    count: productList.filter(p => p.brand_name === brandName).length,
                }));
                setBrandOptions(brandsWithCount);

                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                setLoading(false);
            });
    };

    // Event handlers
    const handleCategoryChange = (event) => {
        const categoryId = event.target.value;
        setSelectedCategoryId(categoryId);
        if (categoryId) {
            fetchFilters(categoryId);
            setSnackbarMessage('Category selected successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        }
    };

    const handleFilterChange = (filterName, option) => {
        const newFilters = { ...selectedFilters };
        if (newFilters[filterName]) {
            if (newFilters[filterName].includes(option)) {
                newFilters[filterName] = newFilters[filterName].filter(f => f !== option);
            } else {
                newFilters[filterName].push(option);
            }
        } else {
            newFilters[filterName] = [option];
        }
        setSelectedFilters(newFilters);
    };

    const handleBrandChange = (brandName) => {
        const newSelectedBrands = selectedBrands.includes(brandName)
            ? selectedBrands.filter(name => name !== brandName)
            : [...selectedBrands, brandName];
        setSelectedBrands(newSelectedBrands);
    };

    const handlePriceRangeChange = (rangeId) => {
        if (selectedPriceRanges.includes(rangeId)) {
            setSelectedPriceRanges(selectedPriceRanges.filter(id => id !== rangeId));
        } else {
            setSelectedPriceRanges([...selectedPriceRanges, rangeId]);
        }
    };

    const handleClearFilters = () => {
        setSelectedCategoryId('');
        setSelectedFilters({});
        setSelectedBrands([]);
        setSelectedPriceRanges([]);
        setPriceRange([0, 140]);
        setCategoryFilters([]);
        setSnackbarMessage('Reset successfully!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        const requestBody = {
            search_query: ''
        };
        fetch(`${API_BASE_URL}/productList/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
            .then(response => response.json())
            .then(responseData => {
                const productList = responseData.data?.products || [];
                setProducts(productList);
                setFilteredProducts(productList);
            });
    };

    const sortProducts = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        const sorted = [...filteredProducts].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'asc' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        setFilteredProducts(sorted);
        setSortConfig({ key, direction });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        if (event.target.value) {
            setSelectedCategoryId('');
        }
        setPage(0);
    };

    const handleClearSearch = () => {
        setSelectedCategoryId('');
        setSearchQuery('');
        setPage(0);
        setSortConfig({ key: 'sku', direction: 'asc' });
        const requestBody = {
            search_query: ''
        };
        fetch(`${API_BASE_URL}/productList/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
            .then(response => response.json())
            .then(responseData => {
                const productList = responseData.data?.products || [];
                setProducts(productList);
                setFilteredProducts(productList);
                setSnackbarMessage('Reset successfully!');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setSnackbarMessage('Something went wrong!');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            });
    };

    const toggleViewMode = (mode) => {
        setViewMode(mode);
    };

    // Effects
    useEffect(() => {
        // Fetch categories on component mount
        fetchCategories();
    }, []);

    useEffect(() => {
        // Set default category and fetch products and filters once category options are available
        if (categoryOptions.length > 0 && !selectedCategoryId) {
            // Find the category with the specified name or default to the first one
            const defaultCategory = categoryOptions.find(cat => cat.name === 'French Door Refrigerators') || categoryOptions[0];
            setSelectedCategoryId(defaultCategory.id);
        }
    }, [categoryOptions, selectedCategoryId]);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchFilters(selectedCategoryId);
            fetchProducts();
        }
    }, [selectedCategoryId, selectedFilters, searchQuery, selectedBrands]);


    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Enhanced Left Sidebar */}
            <Box
                sx={{
                    width: 280,
                    backgroundColor: '#fff',
                    borderRight: '1px solid #e0e0e0',
                    padding: 2,
                    overflow: 'auto',
                    flexShrink: 0,
                }}
            >
                {/* Categories Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '16px', color: '#333' }}>
                        Categories
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <Select
                            value={selectedCategoryId}
                            onChange={handleCategoryChange}
                            size="small"
                            displayEmpty
                            sx={{
                                backgroundColor: '#f8f9fa',
                                '& .MuiSelect-select': {
                                    padding: '8px 12px',
                                    fontSize: '14px'
                                }
                            }}
                        >
                            <MenuItem value="" sx={{ fontSize: '14px', color: '#6c757d' }}>
                                All Categories
                            </MenuItem>
                            {categoryOptions.map((category) => (
                                <MenuItem key={category.id} value={category.id} sx={{ fontSize: '14px' }}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Brands Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '16px', color: '#333' }}>
                        Brands
                    </Typography>
                    {brandOptions.map((brand) => (
                        <FormControlLabel
                            key={brand.id}
                            control={
                                <Checkbox
                                    checked={selectedBrands.includes(brand.id)}
                                    onChange={() => handleBrandChange(brand.id)}
                                    size="small"
                                    sx={{ padding: '4px' }}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="body2" sx={{ fontSize: '14px', color: '#333' }}>
                                        {brand.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '12px', color: '#6c757d' }}>
                                        {brand.count}
                                    </Typography>
                                </Box>
                            }
                            sx={{
                                display: 'block',
                                mb: 0.5,
                                width: '100%',
                                margin: 0,
                                '& .MuiFormControlLabel-label': {
                                    width: '100%',
                                    marginLeft: '8px'
                                }
                            }}
                        />
                    ))}
                    <Button
                        variant="text"
                        color="primary"
                        size="small"
                        sx={{
                            mt: 1,
                            textTransform: 'none',
                            fontSize: '12px',
                            padding: '4px 8px'
                        }}
                    >
                        View all brands ({brandOptions.length})
                    </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Price Range Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '16px', color: '#333' }}>
                        Price Range
                    </Typography>

                    {/* Show all link */}
                    <Button
                        variant="text"
                        color="primary"
                        size="small"
                        sx={{
                            mb: 2,
                            textTransform: 'none',
                            fontSize: '12px',
                            padding: '4px 0',
                            textDecoration: 'underline'
                        }}
                    >
                        Show all
                    </Button>

                    {/* Price range checkboxes */}
                    {priceRangeOptions.map((priceOption) => (
                        <FormControlLabel
                            key={priceOption.id}
                            control={
                                <Checkbox
                                    checked={selectedPriceRanges.includes(priceOption.id)}
                                    onChange={() => handlePriceRangeChange(priceOption.id)}
                                    size="small"
                                    sx={{ padding: '4px' }}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="body2" sx={{ fontSize: '14px', color: '#333' }}>
                                        {priceOption.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '12px', color: '#6c757d' }}>
                                        {priceOption.count}
                                    </Typography>
                                </Box>
                            }
                            sx={{
                                display: 'block',
                                mb: 0.5,
                                width: '100%',
                                margin: 0,
                                '& .MuiFormControlLabel-label': {
                                    width: '100%',
                                    marginLeft: '8px'
                                }
                            }}
                        />
                    ))}

                    {/* Price Slider */}
                    <Box sx={{ mt: 3, px: 1 }}>
                        <Slider
                            value={priceRange}
                            onChange={(event, newValue) => setPriceRange(newValue)}
                            valueLabelDisplay="auto"
                            min={0}
                            max={140}
                            sx={{
                                color: '#2563EB',
                                '& .MuiSlider-thumb': {
                                    width: 16,
                                    height: 16,
                                },
                                '& .MuiSlider-rail': {
                                    height: 4,
                                },
                                '& .MuiSlider-track': {
                                    height: 4,
                                },
                            }}
                        />

                        {/* Price input fields */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                            <TextField
                                size="small"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                sx={{
                                    width: 60,
                                    '& .MuiInputBase-input': {
                                        fontSize: '12px',
                                        padding: '6px 8px'
                                    }
                                }}
                            />
                            <Typography sx={{ fontSize: '14px', color: '#6c757d' }}>to</Typography>
                            <TextField
                                size="small"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 140])}
                                sx={{
                                    width: 60,
                                    '& .MuiInputBase-input': {
                                        fontSize: '12px',
                                        padding: '6px 8px'
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    minWidth: 'auto',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    backgroundColor: '#2563EB',
                                    '&:hover': {
                                        backgroundColor: '#1e4baf',
                                    }
                                }}
                            >
                                GO
                            </Button>
                        </Box>

                        {/* Current price display */}
                        <Typography sx={{ fontSize: '12px', color: '#6c757d', mt: 1 }}>
                            Current: ${priceRange[0]} - ${priceRange[1]}
                        </Typography>
                    </Box>
                </Box>

                {/* Clear All Button */}
                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={handleClearFilters}
                        sx={{
                            textTransform: 'none',
                            fontSize: '14px',
                            padding: '8px 16px',
                            borderColor: '#2563EB',
                            color: '#2563EB',
                            '&:hover': {
                                borderColor: '#1e4baf',
                                backgroundColor: 'rgba(37, 99, 235, 0.04)'
                            }
                        }}
                    >
                        Clear All
                    </Button>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: 'white'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            placeholder="Search..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{ width: 300 }}
                        />
                        <IconButton onClick={handleClearSearch}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.37-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">Total Products: {products.length}</Typography>

                        {/* View Mode Buttons */}
                        <Tooltip title="List View">
                            <IconButton
                                onClick={() => toggleViewMode('list')}
                                color={viewMode === 'list' ? 'primary' : 'default'}
                                sx={{
                                    backgroundColor: viewMode === 'list' ? '#2563EB' : 'transparent',
                                    color: viewMode === 'list' ? 'white' : 'inherit',
                                    '&:hover': {
                                        backgroundColor: viewMode === 'list' ? '#1e4baf' : 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <ListAltIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Card View">
                            <IconButton
                                onClick={() => toggleViewMode('card')}
                                color={viewMode === 'card' ? 'primary' : 'default'}
                                sx={{
                                    backgroundColor: viewMode === 'card' ? '#2563EB' : 'transparent',
                                    color: viewMode === 'card' ? 'white' : 'inherit',
                                    '&:hover': {
                                        backgroundColor: viewMode === 'card' ? '#1e4baf' : 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <GridViewIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Content Area */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: '#f1f3f6' }}>
                    {viewMode === 'list' ? (
                        <TableContainer component={Paper}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {[
                                            { label: 'Image' },
                                            { label: 'SKU', key: 'sku' },
                                            { label: 'Title', key: 'name' },
                                            { label: 'MPN', key: 'mpn' },
                                            { label: 'Category', key: 'category' },
                                            { label: 'Brand', key: 'brand_name' },
                                            { label: 'Price', key: 'price' },
                                        ].map((col, index) => (
                                            <TableCell
                                                key={index}
                                                sx={{
                                                    textAlign: 'center',
                                                    cursor: col.key ? 'pointer' : 'default',
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#f5f5f5',
                                                    fontSize: '14px',
                                                }}
                                                onClick={col.key ? () => sortProducts(col.key) : undefined}
                                            >
                                                {col.label} {col.key ? getSortSymbol(col.key) : ''}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <DotLoading />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No Data Found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProducts
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((product) => (
                                                <TableRow key={product.id} hover>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ textDecoration: 'none' }}>
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    objectFit: 'contain',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ddd',
                                                                }}
                                                            />
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{product.sku}</TableCell>
                                                    <TableCell sx={{ textAlign: 'left', maxWidth: 300 }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
                                                            {product.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
                                                            {product.mpn}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{product.category}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{product.brand_name || 'N/A'}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>${product.price}</TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        // Card Grid
                        <Box sx={{ width: '100%' }}>
                            {loading ? (
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <DotLoading />
                                </Box>
                            ) : filteredProducts.length === 0 ? (
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Typography>No Data Found</Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={2} sx={{ margin: 0, width: '100%' }}>
                                    {filteredProducts
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((product) => (
                                            <Grid
                                                item
                                                xs={12}
                                                sm={6}
                                                md={4}
                                                lg={2}
                                                xl={2}
                                                key={product.id}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    paddingLeft: '8px !important',
                                                    paddingTop: '8px !important',
                                                }}
                                            >
                                                <Card
                                                    sx={{
                                                        width: '100%',
                                                        maxWidth: '200px',
                                                        height: '350px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        position: 'relative',
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #f0f0f0',
                                                        borderRadius: '6px',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                                        transition: 'all 0.2s ease-in-out',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            transform: 'translateY(-2px)',
                                                        },
                                                    }}
                                                >
                                                    {/* Wishlist Icon */}
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            toggleFavorite(product.id);
                                                        }}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            zIndex: 2,
                                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                                            width: 28,
                                                            height: 28,
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(255,255,255,1)',
                                                                transform: 'scale(1.1)',
                                                            },
                                                        }}
                                                        size="small"
                                                    >
                                                        {favorites.has(product.id) ? (
                                                            <FavoriteIcon sx={{ fontSize: 14, color: '#ff3e6c' }} />
                                                        ) : (
                                                            <FavoriteBorderIcon sx={{ fontSize: 14, color: '#878787' }} />
                                                        )}
                                                    </IconButton>

                                                    <Link
                                                        to={`/details/${product.id}`}
                                                        style={{
                                                            textDecoration: 'none',
                                                            color: 'inherit',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            height: '100%',
                                                        }}
                                                    >
                                                        {/* Product Image */}
                                                        <Box
                                                            sx={{
                                                                height: '150px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                p: 1.5,
                                                                borderBottom: '1px solid #f0f0f0',
                                                                backgroundColor: '#fafafa',
                                                            }}
                                                        >
                                                            <CardMedia
                                                                component="img"
                                                                image={product.image_url}
                                                                alt={product.name}
                                                                sx={{
                                                                    maxWidth: '100%',
                                                                    maxHeight: '100%',
                                                                    objectFit: 'contain',
                                                                    transition: 'transform 0.2s ease-in-out',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.05)',
                                                                    },
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Product Details */}
                                                        <CardContent sx={{
                                                            flex: 1,
                                                            p: 1.5,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'space-between',
                                                            paddingBottom: '12px !important',
                                                        }}>
                                                            {/* Brand */}
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: '#878787',
                                                                    fontSize: '10px',
                                                                    fontWeight: 500,
                                                                    mb: 0.5,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                }}
                                                            >
                                                                {product.brand_name || 'Brand Name'}
                                                            </Typography>

                                                            {/* Product Name */}
                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    fontSize: '12px',
                                                                    fontWeight: 400,
                                                                    color: '#212121',
                                                                    lineHeight: 1.3,
                                                                    mb: 1,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitBoxOrient: 'vertical',
                                                                    WebkitLineClamp: 2,
                                                                    minHeight: '30px',
                                                                }}
                                                            >
                                                                {product.name}
                                                            </Typography>

                                                            {/* Price Section - USD currency */}
                                                            <Box sx={{ mb: 1 }}>
                                                                <Typography
                                                                    variant="h6"
                                                                    sx={{
                                                                        fontSize: '14px',
                                                                        fontWeight: 600,
                                                                        color: '#212121',
                                                                        mb: 0.5,
                                                                    }}
                                                                >
                                                                    ${product.price}
                                                                </Typography>

                                                                {/* Free Delivery */}
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontSize: '10px',
                                                                        color: '#388e3c',
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    Free delivery
                                                                </Typography>
                                                            </Box>

                                                            {/* Stock Status */}
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontSize: '10px',
                                                                    color: '#388e3c',
                                                                    fontWeight: 500,
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                ✓ In Stock
                                                            </Typography>
                                                        </CardContent>
                                                    </Link>
                                                </Card>
                                            </Grid>
                                        ))}
                                </Grid>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Pagination */}
                <Box sx={{ borderTop: '1px solid #e0e0e0', backgroundColor: 'white' }}>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={filteredProducts.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Rows per page:"
                    />
                </Box>
            </Box>

            {/* Rest of the dialogs and snackbars remain the same */}
            {/* Floating Product Finder Button */}
            <Button
                variant="contained"
                color="primary"
                style={{
                    position: 'fixed',
                    bottom: '15px',
                    right: '10px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    fontSize: '24px',
                    zIndex: 9999,
                    backgroundColor: '#2563EB',
                }}
                onClick={() => {
                    setShowPopup(true);
                    setSearchQuery('');
                    setPage(0);
                }}
            >
                ❓
            </Button>

            {/* Product Finder Dialog */}
            <Dialog
                open={showPopup}
                onClose={() => setShowPopup(false)}
                maxWidth={false}
                fullWidth={false}
                hideBackdrop={false}
                PaperProps={{
                    style: {
                        position: 'fixed',
                        bottom: '80px',
                        right: '20px',
                        margin: 0,
                        zIndex: 1300,
                        borderRadius: '12px',
                        width: isMobile ? '95%' : maximized ? dialogSize.width : 250,
                        height: isMobile ? '85%' : maximized ? dialogSize.height : 60,
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                    },
                }}
            >
                <DialogTitle
                    style={{
                        backgroundColor: '#2563EB',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingRight: '40px',
                    }}
                >
                    <Typography
                        sx={{
                            marginTop: '5px',
                            fontSize: maximized ? '18px' : '14px',
                            fontWeight: 600,
                            color: 'white'
                        }}
                    >
                        Product Finder
                    </Typography>
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 10,
                            top: 10,
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                        }}
                    >
                        <Tooltip title="Minimize">
                            <span>
                                <Button
                                    size="small"
                                    onClick={() => maximized && toggleDialogSize()}
                                    disabled={!maximized}
                                    sx={{
                                        minWidth: '32px',
                                        color: 'white',
                                        height: '32px',
                                        padding: '4px',
                                        lineHeight: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MinimizeOutlinedIcon fontSize="small" sx={{ mt: '-6px' }} />
                                </Button>
                            </span>
                        </Tooltip>
                        <Tooltip title="Maximize">
                            <span>
                                <Button
                                    size="small"
                                    onClick={() => !maximized && toggleDialogSize()}
                                    disabled={maximized}
                                    sx={{
                                        minWidth: '32px',
                                        height: '32px',
                                        marginTop: '5px',
                                        color: 'white',
                                        padding: '4px',
                                        lineHeight: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CropSquareIcon fontSize="small" />
                                </Button>
                            </span>
                        </Tooltip>
                        <Tooltip title="Close">
                            <Button
                                onClick={() => setShowPopup(false)}
                                size="small"
                                sx={{
                                    marginTop: '5px',
                                    color: 'white',
                                    minWidth: '32px',
                                    height: '32px',
                                    padding: '4px',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </Button>
                        </Tooltip>
                    </Box>
                </DialogTitle>
                {maximized && (
                    <>
                        <DialogContent dividers>
                            <FormControl fullWidth margin="normal">
                                <Select
                                    value={selectedCategoryId}
                                    onChange={handleCategoryChange}
                                    size="small"
                                    displayEmpty
                                    sx={{
                                        fontSize: '14px',
                                        backgroundColor: '#f8f9fa',
                                        '& .MuiSelect-select': {
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#ddd'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#2563EB'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#2563EB'
                                        }
                                    }}
                                >
                                    <MenuItem value="" sx={{ fontSize: '14px', color: '#6c757d' }}>
                                        Select Category
                                    </MenuItem>
                                    {categoryOptions.map((category) => (
                                        <MenuItem key={category.id} value={category.id} sx={{ fontSize: '14px' }}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {categoryFilters.map((filter, index) => (
                                <Accordion key={index}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#cfd3df' }}>
                                        <Typography variant="subtitle1" sx={{ fontSize: '14px' }}>{filter.name}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {filter.options.map((option, optionIndex) => (
                                            <FormControlLabel
                                                key={optionIndex}
                                                control={
                                                    <Checkbox
                                                        checked={selectedFilters[filter.name]?.includes(option.label) || false}
                                                        onChange={() => handleFilterChange(filter.name, option.label)}
                                                    />
                                                }
                                                label={option.label}
                                                sx={{
                                                    '& .MuiFormControlLabel-label': {
                                                        fontSize: '14px',
                                                    },
                                                }}
                                            />
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </DialogContent>
                        <DialogActions>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Tooltip title="Reset All Filters" arrow>
                                    <Button
                                        variant="text"
                                        color="error"
                                        onClick={handleClearFilters}
                                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <RestartAltIcon fontSize="small" />
                                        Reset All
                                    </Button>
                                </Tooltip>
                                <Button onClick={() => setShowPopup(false)} color="primary">
                                    Close
                                </Button>
                            </Box>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Snackbar Notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                    elevation={6}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductList;