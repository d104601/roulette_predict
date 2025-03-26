import React, { useState, useEffect } from 'react';
import './App.css';
import RouletteInput from './components/RouletteInput';
import ResultHistory from './components/ResultHistory';
import Predictions from './components/Predictions';
import { generatePredictions } from './components/PredictionEngineV2';

function App() {
  const [results, setResults] = useState([]);
  const [hotNumbers, setHotNumbers] = useState([]); // 핫 넘버 저장용 상태
  const [predictions, setPredictions] = useState([]);

  // Add a new roulette result and update predictions
  const addResult = (number) => {
    const newResults = [...results, number];
    setResults(newResults);
    localStorage.setItem('rouletteResults', JSON.stringify(newResults));
    
    // 일반 결과와 핫 넘버를 결합하여 예측에 사용
    const combinedData = [...newResults, ...hotNumbers];
    if (combinedData.length >= 10) {
      updatePredictions(combinedData);
    }
  };
  
  // Add hot numbers for prediction only (not in history)
  const addHotNumber = (number) => {
    const newHotNumbers = [...hotNumbers, number];
    setHotNumbers(newHotNumbers);
    localStorage.setItem('hotNumbers', JSON.stringify(newHotNumbers));
    
    // 일반 결과와 핫 넘버를 결합하여 예측에 사용
    const combinedData = [...results, ...newHotNumbers];
    if (combinedData.length >= 10) {
      updatePredictions(combinedData);
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
    const savedHotNumbers = localStorage.getItem('hotNumbers');
    
    let parsedResults = [];
    let parsedHotNumbers = [];
    
    if (savedResults) {
      parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
    }
    
    if (savedHotNumbers) {
      parsedHotNumbers = JSON.parse(savedHotNumbers);
      setHotNumbers(parsedHotNumbers);
    }
    
    // 일반 결과와 핫 넘버를 결합하여 예측에 사용
    const combinedData = [...parsedResults, ...parsedHotNumbers];
    if (combinedData.length >= 10) {
      updatePredictions(combinedData);
    }
  }, []);

  // Reset all data and clear storage
  const reset = () => {
    setResults([]);
    setHotNumbers([]);
    setPredictions([]);
    localStorage.removeItem('rouletteResults');
    localStorage.removeItem('hotNumbers');
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
        <RouletteInput 
          onAddResult={addResult}
          onAddHotNumber={addHotNumber}
          isAmericanRoulette={true}
          hotNumbersCount={hotNumbers.length}
        />
        
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
