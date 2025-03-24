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
  const [isDoubleZero, setIsDoubleZero] = useState(false); // 00 입력 상태 관리

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Handle special case for "00" input
    if (isDoubleZero) {
      onAddResult('00');
      setInputValue('');
      setIsDoubleZero(false);
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
      
      // 00 처리
      if (numStr === '00') {
        // Get the frequency count (비어있으면 기본값 1 사용)
        const frequency = hotNumbersFrequency[index] ? parseInt(hotNumbersFrequency[index]) : 1;
        if (isNaN(frequency) || frequency <= 0 || frequency > 10) return; // 유효성 검사
        
        // 빈도수만큼 추가
        for (let i = 0; i < frequency; i++) {
          onAddResult('00');
        }
        return;
      }
      
      // 일반 숫자 처리
      const num = parseInt(numStr);
      if (isNaN(num) || num < 0 || num > 36) return; // 유효성 검사
      
      // Get the frequency count (비어있으면 기본값 1 사용)
      const frequency = hotNumbersFrequency[index] ? parseInt(hotNumbersFrequency[index]) : 1;
      if (isNaN(frequency) || frequency <= 0 || frequency > 10) return; // 유효성 검사
      
      // Add the number multiple times based on frequency
      for (let i = 0; i < frequency; i++) {
        onAddResult(num);
      }
    });
  };

  // Main input handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // 00 특수 처리
    if (value === '00') {
      setInputValue('0');
      setIsDoubleZero(true);
      return;
    }
    
    // 0 처리 - 두 번째 0이 입력되면 00으로 처리
    if (value === '0' && inputValue === '0') {
      setIsDoubleZero(true);
      return;
    }
    
    // 일반 숫자 입력
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 36)) {
      setInputValue(value);
      setIsDoubleZero(false);
    }
  };

  // Additional number input handler
  const handleAdditionalNumberChange = (index, value) => {
    const newAdditionalNumbers = [...additionalNumbers];
    
    // 00 입력 처리
    if (value === '00') {
      newAdditionalNumbers[index] = '00';
      setAdditionalNumbers(newAdditionalNumbers);
      return;
    }
    
    // 0 입력 처리 - 연속으로 0을 입력하면 00으로 변경
    if (value === '0' && additionalNumbers[index] === '0') {
      newAdditionalNumbers[index] = '00';
      setAdditionalNumbers(newAdditionalNumbers);
      return;
    }
    
    // 일반 숫자 입력
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 36)) {
      newAdditionalNumbers[index] = value;
      setAdditionalNumbers(newAdditionalNumbers);
    }
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
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={isDoubleZero ? "00" : "Number (0-36, 00)"}
            value={isDoubleZero ? "00" : inputValue}
            onChange={handleInputChange}
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
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Number"
                      value={value}
                      onChange={(e) => handleAdditionalNumberChange(index, e.target.value)}
                      className="additional-input"
                    />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
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
