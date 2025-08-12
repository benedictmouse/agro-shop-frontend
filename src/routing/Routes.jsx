import React, { Suspense, useState, useEffect } from 'react';
import appLinks from './Links';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DUMMY from '../dummy/Data'; // Import initial data
import '../styles/Loading.css';

const Home = React.lazy(() => import('../pages/HomePage'));
const Cart = React.lazy(() => import('../pages/Cart'));
const Product = React.lazy(() => import('../pages/ProductDetail'));
const Profile = React.lazy(() => import('../pages/Profile'));
const AddProduct = React.lazy(() => import('../pages/AddProduct'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Contact = React.lazy(() => import('../pages/Contact'));
const About = React.lazy(() => import('../pages/About')); 
const Login = React.lazy(() => import('../pages/Login')); 
const Signup = React.lazy(() => import('../components/Signup')); 

const LoadingFallback = () => (
    <div className="loading-container">
        <div>
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading fresh produce...</p>
        </div>
    </div>
);

const BaseRouter = () => {
    const [cartItem, setCartItem] = useState([]);
    const [products, setProducts] = useState(DUMMY); // Initialize with dummy data

    // Load products from localStorage on component mount
    useEffect(() => {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
        }
    }, []);

    // Save products to localStorage whenever products change
    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    const handleAddProduct = (newProduct) => {
        setProducts(prev => [...prev, newProduct]);
    };

    const handleDeleteProduct = (productId) => {
        setProducts(prev => prev.filter(product => product.ID !== productId));
    };


    return (
        <Router>
            <Navbar cartItem={cartItem} products={products} />
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route exact path={appLinks?.home} element={<Home products={products} />} />
                    <Route path={appLinks?.cart}element={<Cart cartItem={cartItem} setCartItem={setCartItem} />}/>
                    <Route path={appLinks?.product}element={<Product cartItem={cartItem} setCartItem={setCartItem} products={products} /> }  />
                    <Route path={appLinks?.profile} element={<Profile />} />
                    <Route path={appLinks?.contact} element={<Contact />} />
                    <Route path={appLinks?.about} element={<About />} />
                    <Route path={appLinks?.Login} element={<Login />} />
                    <Route path={appLinks?.signup} element={<Signup />} />
                    <Route path={appLinks?.addProduct} element={<AddProduct onAddProduct={handleAddProduct} />}/>
                    <Route path={appLinks?.dashboard}element={ <Dashboard products={products}onDeleteProduct={handleDeleteProduct}/> } />
                </Routes>
                <Footer />
            </Suspense>
        </Router>
    );
};

export default BaseRouter;