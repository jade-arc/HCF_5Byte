
import React, { useState, useEffect, memo } from 'react';

interface AnimatedLoadingTextProps {
  words?: string[];
  interval?: number;
}

const defaultWords = ["LOADING", "COMPUTING", "SEARCHING", "RETRIEVING"];

// We need to add the animation styles directly into a style tag or the main CSS file
const animationStyles = `
@keyframes flip-in {
  from {
    transform: rotateX(90deg) translateY(10px);
    opacity: 0;
  }
  to {
    transform: rotateX(0deg) translateY(0);
    opacity: 1;
  }
}
@keyframes flip-out {
  from {
    transform: rotateX(0deg) translateY(0);
    opacity: 1;
  }
  to {
    transform: rotateX(-90deg) translateY(-10px);
    opacity: 0;
  }
}
.letter {
  display: inline-block;
  opacity: 0;
  transform-style: preserve-3d;
}
.letter.in {
  animation: flip-in 0.4s ease-out forwards;
}
.letter.out {
  animation: flip-out 0.3s ease-in forwards;
}
`;

const Word: React.FC<{ text: string; animation: 'in' | 'out' }> = memo(({ text, animation }) => {
  return (
    <div className="flex text-lg font-semibold tracking-wider text-gray-700 uppercase" aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={`letter ${animation}`}
          style={{ animationDelay: `${i * 0.05}s` }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
});

export const AnimatedLoadingText: React.FC<AnimatedLoadingTextProps> = ({
  words = defaultWords,
  interval = 2000,
}) => {
  const [index, setIndex] = useState(0);
  const [animation, setAnimation] = useState<'in' | 'out'>('in');
  const [currentWord, setCurrentWord] = useState(words[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimation('out');
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setAnimation('in');
      }, 400); // Should be slightly longer than the out animation duration
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  useEffect(() => {
    setCurrentWord(words[index]);
  }, [index, words]);

  return (
    <>
      <style>{animationStyles}</style>
      <div className="relative h-8 w-48 flex items-center justify-center" style={{ perspective: "500px" }}>
          <Word text={currentWord} animation={animation} />
      </div>
    </>
  );
};
