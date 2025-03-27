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
  const [predictionSuccess, setPredictionSuccess] = useState([]); // 예측 성공 기록

  // Add a new roulette result and update predictions
  const addResult = (number) => {
    const newResults = [...results, number];
    setResults(newResults);
    localStorage.setItem('rouletteResults', JSON.stringify(newResults));
    
    // 예측 결과에 입력한 숫자가 존재하는지 확인
    // number와 predictions 원소들의 타입(문자열 vs 숫자)을 고려하여 비교
    const isSuccessfulPrediction = predictions.some(pred => {
      if (number === '00' && pred === '00') return true;
      if (number !== '00' && pred !== '00' && parseInt(number) === parseInt(pred)) return true;
      return false;
    });
    
    // 성공 기록 업데이트
    let newSuccessHistory = [...predictionSuccess];
    
    if (isSuccessfulPrediction) {
      // 최근 예측 성공 기록 (숫자와 타임스탬프)
      const newSuccess = {
        number: number,
        timestamp: new Date().toISOString(),
        predicted: true
      };
      
      // 성공 기록 유지 (제한 없음)
      newSuccessHistory = [...newSuccessHistory, newSuccess];
      setPredictionSuccess(newSuccessHistory);
      localStorage.setItem('predictionSuccess', JSON.stringify(newSuccessHistory));
      
      // 성공 메시지 표시 (선택사항)
      console.log(`Successful prediction: ${number}`);
    } else {
      // 예측에 실패했지만 기록은 남김
      const newFailure = {
        number: number,
        timestamp: new Date().toISOString(),
        predicted: false
      };
      
      // 실패 기록도 함께 유지 (제한 없음)
      newSuccessHistory = [...newSuccessHistory, newFailure];
      setPredictionSuccess(newSuccessHistory);
      localStorage.setItem('predictionSuccess', JSON.stringify(newSuccessHistory));
    }
    
    // 일반 결과와 핫 넘버를 결합하여 예측에 사용
    updatePredictionsWithData(newResults, hotNumbers, newSuccessHistory);
  };
  
  // Add hot numbers for prediction only (not in history)
  // 새로운 핫 넘버가 입력되면 기존 핫 넘버를 대체
  const setHotNumberList = (newHotNumbers) => {
    setHotNumbers(newHotNumbers);
    localStorage.setItem('hotNumbers', JSON.stringify(newHotNumbers));
    
    // 일반 결과와 핫 넘버를 결합하여 예측에 사용
    updatePredictionsWithData(results, newHotNumbers, predictionSuccess);
  };
  
  // Clear hot numbers
  const clearHotNumbers = () => {
    setHotNumbers([]);
    localStorage.removeItem('hotNumbers');
    
    // 핫 넘버 없이 예측 업데이트
    updatePredictionsWithData(results, [], predictionSuccess);
  };
  
  // Helper function to update predictions with given data
  const updatePredictionsWithData = (resultData, hotNumberData, successHistory = predictionSuccess) => {
    // 핫 넘버 값만 추출
    const hotNumberValues = hotNumberData.map(hn => hn.number);
    // 일반 결과와 핫 넘버를 결합
    const combinedData = [...resultData, ...hotNumberValues];
    
    if (combinedData.length >= 10) {
      updatePredictions(combinedData, successHistory);
    } else {
      setPredictions([]);
    }
  };
  
  // Update predictions using the American roulette model (0, 00, 1-36)
  const updatePredictions = (data, successHistory) => {
    // American roulette has 38 pockets (0, 00, 1-36)
    const { predictions: newPredictions } = generatePredictions(data, 6, true, successHistory);
    setPredictions(newPredictions);
  };

  // Load saved results from localStorage on initial load
  useEffect(() => {
    const savedResults = localStorage.getItem('rouletteResults');
    const savedHotNumbers = localStorage.getItem('hotNumbers');
    const savedPredictionSuccess = localStorage.getItem('predictionSuccess');
    
    let parsedResults = [];
    let parsedHotNumbers = [];
    let parsedPredictionSuccess = [];
    
    if (savedResults) {
      parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
    }
    
    if (savedHotNumbers) {
      parsedHotNumbers = JSON.parse(savedHotNumbers);
      setHotNumbers(parsedHotNumbers);
    }
    
    if (savedPredictionSuccess) {
      parsedPredictionSuccess = JSON.parse(savedPredictionSuccess);
      setPredictionSuccess(parsedPredictionSuccess);
    }
    
    // 일반 결과와 핫 넘버를 결합하여 예측에 사용
    updatePredictionsWithData(parsedResults, parsedHotNumbers, parsedPredictionSuccess);
  }, []);

  // Reset all data and clear storage
  const reset = () => {
    setResults([]);
    setHotNumbers([]);
    setPredictions([]);
    setPredictionSuccess([]);
    localStorage.removeItem('rouletteResults');
    localStorage.removeItem('hotNumbers');
    localStorage.removeItem('predictionSuccess');
  };

  // 성공률 계산 
  const calculateSuccessRate = () => {
    if (predictionSuccess.length === 0) return 0;
    
    const successCount = predictionSuccess.filter(item => item.predicted).length;
    const totalCount = predictionSuccess.length;
    const successRate = Math.round((successCount / totalCount) * 100);
    
    return { 
      successCount,
      totalCount,
      successRate
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>American Roulette Predictor</h1>
        <div className="roulette-info">
          <span>American Roulette (0, 00, 1-36)</span>
          {predictionSuccess.length > 0 && (
            <span className="prediction-success-rate"> 
              | Prediction Success: {calculateSuccessRate().successRate}% 
              ({calculateSuccessRate().successCount}/{calculateSuccessRate().totalCount})
            </span>
          )}
        </div>
      </header>
      <main>
        <RouletteInput 
          onAddResult={addResult}
          setHotNumberList={setHotNumberList}
          clearHotNumbers={clearHotNumbers}
          isAmericanRoulette={true}
          hotNumberList={hotNumbers}
        />
        
        <Predictions 
          predictions={predictions} 
          successHistory={predictionSuccess}
        />

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
