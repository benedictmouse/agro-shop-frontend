import React from 'react';
import Cards from "../components/Cards";
import '../styles/HomePage.css'; // Create this file for additional styling

const HomePage = ({products}) => {
  return (
    <div className="home-page">
      <div className="page-content">
        <Cards products={products}/>
      </div>
    </div>
  );
};

export default HomePage;