import React from 'react';

/**
 * Component to display predicted American roulette numbers
 * @param {Object} props - Component properties
 * @param {Array<number|string>} props.predictions - Array of predicted numbers
 * @returns {JSX.Element} - Rendered component
 */
const Predictions = ({ predictions = [] }) => {
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
              <span className={`number ${getNumberClass(num)}`}>
                {num}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-predictions">
          At least 10 results are needed to generate predictions.
        </p>
      )}
    </div>
  );
};

export default Predictions; 