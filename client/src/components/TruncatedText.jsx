// src/components/common/TruncatedText.jsx
import React from 'react';
import { Tooltip } from 'antd';

const TruncatedText = ({ text, maxLength = 30, isPhone = false }) => {
    if (!text) return "-";
    
    // Remove spaces from phone numbers if isPhone is true
    const processedText = isPhone ? text.replace(/[\s\-.]+/g, '') : text;
    
    const needsTruncation = processedText.length > maxLength;
    const displayText = needsTruncation 
      ? `${processedText.substring(0, maxLength)}...`
      : processedText;
  
    return needsTruncation ? (
      <Tooltip title={processedText}>
        <span>{displayText}</span>
      </Tooltip>
    ) : (
      <span>{displayText}</span>
    );
};



export default TruncatedText;