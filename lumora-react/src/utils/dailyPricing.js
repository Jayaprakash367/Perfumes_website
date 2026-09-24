/**
 * LUMORA Haute Parfumerie - 24-Hour Dynamic Daily Pricing & Discount Engine
 * 
 * Computes deterministic, real-data discounts anchored strictly to the calendar date 
 * and day of the week. Prices remain constant for exactly 24 hours and dynamically
 * recalculate at midnight (00:00:00 local time).
 */

// Daily olfactory rotation themes corresponding to day of week (0 = Sunday ... 6 = Saturday)
export const DAILY_THEMES = [
  {
    dayIndex: 0,
    dayName: 'Sunday',
    themeName: 'Grand Accord Weekend',
    eyebrow: 'Sunday Extrait Curation',
    categories: ['Floral Romance', 'Amber Vanilla', 'Luxury Prestige'],
    minDiscount: 18,
    maxDiscount: 22,
    description: 'Special celebration pricing on iconic extraits and opulent signature compositions.'
  },
  {
    dayIndex: 1,
    dayName: 'Monday',
    themeName: 'Citrus & Marine Awakening',
    eyebrow: 'Monday Freshness Spotlight',
    categories: ['Fresh Citrus', 'Energetic Citrus', 'Fresh Floral'],
    minDiscount: 15,
    maxDiscount: 19,
    description: 'Crisp bergamot, sea spray, and uplifting botanical accords to begin the week.'
  },
  {
    dayIndex: 2,
    dayName: 'Tuesday',
    themeName: 'Grasse Rose & Bloom Festival',
    eyebrow: 'Tuesday Floral Harmony',
    categories: ['Floral Romance', 'Fresh Floral', 'Powdery Floral'],
    minDiscount: 14,
    maxDiscount: 18,
    description: 'Delicate Grasse rose petals, powdery iris, and blooming night jasmine.'
  },
  {
    dayIndex: 3,
    dayName: 'Wednesday',
    themeName: 'Noble Woods & Royal Vetiver',
    eyebrow: 'Wednesday Arbor Curation',
    categories: ['Woody Aromatic', 'Classic Timeless'],
    minDiscount: 16,
    maxDiscount: 20,
    description: 'Smoky vetiver roots, aged cedarwood, and grounding forest resins.'
  },
  {
    dayIndex: 4,
    dayName: 'Thursday',
    themeName: 'Warm Amber & Rare Spices',
    eyebrow: 'Thursday Oriental Eve',
    categories: ['Warm Spice', 'Amber Vanilla', 'Mysterious Oriental'],
    minDiscount: 15,
    maxDiscount: 20,
    description: 'Ceylon cinnamon, golden amber resins, and smoky Madagascar vanilla.'
  },
  {
    dayIndex: 5,
    dayName: 'Friday',
    themeName: 'Nocturne Leather & Velvet',
    eyebrow: 'Friday Evening Elegance',
    categories: ['Leather Aromatic', 'Mysterious Oriental', 'Fruity Sweet'],
    minDiscount: 18,
    maxDiscount: 22,
    description: 'Sultry Tuscan leather, dark damask rose, and weekend gala extraits.'
  },
  {
    dayIndex: 6,
    dayName: 'Saturday',
    themeName: 'Connoisseur Grand Selection',
    eyebrow: 'Saturday Maison Special',
    categories: ['Luxury Prestige', 'Woody Aromatic', 'Amber Vanilla'],
    minDiscount: 16,
    maxDiscount: 21,
    description: 'Handcrafted master extraits for distinguished fragrance collectors.'
  }
];

/**
 * Returns current calendar context (date, day of week, and time until midnight)
 */
export function getDailyCalendarContext() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 - 11
  const date = now.getDate(); // 1 - 31
  const dayOfWeek = now.getDay(); // 0 - 6

  // Next midnight timestamp
  const nextMidnight = new Date(year, month, date + 1, 0, 0, 0, 0).getTime();
  const msRemaining = Math.max(0, nextMidnight - now.getTime());
  
  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const currentTheme = DAILY_THEMES[dayOfWeek] || DAILY_THEMES[0];
  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    year,
    month: month + 1,
    date,
    dayOfWeek,
    dayName: currentTheme.dayName,
    dateKey,
    formattedDate,
    currentTheme,
    msRemaining,
    hours,
    minutes,
    seconds,
    formattedCountdown: `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  };
}

/**
 * Computes deterministic daily discount & price for a specific product.
 * Locked for the 24 hours of the given date.
 */
export function computeDailyProductPrice(product, calendarContext = getDailyCalendarContext()) {
  const { year, month, date, dayOfWeek, currentTheme } = calendarContext;

  // Real anchor price (use originalPrice if provided, or standard MSRP 1.25x)
  const originalPrice = product.originalPrice || Math.round(product.price * 1.25);

  // Check if product category is spotlighted in today's daily theme
  const isThemeSpotlight = currentTheme.categories.some(
    (cat) => cat.toLowerCase() === (product.category || '').toLowerCase()
  );

  // Deterministic seed based on date and product id (remains 100% stable all 24 hours)
  const daySeed = (year * 365 + month * 31 + date * 17 + dayOfWeek * 7 + (product.id || 1) * 13) % 1000;

  let discountPercent = 10;

  if (isThemeSpotlight || product.isBestseller) {
    const range = currentTheme.maxDiscount - currentTheme.minDiscount;
    discountPercent = currentTheme.minDiscount + (daySeed % (range + 1));
  } else {
    // Other fragrances rotate deterministically between 8% and 14%
    discountPercent = 8 + (daySeed % 7);
  }

  // Calculate real discounted price
  const price = Math.round(originalPrice * (1 - discountPercent / 100));
  const savings = originalPrice - price;

  return {
    ...product,
    originalPrice,
    price,
    discountPercent,
    savings,
    isDailyFeatured: isThemeSpotlight,
    dailyThemeName: currentTheme.themeName,
    dailyEyebrow: isThemeSpotlight ? currentTheme.eyebrow : 'Daily Maison Rate'
  };
}

/**
 * Takes array of products and applies daily 24-hour pricing to all items.
 */
export function applyDailyPricingToCollection(productsList) {
  const calendarContext = getDailyCalendarContext();
  return productsList.map((product) => computeDailyProductPrice(product, calendarContext));
}
