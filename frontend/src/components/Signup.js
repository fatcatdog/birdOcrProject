import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/Signup.css';


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK_KEY); // Replace with your Stripe Publishable Key

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user
      const res = await axios.post('http://localhost:5000/api/auth/signup', { email, password });
      localStorage.setItem('token', res.data.token);

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)
      });

      if (error) throw error;

      // Create subscription
      await axios.post('http://localhost:5000/api/payment/create-subscription', {
        email,
        paymentMethodId: paymentMethod.id
      });

      navigate('/upload');
    } catch (err) {
      alert(err.message || 'Error during signup');
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Sign Up and Pay $5/month
      </button>
    </form>
  );
}

function Signup() {
  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <Elements stripe={stripePromise}>
        <SignupForm />
      </Elements>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Signup;