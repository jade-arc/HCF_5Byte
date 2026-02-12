
import React from 'react';

interface PieChartProps {
  data: { value: number; color: string }[];
  size?: number;
  holeSize?: number; // 0 to 1
}

export const PieChart: React.FC<PieChartProps> = ({ data, size = 100, holeSize = 0 }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) return null;

  let cumulative = 0;

  const getCoordinatesForPercent = (percent: number, radius: number = 1) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
  };

  return (
    <svg height={size} width={size} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
      {data.map((slice, i) => {
        if (slice.value <= 0) return null;

        const [startX, startY] = getCoordinatesForPercent(cumulative / total);
        const [innerStartX, innerStartY] = getCoordinatesForPercent(cumulative / total, holeSize);
        cumulative += slice.value;
        const [endX, endY] = getCoordinatesForPercent(cumulative / total);
        const [innerEndX, innerEndY] = getCoordinatesForPercent(cumulative / total, holeSize);
        const largeArcFlag = slice.value / total > 0.5 ? 1 : 0;

        const pathData = holeSize > 0
          ? [
              `M ${startX} ${startY}`, // Move to outer start
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Outer arc
              `L ${innerEndX} ${innerEndY}`, // Line to inner end
              `A ${holeSize} ${holeSize} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`, // Inner arc (reverse)
              `Z`, // Close path
            ].join(' ')
          : [
              `M ${startX} ${startY}`, // Move
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
              `L 0 0`, // Line to center
            ].join(' ');

        return <path key={i} d={pathData} fill={slice.color} />;
      })}
    </svg>
  );
};
