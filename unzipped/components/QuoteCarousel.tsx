import React, { useState, useEffect } from 'react';
import { INSPIRATIONAL_QUOTES } from '../constants';

const QuoteCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % INSPIRATIONAL_QUOTES.length);
        setIsFading(false);
      }, 500); // Corresponds to the fade-out duration
    }, 7000); // Change quote every 7 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-200 shadow-sm">
      <div
        className={`transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
      >
        <p className="text-sm text-orange-800">
            <span className="font-semibold mr-2">每日一句:</span>
            <span className="italic">"{INSPIRATIONAL_QUOTES[currentIndex]}"</span>
        </p>
      </div>
    </div>
  );
};

export default QuoteCarousel;