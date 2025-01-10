
import React, { useState } from 'react';

/**
 * Counter component that displays the number of times it has been clicked
 * 
 * @component
 * @example
 * return (
 *   <Counter />
 * )
 */
const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  /**
   * Handles button click by incrementing the count
   */
  const handleClick = () => {
    setCount(prevCount => prevCount + 1);
  };

  return (
    <button onClick={handleClick}>
      {count}
    </button>
  );
};

export default Counter;