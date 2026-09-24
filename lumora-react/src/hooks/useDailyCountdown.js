import { useState, useEffect } from 'react';
import { getDailyCalendarContext } from '../utils/dailyPricing';

/**
 * React hook that tracks the 24-hour cycle and updates the countdown every second.
 * When the 24-hour cycle completes (at midnight), it triggers a date rollover.
 */
export function useDailyCountdown() {
  const [calendarContext, setCalendarContext] = useState(getDailyCalendarContext);

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = getDailyCalendarContext();
      setCalendarContext(updated);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return calendarContext;
}
