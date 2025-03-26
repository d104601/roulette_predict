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

  // Calculate color frequency and percentages
  const calculateColorStats = () => {
    if (results.length === 0) return { black: 0, red: 0 };
    
    let blackCount = 0;
    let redCount = 0;
    
    results.forEach(num => {
      if (num !== 0 && num !== '00') {
        if (num % 2 === 0) {
          blackCount++;
        } else {
          redCount++;
        }
      }
    });
    
    const total = blackCount + redCount;
    const blackPercent = total > 0 ? Math.round((blackCount / total) * 100) : 0;
    const redPercent = total > 0 ? Math.round((redCount / total) * 100) : 0;
    
    return {
      black: blackPercent,
      red: redPercent,
      blackCount,
      redCount,
      total
    };
  };
  
  const colorStats = calculateColorStats();

  return (
    <div className="result-history">
      <h2>Last {limit} Results</h2>
      {displayResults.length > 0 ? (
        <>
          <div className="history-list">
            {displayResults.map((num, index) => (
              <div key={index} className="history-item">
                <span className={`number ${getNumberClass(num)}`}>
                  {num}
                </span>
              </div>
            ))}
          </div>
          
          <div className="color-stats">
            <div className="stat-item">
              <span className="stat-label black">Black:</span> 
              <span className="stat-value">{colorStats.black}% ({colorStats.blackCount})</span>
            </div>
            <div className="stat-item">
              <span className="stat-label red">Red:</span> 
              <span className="stat-value">{colorStats.red}% ({colorStats.redCount})</span>
            </div>
          </div>
        </>
      ) : (
        <p className="no-history">
          No results yet. Please enter numbers.
        </p>
      )}
    </div>
  );
};

export default ResultHistory; 