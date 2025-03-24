import React, { useState } from 'react';

/**
 * Component for entering American roulette numbers
 * @param {Object} props - Component properties
 * @param {Function} props.onAddResult - Callback function to add result
 * @param {Boolean} props.isAmericanRoulette - Flag for American roulette mode
 * @returns {JSX.Element} - Rendered component
 */
const RouletteInput = ({ onAddResult, isAmericanRoulette }) => {
  const [inputValue, setInputValue] = useState('');
  const [showAdditionalInputs, setShowAdditionalInputs] = useState(false);
  const [additionalNumbers, setAdditionalNumbers] = useState(['', '', '']);
  const [hotNumbersFrequency, setHotNumbersFrequency] = useState(['', '', '']); // 빈도수 입력 필드
  const [hotNumbersInfo, setHotNumbersInfo] = useState(''); // 상위 숫자에 대한 부가 정보

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Handle special case for "00" input
    if (inputValue === '00') {
      onAddResult('00');
      setInputValue('');
    } else {
      const number = parseInt(inputValue);
      if (!isNaN(number) && number >= 0 && number <= 36) {
        onAddResult(number);
        setInputValue('');
      }
    }
    
    // Process hot numbers with their frequencies
    // Add each hot number multiple times based on its reported frequency
    additionalNumbers.forEach((numStr, index) => {
      if (numStr === '') return; // 숫자가 없으면 건너뜀
      
      // Get the frequency count (비어있으면 기본값 1 사용)
      const frequency = hotNumbersFrequency[index] ? parseInt(hotNumbersFrequency[index]) : 1;
      if (isNaN(frequency) || frequency <= 0 || frequency > 10) return; // 유효성 검사
      
      // Add the number multiple times based on frequency
      for (let i = 0; i < frequency; i++) {
        if (numStr === '00') {
          onAddResult('00');
        } else {
          const num = parseInt(numStr);
          if (!isNaN(num) && num >= 0 && num <= 36) {
            onAddResult(num);
          }
        }
      }
    });
  };

  // Additional number input handler
  const handleAdditionalNumberChange = (index, value) => {
    const newAdditionalNumbers = [...additionalNumbers];
    newAdditionalNumbers[index] = value;
    setAdditionalNumbers(newAdditionalNumbers);
  };

  // Frequency input handler
  const handleFrequencyChange = (index, value) => {
    const newFrequency = [...hotNumbersFrequency];
    // 1~10 사이의 숫자만 허용
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 10)) {
      newFrequency[index] = value;
      setHotNumbersFrequency(newFrequency);
    }
  };

  // Clear additional inputs
  const clearAdditionalInputs = () => {
    setAdditionalNumbers(['', '', '']);
    setHotNumbersFrequency(['', '', '']);
    setHotNumbersInfo('');
  };

  // Update hot numbers info text
  const updateHotNumbersInfo = () => {
    const validNumbers = additionalNumbers.filter(num => num !== '');
    if (validNumbers.length > 0) {
      // 각 Hot Number의 빈도수 계산 (비어있으면 1로 취급)
      const totalFrequency = additionalNumbers.reduce((sum, num, index) => {
        if (num === '') return sum;
        const freq = hotNumbersFrequency[index] ? parseInt(hotNumbersFrequency[index]) : 1;
        return sum + (isNaN(freq) ? 1 : freq);
      }, 0);
      
      setHotNumbersInfo(`Adding ${totalFrequency} results to the statistics`);
    } else {
      setHotNumbersInfo('');
    }
  };

  // Update info when either numbers or frequencies change
  React.useEffect(() => {
    updateHotNumbersInfo();
  }, [additionalNumbers, hotNumbersFrequency]);

  return (
    <div className="roulette-input">
      <h2>Enter Roulette Result</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            placeholder="Number (0, 00, 1-36)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          
          <button 
            type="button" 
            className="toggle-frequent" 
            onClick={() => setShowAdditionalInputs(!showAdditionalInputs)}
            title="Show/Hide Hot Numbers"
          >
            {showAdditionalInputs ? '▲' : '▼'}
          </button>
        </div>
        
        {showAdditionalInputs && (
          <div className="additional-numbers">
            <div className="additional-header">
              <p>Casino Hot Numbers (Top 3):</p>
              <button 
                type="button" 
                className="clear-button" 
                onClick={clearAdditionalInputs}
              >
                Clear
              </button>
            </div>
            <div className="hot-numbers-info">
              <p>Enter hot numbers provided by the casino. Count is optional (default: 1)</p>
            </div>
            
            <div className="hot-numbers-container">
              {additionalNumbers.map((value, index) => (
                <div key={index} className="hot-number-group">
                  <div className="hot-number-label">#{index + 1}</div>
                  <div className="hot-number-inputs">
                    <input
                      type="text"
                      placeholder="Number"
                      value={value}
                      onChange={(e) => handleAdditionalNumberChange(index, e.target.value)}
                      className="additional-input"
                    />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Count (optional)"
                      value={hotNumbersFrequency[index]}
                      onChange={(e) => handleFrequencyChange(index, e.target.value)}
                      className="frequency-input"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {hotNumbersInfo && (
              <div className="hot-numbers-summary">
                {hotNumbersInfo}
              </div>
            )}
          </div>
        )}

        <button type="submit">Enter</button>
      </form>
    </div>
  );
};

export default RouletteInput;
