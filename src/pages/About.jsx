import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import appLinks from '../routing/Links';
import logo from '../assets/Agro Shop logo.png'
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About AgroShop</h1>
      <p className="about-subtitle">Your trusted source for fresh, organic produce.</p>

      <div className="about-content">
        <section className="about-section about-intro">
          <h2 className="section-title">Who We Are</h2>
          <p>
            At AgroShop, we are passionate about bringing the freshest, highest-quality produce directly from local farms to your table. Founded in 2023, our goal is to make healthy, sustainable food accessible to everyone. We work closely with farmers to ensure every product meets our rigorous standards for quality and freshness.
          </p>
          <img
            src={logo}
            alt="AgroShop Farm"
            className="about-image"
          />
        </section>

        <section className="about-section about-mission">
          <h2 className="section-title">Our Mission & Values</h2>
          <div className="mission-values">
            <div className="value-item">
              <h3>Quality</h3>
              <p>We source only the best organic produce, ensuring every bite is fresh and flavorful.</p>
            </div>
            <div className="value-item">
              <h3>Sustainability</h3>
              <p>Our eco-friendly practices support local farmers and protect the environment.</p>
            </div>
            <div className="value-item">
              <h3>Community</h3>
              <p>We build strong relationships with farmers and customers to foster a healthy community.</p>
            </div>
          </div>
        </section>

        <section className="about-section about-team">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img
                src={logo}
                alt="Team Member"
                className="team-image"
              />
              <h3>Jane Doe</h3>
              <p>Founder & CEO</p>
              <p>Jane leads AgroShop with a vision for sustainable agriculture and community growth.</p>
            </div>
            <div className="team-member">
              <img
                src={logo}
                alt="Team Member"
                className="team-image"
              />
              <h3>John Smith</h3>
              <p>Farm Coordinator</p>
              <p>John ensures our farmers deliver the freshest produce to our customers.</p>
            </div>
          </div>
        </section>

        <section className="about-section about-cta">
          <h2 className="section-title">Join Our Community</h2>
          <p>
            Ready to explore our fresh produce? Shop now or reach out to learn more about AgroShop!
          </p>
          <div className="cta-buttons">
            <Link to={appLinks.home} className="cta-btn shop-btn">
              <FiShoppingCart className="cta-icon" />
              Shop Now
            </Link>
            <Link to="/contact" className="cta-btn contact-btn">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;