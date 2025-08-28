'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface AnimatedScoreProps {
  value: number;
  className?: string;
  duration?: number;
}

export default function AnimatedScore({ value, className = '', duration = 0.3 }: AnimatedScoreProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate from previous value to new value
    const obj = { val: prevValueRef.current };
    gsap.to(obj, {
      val: value,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayValue(Math.round(obj.val));
      },
    });
    
    prevValueRef.current = value;
  }, [value, duration]);

  return (
    <div ref={elementRef} className={className}>
      {displayValue.toString()}
    </div>
  );
}
