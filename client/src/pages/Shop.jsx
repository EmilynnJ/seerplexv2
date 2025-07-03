import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Shop = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products'); // Assuming this endpoint exists
      setProducts(response.data.products || response.data); // Adjust based on actual API response shape
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'services', name: 'Reading Services' },
    { id: 'digital', name: 'Digital Products' },
    { id: 'physical', name: 'Physical Products' },
    { id: 'courses', name: 'Courses' }
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(product => product.category === activeCategory);

  const featuredProducts = Array.isArray(products) ? products.filter(product => product.featured) : [];

  const handleAddToCart = (product) => {
    console.log(`Added ${product.name} to cart!`);
  };

  const handleBuyNow = (product) => {
    console.log(`Redirecting to checkout for ${product.name}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading shop..." />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-alex-brush text-6xl text-mystical-pink mb-4">
            Spiritual Shop
          </h1>
          <p className="font-playfair text-xl text-gray-300 max-w-3xl mx-auto">
            Discover authentic spiritual products, services, and courses to enhance your journey
          </p>
        </div>

        {/* Featured Products */}
        <section className="mb-16">
          <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.isArray(featuredProducts) && featuredProducts.map((product) => (
              <div key={product.id} className="card-mystical relative">
                <div className="absolute top-4 right-4 bg-mystical-gold text-black px-2 py-1 rounded text-sm font-semibold">
                  Featured
                </div>
                <div className="text-center mb-4">
                  <div className="text-6xl mb-4">{product.image || '✨'}</div> {/* Fallback image */}
                  <span className="bg-mystical-pink text-white px-3 py-1 rounded-full text-sm">
                    {product.type || 'Product'}
                  </span>
                </div>
                <h3 className="font-playfair text-xl text-white font-semibold mb-2">
                  {product.name}
                </h3>
                <p className="font-playfair text-gray-300 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-alex-brush text-2xl text-mystical-gold">
                    ${product.price?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-mystical flex-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="bg-mystical-gold text-black px-4 py-2 rounded font-playfair font-semibold hover:bg-yellow-400 transition-colors"
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-playfair font-semibold transition-all ${
                activeCategory === category.id
                  ? 'bg-mystical-pink text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
            <div key={product.id} className="card-mystical">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{product.image || '✨'}</div> {/* Fallback image */}
                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                  {product.type || 'Product'}
                </span>
              </div>
              <h3 className="font-playfair text-lg text-white font-semibold mb-2">
                {product.name}
              </h3>
              <p className="font-playfair text-gray-300 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="font-alex-brush text-xl text-mystical-gold">
                  ${product.price?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="btn-mystical text-sm py-2"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
                <button
                  className="bg-gray-700 text-white px-4 py-2 rounded font-playfair text-sm hover:bg-gray-600 transition-colors"
                  onClick={() => handleBuyNow(product)}
                >
                  Quick Buy
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="card-mystical text-center">
          <h2 className="font-alex-brush text-4xl text-mystical-pink mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="font-playfair text-gray-300 mb-6">
            Connect with our readers for personalized guidance and recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="btn-mystical"
              onClick={() => navigate('/readers')}
            >
              Browse Readers
            </button>
            <button
              className="bg-gray-700 text-white px-6 py-3 rounded font-playfair font-semibold hover:bg-gray-600 transition-colors"
              onClick={() => navigate('/messages')}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
