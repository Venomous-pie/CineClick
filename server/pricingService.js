import db from './db.js';

// Get all pricing configuration
export function getAllPricing() {
  const pricing = db.prepare('SELECT * FROM pricing_config ORDER BY configKey').all();
  return pricing.reduce((acc, item) => {
    acc[item.configKey] = {
      value: item.configValue,
      description: item.description,
      id: item.id
    };
    return acc;
  }, {});
}

// Get specific pricing value
export function getPricing(key) {
  const item = db.prepare('SELECT configValue FROM pricing_config WHERE configKey = ?').get(key);
  return item ? item.configValue : null;
}

// Update pricing value
export function updatePricing(key, value) {
  if (typeof value !== 'number' || value < 0) {
    throw new Error('Invalid pricing value. Must be a positive number.');
  }

  const existing = db.prepare('SELECT id FROM pricing_config WHERE configKey = ?').get(key);
  if (!existing) {
    throw new Error(`Pricing key "${key}" not found`);
  }

  db.prepare(`
    UPDATE pricing_config 
    SET configValue = ?, updatedAt = CURRENT_TIMESTAMP 
    WHERE configKey = ?
  `).run(value, key);

  return getPricing(key);
}

// Update multiple pricing values
export function updateMultiplePricing(pricingData) {
  const results = {};
  const errors = [];

  for (const [key, value] of Object.entries(pricingData)) {
    try {
      if (typeof value !== 'number' || value < 0) {
        errors.push(`Invalid value for ${key}: must be a positive number`);
        continue;
      }
      updatePricing(key, value);
      results[key] = value;
    } catch (error) {
      errors.push(`Error updating ${key}: ${error.message}`);
    }
  }

  return { results, errors };
}

// Get base price
export function getBasePrice() {
  return getPricing('base_price') || 250;
}

// Get room multipliers
export function getRoomMultipliers() {
  return {
    basic: getPricing('room_basic_multiplier') || 1.0,
    '3d': getPricing('room_3d_multiplier') || 1.3,
    premium: getPricing('room_premium_multiplier') || 1.8,
    vip: getPricing('room_vip_multiplier') || 2.5,
  };
}

// Get price for a specific room type
export function getRoomPrice(roomType) {
  const basePrice = getBasePrice();
  const multipliers = getRoomMultipliers();
  const multiplier = multipliers[roomType] || 1.0;
  return Math.round(basePrice * multiplier);
}

