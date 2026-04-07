import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Timer } from 'lucide-react';

export default function CountdownTimer({ endTime, onEnd, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calcTime = () => {
      const diff = differenceInSeconds(new Date(endTime), new Date());
      return Math.max(0, diff);
    };

    setTimeLeft(calcTime());
    const interval = setInterval(() => {
      const t = calcTime();
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(interval);
        onEnd?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft < 3600; // less than 1 hour

  if (timeLeft <= 0) return (
    <span className="badge badge-red">Ended</span>
  );

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Timer size={12} style={{ color: isUrgent ? 'var(--accent-red)' : 'var(--accent-orange)' }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: isUrgent ? 'var(--accent-red)' : 'var(--accent-orange)', fontVariantNumeric: 'tabular-nums' }}>
        {days > 0 && `${days}d `}
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
