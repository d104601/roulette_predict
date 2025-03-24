import React from 'react';

/**
 * Component to display American roulette result history
 * @param {Object} props - Component properties
 * @param {Array<number|string>} props.results - Array of result history
 * @param {number} props.limit - Maximum number of results to display
 * @returns {JSX.Element} - Rendered component
 */
const ResultHistory = ({ results = [], limit = 10 }) => {
  // Determine number color (0 and 00 are green, odd is red, even is black)
  const getNumberClass = (num) => {
    if (num === 0 || num === '00') return 'green';
    return num % 2 === 0 ? 'black' : 'red';
  };

  // Display only the most recent 'limit' results
  const displayResults = results.slice(-limit);

  return (
    <div className="result-history">
      <h2>Last {limit} Results</h2>
      {displayResults.length > 0 ? (
        <div className="history-list">
          {displayResults.map((num, index) => (
            <div key={index} className="history-item">
              <span className={`number ${getNumberClass(num)}`}>
                {num}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-history">
          No results yet. Please enter numbers.
        </p>
      )}
    </div>
  );
};

export default ResultHistory; 