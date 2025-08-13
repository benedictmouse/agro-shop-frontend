import React, { Suspense, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import appLinks from './Links';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DUMMY from '../dummy/Data';
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

// New component to handle routes and navbar logic
const AppContent = ({ cartItem, setCartItem, products, setProducts, handleAddProduct, handleDeleteProduct }) => {
  const location = useLocation(); // Now safe to use inside Router

  // Hide Navbar on login and signup pages
  const hideNavbar = location.pathname === appLinks.Login || location.pathname === appLinks.signup;

  return (
    <>
      {!hideNavbar && <Navbar cartItem={cartItem} products={products} />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route exact path={appLinks?.home} element={<Home products={products} />} />
          <Route path={appLinks?.cart} element={<Cart cartItem={cartItem} setCartItem={setCartItem} />} />
          <Route path={appLinks?.product} element={<Product cartItem={cartItem} setCartItem={setCartItem} products={products} />} />
          <Route path={appLinks?.profile} element={<Profile />} />
          <Route path={appLinks?.contact} element={<Contact />} />
          <Route path={appLinks?.about} element={<About />} />
          <Route path={appLinks?.Login} element={<Login />} />
          <Route path={appLinks?.signup} element={<Signup />} />
          <Route path={appLinks?.addProduct} element={<AddProduct onAddProduct={handleAddProduct} />} />
          <Route path={appLinks?.dashboard} element={<Dashboard products={products} onDeleteProduct={handleDeleteProduct} />} />
        </Routes>
        <Footer />
      </Suspense>
    </>
  );
};

const BaseRouter = () => {
  const [cartItem, setCartItem] = useState([]);
  const [products, setProducts] = useState(DUMMY);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((product) => product.ID !== productId));
  };

  return (
    <Router>
      <AppContent
        cartItem={cartItem}
        setCartItem={setCartItem}
        products={products}
        setProducts={setProducts}
        handleAddProduct={handleAddProduct}
        handleDeleteProduct={handleDeleteProduct}
      />
    </Router>
  );
};

export default BaseRouter;