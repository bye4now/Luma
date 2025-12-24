import { Horoscope, Numerology, MoonPhase, BirthChart, PlanetPosition } from '@/hooks/useHoroscope';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const HOROSCOPE_MESSAGES = [
  "Today brings new opportunities for growth and self-discovery.",
  "Trust your intuition as it guides you toward meaningful connections.",
  "A creative breakthrough awaits you if you remain open to inspiration.",
  "Focus on balance and harmony in all aspects of your life today.",
  "Your natural leadership qualities will shine through in unexpected ways.",
  "Take time for reflection and inner peace amidst life's busy moments.",
  "Communication flows easily today, making it perfect for important conversations.",
  "Embrace change as it leads you toward your highest potential.",
  "Your compassionate nature will be a source of strength for others.",
  "Adventure calls to you - be ready to step outside your comfort zone.",
  "Innovation and originality are your superpowers today.",
  "Deep emotional healing is possible through acts of self-love."
];

const MOODS = [
  'Energetic', 'Peaceful', 'Creative', 'Focused', 'Adventurous', 
  'Reflective', 'Optimistic', 'Intuitive', 'Confident', 'Compassionate'
];

const NUMEROLOGY_MEANINGS = [
  { number: 1, meaning: "Leadership and new beginnings guide your path today.", energy: "Pioneer", focus: "Independence" },
  { number: 2, meaning: "Cooperation and partnership bring harmony to your day.", energy: "Diplomat", focus: "Relationships" },
  { number: 3, meaning: "Creative expression and joy illuminate your journey.", energy: "Artist", focus: "Communication" },
  { number: 4, meaning: "Stability and hard work lay the foundation for success.", energy: "Builder", focus: "Organization" },
  { number: 5, meaning: "Freedom and adventure call you to explore new horizons.", energy: "Explorer", focus: "Change" },
  { number: 6, meaning: "Nurturing and responsibility guide your caring nature.", energy: "Caregiver", focus: "Service" },
  { number: 7, meaning: "Spiritual wisdom and introspection deepen your understanding.", energy: "Seeker", focus: "Knowledge" },
  { number: 8, meaning: "Material success and achievement are within your reach.", energy: "Executive", focus: "Ambition" },
  { number: 9, meaning: "Universal love and completion bring fulfillment to your soul.", energy: "Humanitarian", focus: "Compassion" }
];

export function getZodiacSign(birthDate: Date): string {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  
  return 'Aries'; // fallback
}

export function getHoroscopeForDate(date: Date, zodiacSign?: string): Horoscope {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  const messageIndex = dayOfYear % HOROSCOPE_MESSAGES.length;
  const moodIndex = dayOfYear % MOODS.length;
  const luckyNumber = (dayOfYear % 99) + 1;
  
  // Use provided zodiac sign or fallback to day-based calculation
  const sign = zodiacSign || ZODIAC_SIGNS[dayOfYear % ZODIAC_SIGNS.length];
  
  return {
    sign,
    message: HOROSCOPE_MESSAGES[messageIndex],
    luckyNumber,
    mood: MOODS[moodIndex],
    color: '#667eea',
  };
}

export function getNumerologyForDate(date: Date): Numerology {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const numerologyIndex = dayOfYear % NUMEROLOGY_MEANINGS.length;
  
  return NUMEROLOGY_MEANINGS[numerologyIndex];
}

const MOON_PHASES = [
  { name: 'New Moon', emoji: '🌑', description: 'New beginnings and fresh starts', energy: 'Planting seeds of intention' },
  { name: 'Waxing Crescent', emoji: '🌒', description: 'Growth and manifestation', energy: 'Building momentum' },
  { name: 'First Quarter', emoji: '🌓', description: 'Action and decision making', energy: 'Taking decisive action' },
  { name: 'Waxing Gibbous', emoji: '🌔', description: 'Refinement and adjustment', energy: 'Fine-tuning your path' },
  { name: 'Full Moon', emoji: '🌕', description: 'Culmination and illumination', energy: 'Peak energy and clarity' },
  { name: 'Waning Gibbous', emoji: '🌖', description: 'Gratitude and sharing', energy: 'Sharing your wisdom' },
  { name: 'Last Quarter', emoji: '🌗', description: 'Release and letting go', energy: 'Releasing what no longer serves' },
  { name: 'Waning Crescent', emoji: '🌘', description: 'Rest and reflection', energy: 'Preparing for renewal' },
];

export function getMoonPhase(date: Date): MoonPhase {
  const LUNAR_MONTH = 29.53058867;
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');
  
  const daysSinceKnownNewMoon = (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceKnownNewMoon % LUNAR_MONTH;
  const phaseIndex = Math.floor((lunarAge / LUNAR_MONTH) * 8) % 8;
  
  const phase = MOON_PHASES[phaseIndex];
  const illumination = Math.round((1 - Math.cos((lunarAge / LUNAR_MONTH) * 2 * Math.PI)) * 50);
  
  const nextNewMoon = new Date(date);
  nextNewMoon.setDate(date.getDate() + Math.ceil(LUNAR_MONTH - lunarAge));
  
  const nextFullMoon = new Date(date);
  const daysToFullMoon = lunarAge < LUNAR_MONTH / 2 
    ? (LUNAR_MONTH / 2) - lunarAge 
    : LUNAR_MONTH - lunarAge + (LUNAR_MONTH / 2);
  nextFullMoon.setDate(date.getDate() + Math.ceil(daysToFullMoon));
  
  return {
    name: phase.name,
    emoji: phase.emoji,
    description: phase.description,
    energy: phase.energy,
    illumination,
    nextNewMoon,
    nextFullMoon,
  };
}

const ZODIAC_HOUSES = [
  { number: 1, name: 'Self', description: 'Identity, appearance, first impressions' },
  { number: 2, name: 'Values', description: 'Money, possessions, self-worth' },
  { number: 3, name: 'Communication', description: 'Learning, siblings, short trips' },
  { number: 4, name: 'Home', description: 'Family, roots, emotional foundation' },
  { number: 5, name: 'Creativity', description: 'Romance, children, self-expression' },
  { number: 6, name: 'Health', description: 'Daily routines, work, service' },
  { number: 7, name: 'Partnerships', description: 'Marriage, contracts, relationships' },
  { number: 8, name: 'Transformation', description: 'Shared resources, rebirth, intimacy' },
  { number: 9, name: 'Philosophy', description: 'Higher learning, travel, beliefs' },
  { number: 10, name: 'Career', description: 'Public image, achievements, goals' },
  { number: 11, name: 'Community', description: 'Friends, groups, aspirations' },
  { number: 12, name: 'Spirituality', description: 'Subconscious, karma, hidden matters' },
];

const PLANETS = [
  { name: 'Sun', symbol: '☉', meaning: 'Core identity and life purpose' },
  { name: 'Moon', symbol: '☽', meaning: 'Emotions and inner world' },
  { name: 'Mercury', symbol: '☿', meaning: 'Communication and thinking' },
  { name: 'Venus', symbol: '♀', meaning: 'Love and values' },
  { name: 'Mars', symbol: '♂', meaning: 'Action and desire' },
  { name: 'Jupiter', symbol: '♃', meaning: 'Growth and expansion' },
  { name: 'Saturn', symbol: '♄', meaning: 'Structure and discipline' },
  { name: 'Uranus', symbol: '♅', meaning: 'Innovation and change' },
  { name: 'Neptune', symbol: '♆', meaning: 'Dreams and spirituality' },
  { name: 'Pluto', symbol: '♇', meaning: 'Transformation and power' },
];

export function getBirthChart(birthDate: Date): BirthChart {
  const zodiacSign = getZodiacSign(birthDate);
  const month = birthDate.getMonth();
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();
  
  const seed = (year * 10000 + month * 100 + day) % 12;
  
  const positions: PlanetPosition[] = PLANETS.map((planet, index) => {
    const signIndex = (seed + index * 3) % ZODIAC_SIGNS.length;
    const houseIndex = (seed + index * 2) % ZODIAC_HOUSES.length;
    const degree = ((seed * (index + 1) * 7) % 30);
    
    return {
      planet: planet.name,
      symbol: planet.symbol,
      sign: ZODIAC_SIGNS[signIndex],
      house: ZODIAC_HOUSES[houseIndex].number,
      degree,
      meaning: planet.meaning,
    };
  });
  
  const risingSign = ZODIAC_SIGNS[(seed + 1) % ZODIAC_SIGNS.length];
  const moonSign = ZODIAC_SIGNS[(seed + 2) % ZODIAC_SIGNS.length];
  
  const dominantElement = ['Fire', 'Earth', 'Air', 'Water'][seed % 4];
  const dominantQuality = ['Cardinal', 'Fixed', 'Mutable'][seed % 3];
  
  return {
    sunSign: zodiacSign,
    moonSign,
    risingSign,
    positions,
    houses: ZODIAC_HOUSES,
    dominantElement,
    dominantQuality,
    chartSummary: `Your ${zodiacSign} Sun gives you core identity, while your ${moonSign} Moon shapes your emotional nature. With ${risingSign} rising, you present yourself to the world with unique energy. Your chart is dominated by ${dominantElement} element, bringing ${dominantElement === 'Fire' ? 'passion and enthusiasm' : dominantElement === 'Earth' ? 'practicality and stability' : dominantElement === 'Air' ? 'intellect and communication' : 'emotion and intuition'} to your personality.`,
  };
}