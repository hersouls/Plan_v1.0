import React from 'react';

function TestComponent() {
  const displayName = 'Test User';
  
  return (
    <div>
      <img
        src="test.jpg"
        alt={`${displayName || 'User'} Avatar`}
        className="test-class"
      />
    </div>
  );
}

export default TestComponent;