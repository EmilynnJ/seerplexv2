const express = require('express');
const Product = require('../models/Product'); // Import Product model
const { authMiddleware } = require('../middleware/auth'); // Assuming products can be viewed by anyone, but maybe some actions require auth

const router = express.Router();

// Get all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true }).lean();

    // Format products for client-side consumption
    const formattedProducts = products.map(product => ({
      id: product._id,
      stripeProductId: product.stripeProductId,
      name: product.name,
      description: product.description,
      images: product.images,
      active: product.active,
      prices: product.prices.filter(price => price.active).map(price => ({
        stripePriceId: price.stripePriceId,
        unitAmount: price.unitAmount,
        currency: price.currency,
        recurring: price.recurring,
        type: price.type,
      })),
      metadata: product.metadata,
    }));

    res.json({
      success: true,
      products: formattedProducts,
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      message: 'Failed to retrieve products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a single product by ID (optional, if needed for detail pages)
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).lean();

    if (!product || !product.active) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    const formattedProduct = {
      id: product._id,
      stripeProductId: product.stripeProductId,
      name: product.name,
      description: product.description,
      images: product.images,
      active: product.active,
      prices: product.prices.filter(price => price.active).map(price => ({
        stripePriceId: price.stripePriceId,
        unitAmount: price.unitAmount,
        currency: price.currency,
        recurring: price.recurring,
        type: price.type,
      })),
      metadata: product.metadata,
    };

    res.json({
      success: true,
      product: formattedProduct,
    });

  } catch (error) {
    console.error('Get single product error:', error);
    res.status(500).json({
      message: 'Failed to retrieve product details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
