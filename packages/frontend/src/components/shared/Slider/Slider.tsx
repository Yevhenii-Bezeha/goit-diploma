import React, { useMemo, useEffect } from 'react';
import classes from './Slider.module.css';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showLabels?: boolean;
  className?: string;
  checkpoints?: number[];
};

export const Slider = ({
  value,
  onChange,
  min = -100,
  max = 100,
  step,
  showLabels = false,
  checkpoints = [-100, -67, -33, 0, 33, 67, 100],
  className,
}: SliderProps) => {
  // Function to find nearest checkpoint
  const findNearestCheckpoint = (inputValue: number) => {
    let closest = checkpoints[0];
    let minDiff = Math.abs(inputValue - closest);

    checkpoints.forEach((checkpoint) => {
      const diff = Math.abs(inputValue - checkpoint);
      if (diff < minDiff) {
        minDiff = diff;
        closest = checkpoint;
      }
    });

    return closest;
  };

  // Ensure initial value snaps to checkpoint
  useEffect(() => {
    const nearest = findNearestCheckpoint(value);
    if (nearest !== value) {
      onChange(nearest);
    }
  }, []); // Empty dependency array since we only want this on mount

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(event.target.value);
    const nearest = findNearestCheckpoint(inputValue);
    onChange(nearest);
  };

  const handleCheckpointClick = (checkpointValue: number) => {
    onChange(checkpointValue);
  };

  // Function to get checkpoint symbol and style based on position
  const getCheckpointSymbol = (index: number) => {
    if (index === 3) {
      // Middle position (0)
      return { symbol: '0', fontSize: undefined };
    }
    // Left side: 0, 1, 2; Right side: 4, 5, 6
    let fontSize = '12px';
    if (index === 1 || index === 5) fontSize = '16px';
    if (index === 0 || index === 6) fontSize = '20px';
    return { symbol: '+', fontSize };
  };

  // Calculate checkpoint positions as percentages
  const checkpointPositions = useMemo(() => {
    return checkpoints.map((point) => ({
      value: point,
      position: `${((point - min) / (max - min)) * 100}%`,
    }));
  }, [checkpoints, min, max]);

  return (
    <div className={`${classes.container} ${className || ''}`}>
      {showLabels && (
        <div className={classes.labels}>
          <span>{min}</span>
          <span>{min + (max - min) * 0.25}</span>
          <span>{(min + max) / 2}</span>
          <span>{min + (max - min) * 0.75}</span>
          <span>{max}</span>
        </div>
      )}

      <div className={classes.sliderContainer}>
        <input
          type="range"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={classes.slider}
        />

        <div className={classes.checkpoints}>
          {checkpointPositions.map((point, index) => {
            const { symbol, fontSize } = getCheckpointSymbol(index);
            return (
              <div
                key={index}
                className={classes.checkpoint}
                onClick={() => handleCheckpointClick(point.value)}
                style={{ left: point.position, fontSize: fontSize }}
              >
                {symbol}
              </div>
            );
          })}
        </div>

        <div className={classes.popularLabels}>
          <span className={classes.morePopular}>More Popular</span>
          <span className={classes.lessPopular}>Less Popular</span>
        </div>
      </div>
    </div>
  );
};
