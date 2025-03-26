import React, { useState } from 'react';

/**
 * Component for entering American roulette numbers
 * @param {Object} props - Component properties
 * @param {Function} props.onAddResult - Callback function to add result to history
 * @param {Function} props.setHotNumberList - Callback function to set hot numbers for prediction
 * @param {Function} props.clearHotNumbers - Callback function to clear hot numbers
 * @param {Boolean} props.isAmericanRoulette - Flag for American roulette mode
 * @param {Array} props.hotNumberList - Array of current hot numbers
 * @returns {JSX.Element} - Rendered component
 */
const RouletteInput = ({ 
  onAddResult, 
  setHotNumberList, 
  clearHotNumbers,
  isAmericanRoulette, 
  hotNumberList = [] 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showAdditionalInputs, setShowAdditionalInputs] = useState(false);
  const [additionalNumbers, setAdditionalNumbers] = useState(['', '', '']);
  const [hotNumbersInfo, setHotNumbersInfo] = useState(''); // 상위 숫자에 대한 부가 정보
  const [isDoubleZero, setIsDoubleZero] = useState(false); // 00 입력 상태 관리

  // Form submission handler - 일반 입력값만 처리
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
  };
  
  // 핫 넘버 추가 함수 - 기존 핫 넘버를 대체하여 예측에만 사용
  const addHotNumbers = () => {
    const newHotNumbers = [];
    const timestamp = new Date().toISOString();
    
    // 입력된 핫 넘버 처리
    additionalNumbers.forEach((numStr) => {
      if (numStr === '') return; // 숫자가 없으면 건너뜀
      
      // 00 처리
      if (numStr === '00') {
        newHotNumbers.push({
          number: '00',
          timestamp
        });
        return;
      }
      
      // 일반 숫자 처리
      const num = parseInt(numStr);
      if (isNaN(num) || num < 0 || num > 36) return; // 유효성 검사
      
      newHotNumbers.push({
        number: num,
        timestamp
      });
    });
    
    // 유효한 핫 넘버가 있는 경우에만 설정
    if (newHotNumbers.length > 0) {
      // 핫 넘버 목록 업데이트 (기존 핫 넘버 대체)
      setHotNumberList(newHotNumbers);
      clearAdditionalInputs();
    }
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

  // Clear additional inputs
  const clearAdditionalInputs = () => {
    setAdditionalNumbers(['', '', '']);
    setHotNumbersInfo('');
  };

  // 모든 핫 넘버 리셋 (입력 필드 + 저장된 핫 넘버)
  const handleClearAllHotNumbers = () => {
    clearAdditionalInputs();
    clearHotNumbers();
  };

  // Update hot numbers info text
  const updateHotNumbersInfo = () => {
    const validNumbers = additionalNumbers.filter(num => num !== '');
    if (validNumbers.length > 0) {
      // 유효한 핫 넘버 개수 표시
      setHotNumbersInfo(`Replace existing hot numbers with ${validNumbers.length} new numbers`);
    } else {
      setHotNumbersInfo('');
    }
  };

  // Update info when additionalNumbers change
  React.useEffect(() => {
    updateHotNumbersInfo();
  }, [additionalNumbers]);

  // 핫 넘버 목록을 문자열로 변환
  const formatHotNumberList = () => {
    if (hotNumberList.length === 0) return null;
    
    return hotNumberList.map(item => item.number).join(', ');
  };

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
                onClick={handleClearAllHotNumbers}
              >
                Clear All
              </button>
            </div>
            <div className="hot-numbers-info">
              <p>Enter hot numbers provided by the casino (used for prediction only)</p>
              {hotNumberList.length > 0 && (
                <div className="hot-numbers-count">
                  Current hot numbers: <strong>{formatHotNumberList()}</strong>
                </div>
              )}
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
                  </div>
                </div>
              ))}
            </div>
            
            {hotNumbersInfo && (
              <div className="hot-numbers-summary">
                {hotNumbersInfo}
              </div>
            )}
            
            <button 
              type="button" 
              className="add-hot-numbers-button"
              onClick={addHotNumbers}
              disabled={!additionalNumbers.some(num => num !== '')}
            >
              Set Hot Numbers for Prediction
            </button>
          </div>
        )}

        <button type="submit">Enter Single Result</button>
      </form>
    </div>
  );
};

export default RouletteInput;
