import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormMessage('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setFormMessage('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-subtitle">We'd love to hear from you. Reach out with any questions or feedback!</p>

      <div className="contact-content">
        <div className="contact-form-section">
          <h2 className="section-title">Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              <FiSend className="submit-icon" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {formMessage && (
              <p className={`form-message ${formMessage.includes('Thank') ? 'success' : 'error'}`}>
                {formMessage}
              </p>
            )}
          </form>
        </div>

        <div className="contact-info-section">
          <h2 className="section-title">Contact Information</h2>
          <ul className="contact-info-list">
            <li>
              <FiMail className="contact-icon" />
              <span>support@agroshop.com</span>
            </li>
            <li>
              <FiPhone className="contact-icon" />
              <span>+1 (123) 456-7890</span>
            </li>
            <li>
              <FiMapPin className="contact-icon" />
              <span>123 Farm Road, Agro City, AC 12345</span>
            </li>
          </ul>
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0860588182866!2d-122.4194156846818!3d37.77492977975971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjciTiAxMjLCsDI1JzA4LjkiVw!5e0!3m2!1sen!2sus!4v1631234567890!5m2!1sen!2sus"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="AgroShop Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;