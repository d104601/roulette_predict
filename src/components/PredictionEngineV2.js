/**
 * PredictionEngineV2.js
 * Provides multiple algorithms for predicting roulette results using various methods
 * and combines them using ensemble techniques.
 */

/**
 * Predict roulette numbers using Bayesian estimation
 * @param {Array<number|string>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @param {boolean} isAmericanRoulette - Whether to use American roulette (includes 00)
 * @param {Object} [priorProbabilities] - Initial prior probabilities for each number
 * @returns {Array<number|string>} - Array of predicted numbers based on Bayesian estimation
 */
export const getBayesianPredictions = (results, count = 6, isAmericanRoulette = true, priorProbabilities = null) => {
  if (!results || results.length === 0) return [];

  // All possible roulette numbers
  // For American roulette: 0, 00, 1-36
  // For European roulette: 0, 1-36
  let allNumbers = Array.from({ length: 37 }, (_, i) => i);
  if (isAmericanRoulette) {
    allNumbers.push('00'); // Add double zero for American roulette
  }
  
  // Initialize prior probabilities if not provided
  if (!priorProbabilities) {
    priorProbabilities = {};
    // Uniform prior probabilities - initially each number has the same probability
    allNumbers.forEach(num => {
      priorProbabilities[num] = 1 / allNumbers.length;
    });
  }
  
  // Calculate posterior probabilities based on observed results
  let posteriorProbabilities = { ...priorProbabilities };
  
  // Use a decay factor for Bayesian updates to give more weight to recent results
  // Consider the last 30 results
  const recentResults = results.slice(-30);
  
  recentResults.forEach((num, index) => {
    // Skip if the number doesn't exist in our probability model
    if (!posteriorProbabilities.hasOwnProperty(num)) return;
    
    // Weight factor - recent results have more influence
    const weight = 0.5 + (0.5 * (index / recentResults.length));
    
    // Update probability for the observed number
    posteriorProbabilities[num] = posteriorProbabilities[num] * (1 + weight);
    
    // Normalize so the sum of probabilities equals 1
    const totalProb = Object.values(posteriorProbabilities).reduce((sum, prob) => sum + prob, 0);
    Object.keys(posteriorProbabilities).forEach(key => {
      posteriorProbabilities[key] = posteriorProbabilities[key] / totalProb;
    });
  });
  
  // Consider contextual factors
  // 1. Numbers appearing in sequential patterns
  const sequences = findSequentialPatterns(results);
  
  // 2. Hot and cold numbers
  const recentFrequency = {};
  recentResults.forEach(num => {
    recentFrequency[num] = (recentFrequency[num] || 0) + 1;
  });
  
  // Adjust posterior probabilities based on these factors
  allNumbers.forEach(num => {
    // Adjustment for sequential patterns
    if (sequences.includes(num)) {
      posteriorProbabilities[num] *= 1.2; // Increase probability for numbers in sequential patterns
    }
    
    // Adjustment for recent frequency (hot numbers)
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
    .map(entry => entry[0] === '00' ? '00' : parseInt(entry[0]));
};

/**
 * Find sequential patterns in past results
 * @param {Array<number|string>} results - Array of past roulette results
 * @returns {Array<number|string>} - Array of numbers appearing in sequential patterns
 */
const findSequentialPatterns = (results) => {
  if (!results || results.length < 3) return [];
  
  const patterns = [];
  
  // Find numbers that frequently follow each other
  for (let i = 0; i < results.length - 2; i++) {
    // Skip zeros for pattern detection
    if (results[i] !== 0 && results[i] !== '00' && 
        results[i+1] !== 0 && results[i+1] !== '00') {
      patterns.push(results[i+1]);
      
      // If we find a 3-number sequence, add the expected next number
      if (i < results.length - 3 && 
          results[i+2] !== 0 && results[i+2] !== '00') {
        patterns.push(results[i+2]);
      }
    }
  }
  
  return [...new Set(patterns)]; // Remove duplicates
};

/**
 * NEW METHOD: Predict using Markov Chain analysis
 * This method identifies transition probabilities between numbers
 * @param {Array<number|string>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @param {boolean} isAmericanRoulette - Whether to use American roulette
 * @returns {Array<number|string>} - Array of predicted numbers
 */
const getMarkovPredictions = (results, count = 6, isAmericanRoulette = true) => {
  if (!results || results.length < 5) return [];
  
  // Define all possible states
  let allNumbers = Array.from({ length: 37 }, (_, i) => i);
  if (isAmericanRoulette) {
    allNumbers.push('00');
  }
  
  // Build transition matrix (2-step Markov chain)
  const transitions = {};
  
  // Initialize transitions object
  allNumbers.forEach(from => {
    transitions[from] = {};
    allNumbers.forEach(to => {
      transitions[from][to] = 0;
    });
  });
  
  // Count transitions
  for (let i = 0; i < results.length - 1; i++) {
    const from = results[i];
    const to = results[i + 1];
    
    // Skip if numbers don't exist in our model
    if (!transitions[from] || !transitions[from][to]) continue;
    
    transitions[from][to] += 1;
  }
  
  // Convert counts to probabilities
  Object.keys(transitions).forEach(from => {
    const totalTransitions = Object.values(transitions[from]).reduce((sum, count) => sum + count, 0);
    if (totalTransitions > 0) {
      Object.keys(transitions[from]).forEach(to => {
        transitions[from][to] = transitions[from][to] / totalTransitions;
      });
    }
  });
  
  // Get last result to predict next possible numbers
  const lastNumber = results[results.length - 1];
  
  // If we don't have transition data for the last number, return empty array
  if (!transitions[lastNumber]) return [];
  
  // Sort by transition probability
  const predictions = Object.entries(transitions[lastNumber])
    .filter(([to, prob]) => prob > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(entry => entry[0] === '00' ? '00' : parseInt(entry[0]));
  
  return predictions;
};

/**
 * NEW METHOD: Predict based on wheel sectors
 * This uses the physical layout of the roulette wheel to find potential biases
 * @param {Array<number|string>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @param {boolean} isAmericanRoulette - Whether to use American roulette
 * @returns {Array<number|string>} - Array of predicted numbers
 */
const getSectorPredictions = (results, count = 6, isAmericanRoulette = true) => {
  if (!results || results.length < 10) return [];
  
  // Define wheel sectors (neighboring numbers on American roulette wheel)
  // Standard American wheel sequence: 0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 00, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
  const americanWheelSequence = [
    0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, '00', 
    27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
  ];
  
  // Use the appropriate wheel layout
  const wheelSequence = isAmericanRoulette ? americanWheelSequence : americanWheelSequence.filter(n => n !== '00');
  
  // Find active wheel sectors (5 consecutive positions)
  const sectorHits = {};
  wheelSequence.forEach((num, index) => {
    sectorHits[num] = 0;
  });
  
  // Count hits per number
  results.forEach(result => {
    if (sectorHits.hasOwnProperty(result)) {
      sectorHits[result]++;
    }
  });
  
  // Find "hot sectors" (areas of the wheel with more hits)
  const sectorScores = {};
  wheelSequence.forEach((num, index) => {
    sectorScores[num] = 0;
    
    // Add scores from 5 numbers in sequence (current number and 2 on each side)
    for (let i = -2; i <= 2; i++) {
      const pos = (index + i + wheelSequence.length) % wheelSequence.length;
      const neighborNumber = wheelSequence[pos];
      sectorScores[num] += sectorHits[neighborNumber] || 0;
    }
  });
  
  // Get top sector scores
  const predictions = Object.entries(sectorScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(entry => entry[0] === '00' ? '00' : parseInt(entry[0]));
  
  return predictions;
};

/**
 * NEW METHOD: Predict using hot and cold number analysis
 * @param {Array<number|string>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @param {boolean} isAmericanRoulette - Whether to use American roulette
 * @returns {Array<number|string>} - Array of predicted numbers
 */
const getHotColdPredictions = (results, count = 6, isAmericanRoulette = true) => {
  if (!results || results.length < 10) return [];
  
  // All possible roulette numbers
  let allNumbers = Array.from({ length: 37 }, (_, i) => i);
  if (isAmericanRoulette) {
    allNumbers.push('00');
  }
  
  // Count frequency of each number
  const frequency = {};
  allNumbers.forEach(num => {
    frequency[num] = 0;
  });
  
  // Consider recent results with more weight
  const recentResults = results.slice(-50);
  recentResults.forEach((num, index) => {
    // Apply recency weight
    const recencyWeight = 1 + (index / recentResults.length);
    frequency[num] = (frequency[num] || 0) + recencyWeight;
  });
  
  // Calculate "expectation to hit" - numbers that haven't appeared for a while
  // are more likely to appear in the future
  const expectedHits = {};
  allNumbers.forEach(num => {
    // Find the last position this number appeared
    const lastIndex = recentResults.lastIndexOf(num);
    
    if (lastIndex === -1) {
      // Never appeared in recent results - high expectation
      expectedHits[num] = 5.0;
    } else {
      // Appeared recently - expectation based on how long ago
      const timeSinceLastHit = recentResults.length - lastIndex;
      expectedHits[num] = Math.log(timeSinceLastHit + 1);
    }
  });
  
  // Combine hot numbers (high frequency) and due numbers (high expectation)
  const combinedScores = {};
  allNumbers.forEach(num => {
    // Balance between hot and due - currently weighted 40% frequency, 60% expectation
    combinedScores[num] = (0.4 * frequency[num]) + (0.6 * expectedHits[num]);
  });
  
  // Return top scored numbers
  return Object.entries(combinedScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(entry => entry[0] === '00' ? '00' : parseInt(entry[0]));
};

/**
 * NEW METHOD: Pattern Recognition Predictions
 * Look for repeating patterns in the result history
 * @param {Array<number|string>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @param {boolean} isAmericanRoulette - Whether to use American roulette
 * @returns {Array<number|string>} - Array of predicted numbers
 */
const getPatternPredictions = (results, count = 6, isAmericanRoulette = true) => {
  if (!results || results.length < 15) return [];
  
  // Define all possible numbers
  let allNumbers = Array.from({ length: 37 }, (_, i) => i);
  if (isAmericanRoulette) {
    allNumbers.push('00');
  }
  
  // Looking for repeating sequences of various lengths
  const predictions = new Set();
  const maxPatternLength = 5;
  
  // Look for patterns of different lengths
  for (let patternLength = 2; patternLength <= maxPatternLength; patternLength++) {
    // Check the most recent sequence
    const recentSequence = results.slice(-patternLength);
    
    // Look for this sequence earlier in the results
    for (let i = 0; i <= results.length - (patternLength * 2); i++) {
      let patternMatches = true;
      
      // Check if we have a matching pattern
      for (let j = 0; j < patternLength; j++) {
        if (results[i + j] !== recentSequence[j]) {
          patternMatches = false;
          break;
        }
      }
      
      // If we found a match, the next number might repeat as well
      if (patternMatches) {
        // Add the number that followed this pattern previously
        const predictedNumber = results[i + patternLength];
        predictions.add(predictedNumber);
      }
    }
  }
  
  // If we didn't find enough pattern predictions, add numbers from surrounding pattern
  if (predictions.size < count) {
    // Look for "numerical neighbors" in the results
    const lastResult = results[results.length - 1];
    if (typeof lastResult === 'number') {
      // Add adjacent numbers on the wheel
      const neighbors = [
        lastResult - 1,
        lastResult + 1,
        lastResult - 2,
        lastResult + 2,
        lastResult - 3,
        lastResult + 3
      ];
      
      neighbors.forEach(num => {
        // Make sure number is in valid range
        if (num >= 1 && num <= 36) {
          predictions.add(num);
        }
      });
    }
  }
  
  // If we still don't have enough predictions, add some random ones
  const predictionArray = Array.from(predictions);
  
  if (predictionArray.length < count) {
    // Add some strategic random numbers
    const remaining = allNumbers.filter(num => !predictionArray.includes(num));
    const randomSample = remaining.sort(() => 0.5 - Math.random()).slice(0, count - predictionArray.length);
    randomSample.forEach(num => predictionArray.push(num));
  }
  
  return predictionArray.slice(0, count);
};

/**
 * Generate final predictions using ensemble method
 * @param {Array<number|string>} results - Array of past roulette results
 * @param {number} count - Number of results to return
 * @param {boolean} isAmericanRoulette - Whether to use American roulette (includes 00)
 * @returns {Object} - Object containing predictions array and methods array
 */
export const generatePredictions = (results, count = 6, isAmericanRoulette = true) => {
  if (!results || results.length < 10) return { predictions: [] };
  
  // Generate predictions using multiple methods
  const bayesianPredictions = getBayesianPredictions(results, count, isAmericanRoulette);
  
  // Only use advanced methods if we have enough data
  let markovPredictions = [];
  if (results.length >= 15) {
    markovPredictions = getMarkovPredictions(results, count, isAmericanRoulette);
  }
    
  let sectorPredictions = [];
  if (results.length >= 20) {
    sectorPredictions = getSectorPredictions(results, count, isAmericanRoulette);
  }
    
  let hotColdPredictions = [];
  if (results.length >= 15) {
    hotColdPredictions = getHotColdPredictions(results, count, isAmericanRoulette);
  }
    
  let patternPredictions = [];
  if (results.length >= 20) {
    patternPredictions = getPatternPredictions(results, count, isAmericanRoulette);
  }
  
  // Tally the predictions from different methods (weighted voting)
  const voteTally = {};
  
  // Initialize all possible numbers with zero votes
  let allNumbers = Array.from({ length: 37 }, (_, i) => i);
  if (isAmericanRoulette) {
    allNumbers.push('00');
  }
  
  allNumbers.forEach(num => {
    voteTally[num] = 0;
  });
  
  // Weight the predictions based on method reliability
  // These weights can be adjusted based on empirical performance
  const addVotes = (predictions, weight) => {
    predictions.forEach((num, index) => {
      // Higher ranked predictions get more votes
      const positionWeight = (predictions.length - index) / predictions.length;
      voteTally[num] += weight * positionWeight;
    });
  };
  
  // Add weighted votes from each method
  addVotes(bayesianPredictions, 1.0);    // Bayesian gets full weight
  addVotes(markovPredictions, 0.8);      // Markov gets 0.8 weight
  addVotes(sectorPredictions, 0.7);      // Sector analysis gets 0.7 weight
  addVotes(hotColdPredictions, 0.9);     // Hot/cold analysis gets 0.9 weight
  addVotes(patternPredictions, 0.8);     // Pattern recognition gets 0.8 weight
  
  // Select the top vote-getters
  let finalPredictions = Object.entries(voteTally)
    .sort((a, b) => b[1] - a[1])   // Sort by votes (descending)
    .slice(0, count)                // Take the top 'count' numbers
    .map(entry => entry[0] === '00' ? '00' : parseInt(entry[0]));
  
  // If we have fewer than requested count, add random numbers
  if (finalPredictions.length < count) {
    const remainingNumbers = allNumbers.filter(num => !finalPredictions.includes(num));
    const shuffled = remainingNumbers.sort(() => 0.5 - Math.random());
    finalPredictions = [...finalPredictions, ...shuffled.slice(0, count - finalPredictions.length)];
  }
  
  return {
    predictions: finalPredictions.slice(0, count)
  };
};
