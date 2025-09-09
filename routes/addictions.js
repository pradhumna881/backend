const express = require('express');
const router = express.Router();
const contentLoader = require('../content/index');

// Addiction types structure
const addictionTypes = {
  substance: [
    { id: 'nicotine', name: 'Nicotine', emoji: '🚬' },
    { id: 'alcohol', name: 'Alcohol', emoji: '🍺' },
    { id: 'drugs', name: 'Drugs', emoji: '💊' },
    { id: 'cocaine', name: 'Cocaine', emoji: '❄️' },
    { id: 'heroin', name: 'Heroin', emoji: '💉' },
    { id: 'coffee', name: 'Coffee', emoji: '☕' }
  ],
  behavioral: [
    { id: 'internet', name: 'Internet', emoji: '🌐' },
    { id: 'socialmedia', name: 'Social media', emoji: '📱' },
    { id: 'smartphone', name: 'Smartphone', emoji: '📱' },
    { id: 'pornography', name: 'Pornography', emoji: '🔞' },
    { id: 'sex', name: 'Sex', emoji: '💕' },
    { id: 'shopping', name: 'Shopping', emoji: '🛒' },
    { id: 'fastfood', name: 'Fastfood', emoji: '🍔' }
  ],
  emotional: [
    { id: 'overthinking', name: 'Overthinking', emoji: '🤔' },
    { id: 'anxiety', name: 'Anxiety / Negative self-talk', emoji: '😰' },
    { id: 'depressionloops', name: 'Depression loops', emoji: '😔' },
    { id: 'perfectionism', name: 'Perfectionism', emoji: '⭐' }
  ]
};

// Get all addiction types
router.get('/types', (req, res) => {
  try {
    res.json({
      status: 'success',
      data: addictionTypes
    });
  } catch (error) {
    console.error('Error fetching addiction types:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch addiction types'
    });
  }
});

// Get specific addiction content
router.get('/:addictionId', (req, res) => {
  try {
    const { addictionId } = req.params;
    
    if (!addictionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Addiction ID is required'
      });
    }

    // Sanitize ID
    const sanitizedId = addictionId.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Find addiction in categories
    let addiction = null;
    let category = null;
    
    for (const [cat, addictions] of Object.entries(addictionTypes)) {
      const found = addictions.find(a => a.id === sanitizedId);
      if (found) {
        addiction = found;
        category = cat;
        break;
      }
    }
    
    if (!addiction) {
      return res.status(404).json({
        status: 'error',
        message: 'Addiction type not found'
      });
    }
    
    // Load content from file
    const content = contentLoader.loadContent(sanitizedId);
    
    if (!content) {
      return res.status(404).json({
        status: 'error',
        message: 'Addiction content not found'
      });
    }

    // Send response
    res.json({
      status: 'success',
      data: {
        ...addiction,
        category,
        content: {
          title: content.title,
          reasons: content.reasons || [],
          methods: content.methods || [],
          benefits: content.benefits || []
        }
      }
    });
  } catch (error) {
    console.error('Error fetching addiction content:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch addiction content'
    });
  }
});

// Search addictions
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    
    for (const [category, addictions] of Object.entries(addictionTypes)) {
      const matches = addictions.filter(addiction => 
        addiction.name.toLowerCase().includes(searchTerm) ||
        addiction.id.toLowerCase().includes(searchTerm)
      );
      
      matches.forEach(match => {
        results.push({
          ...match,
          category
        });
      });
    }
    
    res.json({
      status: 'success',
      data: results,
      query: searchTerm,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({
      status: 'error',
      message: 'Search failed'
    });
  }
});

module.exports = router;
