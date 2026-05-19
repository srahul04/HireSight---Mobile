import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

// TODO: Phase 2 — Full radar chart implementation
// This component will visualize interview/candidate scores across dimensions:
// Technical Accuracy, Communication, Problem Solving, Cultural Fit, Leadership

interface RadarChartProps {
  /** Array of dimension objects with label and score (0-100) */
  dimensions: { label: string; score: number }[];
  /** Size of the chart in pixels */
  size?: number;
  /** Color for the data polygon fill */
  fillColor?: string;
  /** Color for the data polygon stroke */
  strokeColor?: string;
}

export default function RadarChart({ 
  dimensions, 
  size = 200, 
  fillColor = 'rgba(59, 130, 246, 0.2)',
  strokeColor = '#3B82F6' 
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 30;
  const angleSlice = (Math.PI * 2) / dimensions.length;

  // Calculate points for the data polygon
  const dataPoints = dimensions.map((dim, i) => {
    const r = (dim.score / 100) * radius;
    const x = center + r * Math.cos(angleSlice * i - Math.PI / 2);
    const y = center + r * Math.sin(angleSlice * i - Math.PI / 2);
    return `${x},${y}`;
  }).join(' ');

  // Calculate label positions
  const labels = dimensions.map((dim, i) => {
    const labelRadius = radius + 20;
    const x = center + labelRadius * Math.cos(angleSlice * i - Math.PI / 2);
    const y = center + labelRadius * Math.sin(angleSlice * i - Math.PI / 2);
    return { ...dim, x, y };
  });

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        {/* Grid circles */}
        {levels.map((level, i) => {
          const gridPoints = dimensions.map((_, j) => {
            const r = level * radius;
            const x = center + r * Math.cos(angleSlice * j - Math.PI / 2);
            const y = center + r * Math.sin(angleSlice * j - Math.PI / 2);
            return `${x},${y}`;
          }).join(' ');
          return (
            <Polygon
              key={i}
              points={gridPoints}
              fill="none"
              stroke="#334155"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const x = center + radius * Math.cos(angleSlice * i - Math.PI / 2);
          const y = center + radius * Math.sin(angleSlice * i - Math.PI / 2);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPoints}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
        />

        {/* Data points */}
        {dimensions.map((dim, i) => {
          const r = (dim.score / 100) * radius;
          const x = center + r * Math.cos(angleSlice * i - Math.PI / 2);
          const y = center + r * Math.sin(angleSlice * i - Math.PI / 2);
          return (
            <Circle key={i} cx={x} cy={y} r={3} fill={strokeColor} />
          );
        })}

        {/* Labels */}
        {labels.map((label, i) => (
          <SvgText
            key={i}
            x={label.x}
            y={label.y}
            fill="#94A3B8"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {label.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

// Example usage:
// <RadarChart dimensions={[
//   { label: 'Technical', score: 85 },
//   { label: 'Communication', score: 70 },
//   { label: 'Problem Solving', score: 90 },
//   { label: 'Cultural Fit', score: 75 },
//   { label: 'Leadership', score: 60 },
// ]} />
