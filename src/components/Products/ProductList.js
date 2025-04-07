import React, { useEffect, useState } from 'react';
import {
    Container,
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
    TablePagination,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ListAlt as ListAltIcon, GridView as GridViewIcon } from '@mui/icons-material';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // Added state to track the view mode
    const [sortConfig, setSortConfig] = useState({ key: 'sku', direction: 'asc' }); // Sorting state


  
  // Get the sort symbol for each column
  const getSortSymbol = (column) => {
      if (sortConfig.key === column) {
          return sortConfig.direction === 'asc' ? '↑' : '↓';
      }
      return '↕'; // Default sorting symbol for unsorted columns
  };



    useEffect(() => {
        fetch('https://product-assistant-gpt.onrender.com/productList/')
            .then(response => response.json())
            .then(responseData => {
                setProducts(responseData.data?.products || []);
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
            });
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredProducts(
                products.filter(product =>
                    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    // Sorting function
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
        setPage(0)
    };

    // Toggle between grid and list view
    const toggleViewMode = (mode) => {
        setViewMode(mode);
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Products
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
                <Box sx={{ marginRight: '5px' }}>
                    <Button
                        variant={viewMode === 'list' ? 'contained' : 'outlined'}
                        onClick={() => toggleViewMode('list')}
                        sx={{ marginRight: 2, backgroundColor: '#f2f3ae', color: 'black' }}
                    >
                        <ListAltIcon />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                        onClick={() => toggleViewMode('grid')}
                        sx={{ backgroundColor: '#f2f3ae', color: 'black' }}
                    >
                        <GridViewIcon />
                    </Button>
                </Box>

                <TextField
                    label="Find your products"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={{ minWidth: 300 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton aria-label="refresh" sx={{ marginRight: 2 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.37-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                        </svg>
                    </IconButton>
                    <Typography variant="body2">Total Products: {products.length}</Typography>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                {viewMode === 'list' ? (
                    <TableContainer>
                        <Table>
                        <TableHead sx={{ backgroundColor: '#f2f3ae' }}>
                            <TableRow>
                                <TableCell sx={{ textAlign: 'center' }}>Image</TableCell>
                                <TableCell sx={{ textAlign: 'center' }} onClick={() => sortProducts('sku')}>
                                    SKU {getSortSymbol('sku')}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }} onClick={() => sortProducts('name')}>
                                    Title {getSortSymbol('name')}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }} onClick={() => sortProducts('mpn')}>
                                    MPN {getSortSymbol('mpn')}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }} onClick={() => sortProducts('category')}>
                                    Category {getSortSymbol('category')}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }} onClick={() => sortProducts('brand_name')}>
                                    Brand {getSortSymbol('brand_name')}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }} onClick={() => sortProducts('price')}>
                                    Price {getSortSymbol('price')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                            <TableBody>
                                {filteredProducts
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Link to={`/details/${product.id}`} style={{ textDecoration: 'none' }}>
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
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Link to={`/details/${product.id}`} style={{ color: 'black', textDecoration: 'none' }}>
                                                    {product.sku}
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center',
                textAlign: "center", 
                minWidth: 320, 
                width: 320, 
                wordBreak: "break-word", 
                whiteSpace: "normal", 
                overflow: "hidden", 
                textOverflow: "ellipsis"
               }}>
                                                <Link to={`/details/${product.id}`} style={{ color: 'black', textDecoration: 'none' }}>
                                                    {product.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>{product.mpn}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>{product.category}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>{product.brand_name || 'N/A'}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>${product.price}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Grid container spacing={2} justifyContent="center">
                        {filteredProducts
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((product) => (
                                <Grid item xs={12} sm={12} md={4} sx={{ padding: '30px' }} key={product.id} display="flex" justifyContent="center">
                                    <Card
                                        sx={{
                                            marginTop: '10px',
                                            width: '300px',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                            },
                                        }}
                                    >
                                        <Link
                                            to={`/details/${product.id}`}
                                            style={{
                                                textDecoration: 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%',
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="130"
                                                width="200"
                                                image={product.image_url}
                                                alt={product.name}
                                                sx={{
                                                    objectFit: 'contain',
                                                    borderTopLeftRadius: '10px',
                                                    borderTopRightRadius: '10px',
                                                }}
                                            />
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: 'black',
                                                        fontSize: '15px',
                                                        fontWeight: 'bold',
                                                        height: '3rem',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {product.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                    sx={{ height: '2rem', color: 'black', overflow: 'hidden' }}
                                                >
                                                    SKU: {product.sku}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Price: ${product.price}
                                                </Typography>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                </Grid>
                            ))}
                    </Grid>
                )}
            </Paper>

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
        </Container>
    );
};

export default ProductList;
