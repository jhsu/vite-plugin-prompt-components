
import React, { useState, FormEvent, ChangeEvent } from 'react';

/**
 * Contact form component for sending messages
 * Allows users to submit email and message
 */
const Contact: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles email input changes
   * @param e - Change event from input
   */
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  /**
   * Handles message input changes
   * @param e - Change event from textarea
   */
  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  /**
   * Handles form submission
   * @param e - Form submission event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !message) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate form submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err) {
      setError('Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form for another submission
  const handleReset = () => {
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
  };

  // Submitted success view
  if (isSubmitted) {
    return (
      <div>
        <h2>Message Received!</h2>
        <p>Someone will get back to you within 24 hours.</p>
        <button onClick={handleReset}>Send Another Message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Contact Us</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          value={message}
          onChange={handleMessageChange}
          required
          disabled={isLoading}
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
};

export default Contact;