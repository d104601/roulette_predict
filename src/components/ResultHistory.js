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
    
    // 실제 아메리칸 룰렛 색상 배치
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  // Display only the most recent 'limit' results
  const displayResults = results.slice(-limit);

  // Calculate color frequency and percentages
  const calculateColorStats = () => {
    if (results.length === 0) return { black: 0, red: 0 };
    
    let blackCount = 0;
    let redCount = 0;
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    
    results.forEach(num => {
      if (num !== 0 && num !== '00') {
        if (redNumbers.includes(num)) {
          redCount++;
        } else {
          blackCount++;
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