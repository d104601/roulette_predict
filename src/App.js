import React, { useState, useEffect } from 'react';
import './App.css';
import RouletteInput from './components/RouletteInput';
import ResultHistory from './components/ResultHistory';
import Predictions from './components/Predictions';
import { generatePredictions } from './components/PredictionEngineV2';

function App() {
  const [results, setResults] = useState([]);
  const [predictions, setPredictions] = useState([]);

  // Add a new roulette result and update predictions if enough data
  const addResult = (number) => {
    const newResults = [...results, number];
    setResults(newResults);
    localStorage.setItem('rouletteResults', JSON.stringify(newResults));
    
    if (newResults.length >= 10) {
      updatePredictions(newResults);
    }
  };
  
  // Update predictions using the American roulette model (0, 00, 1-36)
  const updatePredictions = (data) => {
    // American roulette has 38 pockets (0, 00, 1-36)
    const { predictions: newPredictions } = generatePredictions(data, 6, true);
    setPredictions(newPredictions);
  };

  // Load saved results from localStorage on initial load
  useEffect(() => {
    const savedResults = localStorage.getItem('rouletteResults');
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
      if (parsedResults.length >= 10) {
        updatePredictions(parsedResults);
      }
    }
  }, []);

  // Reset all data and clear storage
  const reset = () => {
    setResults([]);
    setPredictions([]);
    localStorage.removeItem('rouletteResults');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>American Roulette Predictor</h1>
        <div className="roulette-info">
          <span>American Roulette (0, 00, 1-36)</span>
        </div>
      </header>
      <main>
        <RouletteInput onAddResult={addResult} isAmericanRoulette={true} />
        
        <Predictions predictions={predictions} />

        <div className="results-container">
          <ResultHistory results={results} limit={10} />
        </div>

        <div className="reset-container">
          <button className="reset-button" onClick={reset}>
            Reset All Data
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
