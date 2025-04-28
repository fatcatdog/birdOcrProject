const express = require('express');
const Stripe = require('stripe');
const User = require('../models/User');
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create subscription
router.post('/create-subscription', async (req, res) => {
  const { email, paymentMethodId } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (!user.stripeCustomerId) {
      customer = await stripe.customers.create({ email, payment_method: paymentMethodId, invoice_settings: { default_payment_method: paymentMethodId } });
      user.stripeCustomerId = customer.id;
      await user.save();
    } else {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1RFTWKGasxWMrIq142c7rDBL' }], // Replace with your Stripe Price ID for $5/month
      expand: ['latest_invoice.payment_intent']
    });

    user.subscriptionStatus = 'active';
    await user.save();

    res.json({ subscriptionId: subscription.id, clientSecret: subscription.latest_invoice.payment_intent.client_secret });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;