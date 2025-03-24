/**
 * PredictionEngine.js
 * Provides algorithms for analyzing and predicting roulette results.
 */

/**
 * Find the most frequently occurring numbers.
 * @param {Array<number>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @returns {Array<number>} - Array of most frequent numbers
 */
export const getMostFrequentNumbers = (results, count = 6) => {
  if (!results || results.length === 0) return [];
  
  const numberCounts = {};
  
  // Calculate occurrence count for each number
  results.forEach(num => {
    numberCounts[num] = (numberCounts[num] || 0) + 1;
  });
  
  // Sort by occurrence count and return top 'count' numbers
  return Object.entries(numberCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(entry => parseInt(entry[0]));
};

/**
 * Find numbers that haven't appeared recently.
 * @param {Array<number>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @returns {Array<number>} - Array of least recent numbers
 */
export const getLeastRecentNumbers = (results, count = 6) => {
  if (!results || results.length === 0) return [];
  
  // All possible roulette numbers (0-36)
  const allNumbers = Array.from({ length: 37 }, (_, i) => i);
  
  // Find the last occurrence index of each number in recent results
  const lastOccurrence = {};
  allNumbers.forEach(num => {
    lastOccurrence[num] = -1; // Default: not appeared
  });
  
  results.forEach((num, index) => {
    lastOccurrence[num] = index;
  });
  
  // Sort by last occurrence index (oldest or not appeared first)

    return Object.entries(lastOccurrence)
    .filter(([num]) => num !== "0") 
    .sort((a, b) => a[1] - b[1])
    .slice(0, count)
    .map(entry => parseInt(entry[0]));
};

/**
 * Predict numbers based on patterns (odd/even, red/black, range).
 * @param {Array<number>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @returns {Array<number>} - Array of pattern-based predicted numbers
 */
export const getPatternBasedNumbers = (results, count = 6) => {
  if (!results || results.length < 10) return [];
  
  const recentResults = results.slice(-20); // Analyze only the most recent 20 results
  
  // Analyze odd/even pattern
  const oddCount = recentResults.filter(num => num !== 0 && num % 2 === 1).length;
  const evenCount = recentResults.filter(num => num !== 0 && num % 2 === 0).length;
  const isOddDominant = oddCount > evenCount;
  
  // Analyze color pattern (0 is green, odd is red, even is black)
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
  
  const redCount = recentResults.filter(num => redNumbers.includes(num)).length;
  const blackCount = recentResults.filter(num => blackNumbers.includes(num)).length;
  const isRedDominant = redCount > blackCount;
  
  // Analyze range pattern
  const lowCount = recentResults.filter(num => num > 0 && num <= 18).length;
  const highCount = recentResults.filter(num => num > 18 && num <= 36).length;
  const isLowDominant = lowCount > highCount;
  
  // Pattern-based number selection
  let patternNumbers = [];
  
  // Add numbers based on odd/even pattern
  if (isOddDominant) {
    // If odd numbers are more frequent, select from odd numbers
    patternNumbers = patternNumbers.concat(
      Array.from({ length: 18 }, (_, i) => i * 2 + 1).filter(n => n <= 36)
    );
  } else {
    // If even numbers are more frequent, select from even numbers
    patternNumbers = patternNumbers.concat(
      Array.from({ length: 18 }, (_, i) => (i + 1) * 2).filter(n => n <= 36)
    );
  }
  
  // Filter by color pattern
  if (isRedDominant) {
    patternNumbers = patternNumbers.filter(num => redNumbers.includes(num));
  } else {
    patternNumbers = patternNumbers.filter(num => blackNumbers.includes(num));
  }
  
  // Additional filtering by range pattern
  if (isLowDominant) {
    patternNumbers = patternNumbers.filter(num => num <= 18);
  } else {
    patternNumbers = patternNumbers.filter(num => num > 18);
  }
  
  // Add more numbers if not enough
  if (patternNumbers.length < count) {
    const additionalNumbers = isLowDominant 
      ? Array.from({ length: 18 }, (_, i) => i + 1)
      : Array.from({ length: 18 }, (_, i) => i + 19);
    
    patternNumbers = patternNumbers.concat(
      additionalNumbers.filter(num => !patternNumbers.includes(num))
    );
  }
  
  // Return 'count' numbers
  return patternNumbers.filter(num => num !== 0).slice(0, count);
};

/**
 * Bayesian estimation for roulette number prediction.
 * @param {Array<number>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @param {Object} [priorProbabilities] - Initial prior probabilities for each number
 * @returns {Array<number>} - Array of predicted numbers based on Bayesian estimation
 */
export const getBayesianPredictions = (results, count = 6, priorProbabilities = null) => {
  if (!results || results.length === 0) return [];

  // All possible roulette numbers (0-36)
  const allNumbers = Array.from({ length: 37 }, (_, i) => i).filter(num => num !== 0);
  
  // Initialize prior probabilities if not provided
  if (!priorProbabilities) {
    priorProbabilities = {};
    // Uniform prior - each number has equal probability initially
    allNumbers.forEach(num => {
      priorProbabilities[num] = 1 / allNumbers.length;
    });
  }
  
  // Calculate posterior probabilities based on the observed results
  let posteriorProbabilities = { ...priorProbabilities };
  
  // For Bayesian update, we'll consider the recent results more heavily
  // We'll use a decay factor to give more weight to recent results
  const recentResults = results.slice(-30); // Consider the last 30 results
  
  recentResults.forEach((num, index) => {
    // Skip 0 as we're not predicting it
    if (num === 0) return;
    
    // Weight factor - recent results have more influence
    const weight = 0.5 + (0.5 * (index / recentResults.length));
    
    // Update probability for the observed number
    posteriorProbabilities[num] = posteriorProbabilities[num] * (1 + weight);
    
    // Normalize probabilities to ensure they sum to 1
    const totalProb = Object.values(posteriorProbabilities).reduce((sum, prob) => sum + prob, 0);
    Object.keys(posteriorProbabilities).forEach(key => {
      posteriorProbabilities[key] = posteriorProbabilities[key] / totalProb;
    });
  });
  
  // Consider contextual factors
  // 1. Numbers that appear in sequences
  const sequences = findSequentialPatterns(results);
  
  // 2. Hot and cold numbers
  const recentFrequency = {};
  recentResults.forEach(num => {
    recentFrequency[num] = (recentFrequency[num] || 0) + 1;
  });
  
  // Adjust posterior probabilities based on these factors
  allNumbers.forEach(num => {
    // Adjust for sequences
    if (sequences.includes(num)) {
      posteriorProbabilities[num] *= 1.2; // Boost probability for numbers in sequences
    }
    
    // Adjust for recent frequency (hot numbers)
    if (recentFrequency[num] && recentFrequency[num] > 1) {
      posteriorProbabilities[num] *= 1 + (recentFrequency[num] / recentResults.length);
    }
  });
  
  // Normalize probabilities again
  const totalPosteriorProb = Object.values(posteriorProbabilities).reduce((sum, prob) => sum + prob, 0);
  Object.keys(posteriorProbabilities).forEach(key => {
    posteriorProbabilities[key] = posteriorProbabilities[key] / totalPosteriorProb;
  });
  
  // Sort numbers by posterior probability and return top 'count'
  return Object.entries(posteriorProbabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(entry => parseInt(entry[0]));
};

/**
 * Find sequential patterns in past results.
 * @param {Array<number>} results - Array of past roulette results
 * @returns {Array<number>} - Array of numbers that appear in sequences
 */
const findSequentialPatterns = (results) => {
  if (!results || results.length < 3) return [];
  
  const patterns = [];
  
  // Look for numbers that frequently follow each other
  for (let i = 0; i < results.length - 2; i++) {
    if (results[i] !== 0 && results[i+1] !== 0) {
      patterns.push(results[i+1]);
      
      // If we find a three-number sequence, add the expected next number
      if (i < results.length - 3 && results[i+2] !== 0) {
        patterns.push(results[i+2]);
      }
    }
  }
  
  return [...new Set(patterns)]; // Remove duplicates
};

/**
 * Combine multiple prediction methods to generate final predictions.
 * @param {Array<number>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @returns {Array<number>} - Array of final predicted numbers
 */
export const generatePredictions = (results, count = 6) => {
  if (!results || results.length < 10) return [];
  
  // Get numbers from each prediction method
  const frequentNumbers = getMostFrequentNumbers(results, Math.ceil(count / 4));
  const leastRecentNumbers = getLeastRecentNumbers(results, Math.ceil(count / 4));
  const patternNumbers = getPatternBasedNumbers(results, Math.ceil(count / 4));
  const bayesianNumbers = getBayesianPredictions(results, Math.ceil(count / 4));
  
  // Combine results from all methods
  let combinedNumbers = [...new Set([...frequentNumbers, ...leastRecentNumbers, ...patternNumbers, ...bayesianNumbers])]
    .filter(num => num !== 0);
  
  // Remove duplicates
  const uniqueNumbers = [...new Set(combinedNumbers)];
  
  // Add random numbers if not enough
  if (uniqueNumbers.length < count) {
    const allNumbers = Array.from({ length: 37 }, (_, i) => i);
    const remainingNumbers = allNumbers.filter(num => !uniqueNumbers.includes(num));
    
    // Shuffle randomly
    const shuffled = remainingNumbers.sort(() => 0.5 - Math.random());
    
    // Add as many as needed
    uniqueNumbers.push(...shuffled.slice(0, count - uniqueNumbers.length));
  }
  
  return uniqueNumbers.slice(0, count);
}; 