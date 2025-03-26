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
    return num % 2 === 0 ? 'black' : 'red';
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