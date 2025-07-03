import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'services', name: 'Reading Services' },
    { id: 'digital', name: 'Digital Products' },
    { id: 'physical', name: 'Physical Products' },
    { id: 'courses', name: 'Courses' }
  ];

  const products = [
    // Reading Services
    {
      id: 1,
      category: 'services',
      name: 'Premium Tarot Reading',
      description: '60-minute in-depth tarot reading with detailed insights',
      price: 75.00,
      image: '🔮',
      type: 'Service',
      featured: true
    },
    {
      id: 2,
      category: 'services',
      name: 'Past Life Reading',
      description: 'Explore your past lives and karmic connections',
      price: 85.00,
      image: '👁️',
      type: 'Service'
    },
    {
      id: 3,
      category: 'services',
      name: 'Relationship Reading',
      description: 'Get clarity on love and relationship matters',
      price: 65.00,
      image: '💕',
      type: 'Service'
    },
    {
      id: 4,
      category: 'services',
      name: 'Career Guidance Reading',
      description: 'Find your path and purpose in your career',
      price: 70.00,
      image: '🌟',
      type: 'Service'
    },

    // Digital Products
    {
      id: 5,
      category: 'digital',
      name: 'Crystal Healing Guide',
      description: 'Complete digital guide to crystal properties and healing',
      price: 19.99,
      image: '💎',
      type: 'Digital Download',
      featured: true
    },
    {
      id: 6,
      category: 'digital',
      name: 'Tarot Spreads Collection',
      description: '50+ unique tarot spreads for every situation',
      price: 14.99,
      image: '🃏',
      type: 'Digital Download'
    },
    {
      id: 7,
      category: 'digital',
      name: 'Meditation Audio Pack',
      description: 'Guided meditations for spiritual awakening',
      price: 24.99,
      image: '🧘‍♀️',
      type: 'Digital Audio'
    },
    {
      id: 8,
      category: 'digital',
      name: 'Astrology Birth Chart Guide',
      description: 'Learn to read and interpret birth charts',
      price: 29.99,
      image: '♈',
      type: 'Digital Download'
    },

    // Physical Products
    {
      id: 9,
      category: 'physical',
      name: 'Professional Tarot Deck',
      description: 'Premium Rider-Waite tarot deck with guidebook',
      price: 34.99,
      image: '🎴',
      type: 'Physical Product',
      featured: true
    },
    {
      id: 10,
      category: 'physical',
      name: 'Sage Cleansing Bundle',
      description: 'White sage bundle for spiritual cleansing',
      price: 15.99,
      image: '🌿',
      type: 'Physical Product'
    },
    {
      id: 11,
      category: 'physical',
      name: 'Crystal Starter Set',
      description: 'Seven essential healing crystals with velvet pouch',
      price: 42.99,
      image: '💠',
      type: 'Physical Product'
    },
    {
      id: 12,
      category: 'physical',
      name: 'Incense Variety Pack',
      description: 'Spiritual incense collection - 12 different scents',
      price: 18.99,
      image: '🕯️',
      type: 'Physical Product'
    },

    // Courses
    {
      id: 13,
      category: 'courses',
      name: 'Tarot Reading Mastery',
      description: 'Complete 8-week course on professional tarot reading',
      price: 197.00,
      image: '📚',
      type: 'Online Course',
      featured: true
    },
    {
      id: 14,
      category: 'courses',
      name: 'Psychic Development Program',
      description: 'Develop your natural psychic abilities',
      price: 247.00,
      image: '🔮',
      type: 'Online Course'
    },
    {
      id: 15,
      category: 'courses',
      name: 'Crystal Healing Certification',
      description: 'Become a certified crystal healing practitioner',
      price: 297.00,
      image: '💎',
      type: 'Online Course'
    }
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(product => product.category === activeCategory);

  const featuredProducts = products.filter(product => product.featured);

  const handleAddToCart = (product) => {
    // TODO: Implement cart functionality
    alert(`Added ${product.name} to cart!`);
  };

  const handleBuyNow = (product) => {
    // TODO: Implement direct purchase
    alert(`Redirecting to checkout for ${product.name}`);
  };

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
            {featuredProducts.map((product) => (
              <div key={product.id} className="card-mystical relative">
                <div className="absolute top-4 right-4 bg-mystical-gold text-black px-2 py-1 rounded text-sm font-semibold">
                  Featured
                </div>
                <div className="text-center mb-4">
                  <div className="text-6xl mb-4">{product.image}</div>
                  <span className="bg-mystical-pink text-white px-3 py-1 rounded-full text-sm">
                    {product.type}
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
                    ${product.price}
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
          {filteredProducts.map((product) => (
            <div key={product.id} className="card-mystical">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{product.image}</div>
                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                  {product.type}
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
                  ${product.price}
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