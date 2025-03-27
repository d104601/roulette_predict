import React from 'react';

/**
 * Component to display predicted American roulette numbers
 * @param {Object} props - Component properties
 * @param {Array<number|string>} props.predictions - Array of predicted numbers
 * @param {Array} props.successHistory - Array of prediction success history
 * @returns {JSX.Element} - Rendered component
 */
const Predictions = ({ predictions = [], successHistory = [] }) => {
  // 최근에 성공한 예측을 확인
  const getRecentSuccesses = () => {
    if (!successHistory || successHistory.length === 0) return new Set();
    
    // 최근 5개의 성공한 예측만 강조 표시
    return new Set(
      successHistory
        .filter(item => item.predicted)
        .slice(-5)
        .map(item => item.number)
    );
  };
  
  // 성공한 예측 번호 목록
  const recentSuccesses = getRecentSuccesses();
  
  // 예측이 최근에 성공한 적이 있는지 확인
  const isPredictionSuccessful = (num) => {
    return recentSuccesses.has(num);
  };

  // Determine number color (0 and 00 are green, odd is red, even is black)
  const getNumberClass = (num) => {
    if (num === 0 || num === '00') return 'green';
    
    // 실제 아메리칸 룰렛 색상 배치
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  // Sort predictions in ascending order (00, 0, 1-36)
  const sortedPredictions = [...predictions].sort((a, b) => {
    if (a === '00') return -1;
    if (b === '00') return 1;
    if (a === 0) return -1;
    if (b === 0) return 1;
    return a - b;
  });

  return (
    <div className="predictions">
      <h2>Predicted Numbers</h2>
      {sortedPredictions.length > 0 ? (
        <div className="prediction-list">
          {sortedPredictions.map((num, index) => (
            <div key={index} className="prediction-item">
              <span 
                className={`number ${getNumberClass(num)} ${isPredictionSuccessful(num) ? 'successful-prediction' : ''}`}
                title={isPredictionSuccessful(num) ? "This prediction was successful recently!" : ""}
              >
                {num}
                {isPredictionSuccessful(num) && <div className="success-indicator">✓</div>}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-predictions">
          At least 10 results are needed to generate predictions.
        </p>
      )}
      
      {successHistory.length > 0 && (
        <div className="prediction-stats">
          <p>Recent predictions: <span className="success-count">{successHistory.filter(s => s.predicted).length} successful</span> out of {successHistory.length} attempts</p>
        </div>
      )}
    </div>
  );
};

export default Predictions; 