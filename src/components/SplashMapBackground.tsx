/**
 * Artistic SVG representation of the NAC Government District road network.
 * Inspired by the terraink.app minimalist cartographic style.
 * Color palette: cream background, charcoal roads, copper highway accent.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Rect, G } from 'react-native-svg';

const CREAM = '#F3EDE4';
const CHARCOAL = '#3A3A3A';
const LIGHT_GRAY = '#C8C0B4';
const MID_GRAY = '#9E9688';
const COPPER = '#C45C2C';
const COPPER_LIGHT = '#D4784A';

interface Props {
  width: number;
  height: number;
  opacity?: number;
}

export default function SplashMapBackground({ width, height, opacity = 1 }: Props) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width / 400, height / 800);

  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background */}
        <Rect x="0" y="0" width={width} height={height} fill={CREAM} />

        {/* ── Fine grid pattern (building blocks) ── */}
        <G opacity={0.08}>
          {Array.from({ length: 20 }).map((_, i) => (
            <React.Fragment key={`grid-h-${i}`}>
              <Line
                x1={0} y1={cy - 200 * scale + i * 22 * scale}
                x2={width} y2={cy - 200 * scale + i * 22 * scale}
                stroke={CHARCOAL} strokeWidth={0.5}
              />
              <Line
                x1={cx - 200 * scale + i * 22 * scale} y1={cy - 220 * scale}
                x2={cx - 200 * scale + i * 22 * scale} y2={cy + 220 * scale}
                stroke={CHARCOAL} strokeWidth={0.5}
              />
            </React.Fragment>
          ))}
        </G>

        {/* ── Building blocks (abstract rectangles) ── */}
        <G opacity={0.06}>
          {/* Top-left district */}
          <Rect x={cx - 160 * scale} y={cy - 160 * scale} width={60 * scale} height={40 * scale} fill={CHARCOAL} />
          <Rect x={cx - 90 * scale} y={cy - 155 * scale} width={35 * scale} height={50 * scale} fill={CHARCOAL} />
          <Rect x={cx - 155 * scale} y={cy - 110 * scale} width={45 * scale} height={35 * scale} fill={CHARCOAL} />
          {/* Top-right district */}
          <Rect x={cx + 50 * scale} y={cy - 160 * scale} width={55 * scale} height={45 * scale} fill={CHARCOAL} />
          <Rect x={cx + 110 * scale} y={cy - 150 * scale} width={40 * scale} height={35 * scale} fill={CHARCOAL} />
          {/* Center */}
          <Rect x={cx - 30 * scale} y={cy - 80 * scale} width={60 * scale} height={60 * scale} fill={CHARCOAL} />
          {/* Bottom-left */}
          <Rect x={cx - 150 * scale} y={cy + 60 * scale} width={50 * scale} height={55 * scale} fill={CHARCOAL} />
          <Rect x={cx - 85 * scale} y={cy + 70 * scale} width={40 * scale} height={40 * scale} fill={CHARCOAL} />
          {/* Bottom-right */}
          <Rect x={cx + 60 * scale} y={cy + 50 * scale} width={45 * scale} height={50 * scale} fill={CHARCOAL} />
          <Rect x={cx + 115 * scale} y={cy + 65 * scale} width={35 * scale} height={40 * scale} fill={CHARCOAL} />
        </G>

        {/* ── Secondary roads (lighter) ── */}
        <G opacity={0.15}>
          {/* Vertical secondary */}
          <Line x1={cx - 120 * scale} y1={cy - 260 * scale} x2={cx - 120 * scale} y2={cy + 260 * scale} stroke={MID_GRAY} strokeWidth={1.2 * scale} />
          <Line x1={cx + 120 * scale} y1={cy - 260 * scale} x2={cx + 120 * scale} y2={cy + 260 * scale} stroke={MID_GRAY} strokeWidth={1.2 * scale} />
          {/* Horizontal secondary */}
          <Line x1={cx - 220 * scale} y1={cy - 100 * scale} x2={cx + 220 * scale} y2={cy - 100 * scale} stroke={MID_GRAY} strokeWidth={1.2 * scale} />
          <Line x1={cx - 220 * scale} y1={cy + 100 * scale} x2={cx + 220 * scale} y2={cy + 100 * scale} stroke={MID_GRAY} strokeWidth={1.2 * scale} />
          {/* Diagonal connecting roads */}
          <Line x1={cx - 180 * scale} y1={cy - 220 * scale} x2={cx - 120 * scale} y2={cy - 180 * scale} stroke={MID_GRAY} strokeWidth={1 * scale} />
          <Line x1={cx + 180 * scale} y1={cy - 220 * scale} x2={cx + 120 * scale} y2={cy - 180 * scale} stroke={MID_GRAY} strokeWidth={1 * scale} />
          <Line x1={cx - 180 * scale} y1={cy + 220 * scale} x2={cx - 120 * scale} y2={cy + 180 * scale} stroke={MID_GRAY} strokeWidth={1 * scale} />
          <Line x1={cx + 180 * scale} y1={cy + 220 * scale} x2={cx + 120 * scale} y2={cy + 180 * scale} stroke={MID_GRAY} strokeWidth={1 * scale} />
        </G>

        {/* ── Main arterial roads (darker, thicker) ── */}
        <G opacity={0.25}>
          {/* Central vertical axis */}
          <Line x1={cx} y1={0} x2={cx} y2={height} stroke={CHARCOAL} strokeWidth={2.5 * scale} />
          {/* Central horizontal axis */}
          <Line x1={0} y1={cy} x2={width} y2={cy} stroke={CHARCOAL} strokeWidth={2.5 * scale} />
          {/* Outer ring road - top */}
          <Path
            d={`M ${cx - 200 * scale} ${cy - 200 * scale} Q ${cx} ${cy - 260 * scale} ${cx + 200 * scale} ${cy - 200 * scale}`}
            stroke={CHARCOAL} strokeWidth={2 * scale} fill="none"
          />
          {/* Outer ring road - bottom */}
          <Path
            d={`M ${cx - 200 * scale} ${cy + 200 * scale} Q ${cx} ${cy + 260 * scale} ${cx + 200 * scale} ${cy + 200 * scale}`}
            stroke={CHARCOAL} strokeWidth={2 * scale} fill="none"
          />
          {/* Outer ring road - left */}
          <Path
            d={`M ${cx - 200 * scale} ${cy - 200 * scale} Q ${cx - 260 * scale} ${cy} ${cx - 200 * scale} ${cy + 200 * scale}`}
            stroke={CHARCOAL} strokeWidth={2 * scale} fill="none"
          />
          {/* Outer ring road - right */}
          <Path
            d={`M ${cx + 200 * scale} ${cy - 200 * scale} Q ${cx + 260 * scale} ${cy} ${cx + 200 * scale} ${cy + 200 * scale}`}
            stroke={CHARCOAL} strokeWidth={2 * scale} fill="none"
          />
        </G>

        {/* ── Copper highway (top-left diagonal - the iconic accent) ── */}
        <G opacity={0.5}>
          <Path
            d={`M 0 ${cy - 320 * scale} Q ${cx * 0.3} ${cy - 280 * scale} ${cx - 200 * scale} ${cy - 200 * scale}`}
            stroke={COPPER} strokeWidth={3 * scale} fill="none" strokeLinecap="round"
          />
          <Path
            d={`M 0 ${cy - 310 * scale} Q ${cx * 0.3} ${cy - 270 * scale} ${cx - 195 * scale} ${cy - 195 * scale}`}
            stroke={COPPER_LIGHT} strokeWidth={1.5 * scale} fill="none" strokeLinecap="round" opacity={0.6}
          />
        </G>

        {/* ── Interchange circles (roundabouts) ── */}
        <G opacity={0.2}>
          {/* Corner interchanges */}
          <Circle cx={cx - 200 * scale} cy={cy - 200 * scale} r={8 * scale} stroke={CHARCOAL} strokeWidth={2 * scale} fill="none" />
          <Circle cx={cx + 200 * scale} cy={cy - 200 * scale} r={8 * scale} stroke={CHARCOAL} strokeWidth={2 * scale} fill="none" />
          <Circle cx={cx - 200 * scale} cy={cy + 200 * scale} r={8 * scale} stroke={CHARCOAL} strokeWidth={2 * scale} fill="none" />
          <Circle cx={cx + 200 * scale} cy={cy + 200 * scale} r={8 * scale} stroke={CHARCOAL} strokeWidth={2 * scale} fill="none" />
          {/* Mid-axis interchanges */}
          <Circle cx={cx} cy={cy - 200 * scale} r={6 * scale} stroke={CHARCOAL} strokeWidth={1.8 * scale} fill="none" />
          <Circle cx={cx} cy={cy + 200 * scale} r={6 * scale} stroke={CHARCOAL} strokeWidth={1.8 * scale} fill="none" />
          <Circle cx={cx - 200 * scale} cy={cy} r={6 * scale} stroke={CHARCOAL} strokeWidth={1.8 * scale} fill="none" />
          <Circle cx={cx + 200 * scale} cy={cy} r={6 * scale} stroke={CHARCOAL} strokeWidth={1.8 * scale} fill="none" />
          {/* Center roundabout */}
          <Circle cx={cx} cy={cy} r={10 * scale} stroke={CHARCOAL} strokeWidth={2 * scale} fill="none" />
        </G>

        {/* ── Extending roads to edges ── */}
        <G opacity={0.12}>
          <Line x1={cx + 200 * scale} y1={cy - 200 * scale} x2={width + 20} y2={cy - 320 * scale} stroke={CHARCOAL} strokeWidth={2 * scale} />
          <Line x1={cx + 200 * scale} y1={cy + 200 * scale} x2={width + 20} y2={cy + 320 * scale} stroke={CHARCOAL} strokeWidth={2 * scale} />
          <Line x1={cx - 200 * scale} y1={cy + 200 * scale} x2={0} y2={cy + 350 * scale} stroke={CHARCOAL} strokeWidth={1.5 * scale} />
          <Line x1={cx + 200 * scale} y1={cy} x2={width + 10} y2={cy + 30 * scale} stroke={CHARCOAL} strokeWidth={1.5 * scale} />
          <Line x1={cx - 200 * scale} y1={cy} x2={-10} y2={cy - 30 * scale} stroke={CHARCOAL} strokeWidth={1.5 * scale} />
        </G>
      </Svg>
    </View>
  );
}
