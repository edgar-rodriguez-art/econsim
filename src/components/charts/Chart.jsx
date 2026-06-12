import React, { useMemo } from 'react';
import {
  ComposedChart, Line, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ReferenceDot,
  ResponsiveContainer,
} from 'recharts';
import { fmt } from '../../lib/format';

/*
  Props (same API as the prototype SVG Chart):
    height, series, xDomain, yDomain, xLabel, yLabel,
    formatX, formatY, xTicks, yTicks, refLines, regions, markers, gridX
  series item: { type:'line'|'area'|'bar', data:[[x,y],...], color, dash, width, fill, opacity, dotR, name }
*/
export default function Chart({
  height = 360,
  series = [],
  xDomain,
  yDomain,
  xLabel,
  yLabel,
  formatX = (v) => fmt.compact(v),
  formatY = (v) => fmt.compact(v),
  xTicks = 6,
  yTicks = 5,
  refLines = [],
  regions = [],
  markers = [],
  gridX = true,
}) {
  // Compute axis domains from all series data + regions
  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const allX = [], allY = [];
    series.forEach(s => s.data?.forEach(([x, y]) => { allX.push(x); allY.push(y); }));
    regions.forEach(r => {
      if (r.x0 != null) { allX.push(r.x0, r.x1); }
      if (r.y0 != null) { allY.push(r.y0, r.y1); }
    });
    return {
      xMin: xDomain ? xDomain[0] : (allX.length ? Math.min(0, ...allX) : 0),
      xMax: xDomain ? xDomain[1] : (allX.length ? Math.max(...allX) : 1),
      yMin: yDomain ? yDomain[0] : (allY.length ? Math.min(0, ...allY) : 0),
      yMax: yDomain ? yDomain[1] : (allY.length ? Math.max(...allY) * 1.05 : 1),
    };
  }, [series, regions, xDomain, yDomain]);

  // Per-series converted data: [[x,y]] → [{x, y}]
  const seriesData = useMemo(() =>
    series.map(s => (s.data || []).map(([x, y]) => ({ x, y }))),
    [series]
  );

  const hasBars = series.some(s => s.type === 'bar');
  const barCount = series.find(s => s.type === 'bar')?.data?.length || 4;

  const tickStyle = { fontSize: 10.5, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' };
  const labelStyle = { fontSize: 11, fontFamily: 'var(--font-sans)', fill: 'var(--ink-soft)', fontWeight: 600 };

  const tooltipStyle = {
    background: 'var(--ink)',
    border: 'none',
    borderRadius: 8,
    fontSize: 11.5,
    color: 'var(--surface)',
    padding: '8px 10px',
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={[]}
        margin={{ top: 14, right: 22, bottom: xLabel ? 44 : 28, left: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--grid)"
          vertical={gridX}
          horizontal
        />
        <XAxis
          dataKey="x"
          type="number"
          domain={[xMin, xMax]}
          tickFormatter={formatX}
          tickCount={xTicks}
          tick={tickStyle}
          axisLine={{ stroke: 'var(--ink-mute)', opacity: 0.5 }}
          tickLine={false}
          label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, style: labelStyle } : undefined}
        />
        <YAxis
          type="number"
          domain={[yMin, yMax]}
          tickFormatter={formatY}
          tickCount={yTicks}
          width={60}
          tick={tickStyle}
          axisLine={{ stroke: 'var(--ink-mute)', opacity: 0.5 }}
          tickLine={false}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', offset: 14, style: labelStyle } : undefined}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={formatX}
          formatter={(value) => [formatY(value)]}
          labelStyle={{ color: 'var(--surface)', opacity: 0.75, marginBottom: 2 }}
          itemStyle={{ color: 'var(--surface)' }}
          cursor={{ stroke: 'var(--ink-soft)', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.5 }}
        />

        {/* Shaded regions */}
        {regions.map((r, i) => (
          <ReferenceArea
            key={`ra${i}`}
            x1={r.x0 ?? xMin} x2={r.x1 ?? xMax}
            y1={r.y0 ?? yMin} y2={r.y1 ?? yMax}
            fill={r.color}
            fillOpacity={r.opacity ?? 0.12}
          />
        ))}

        {/* Series */}
        {series.map((s, i) => {
          const sd = seriesData[i];
          const sharedProps = { data: sd, dataKey: 'y', isAnimationActive: false };

          if (s.type === 'area') return (
            <Area key={i} {...sharedProps}
              stroke={s.color}
              fill={s.fill || s.color}
              fillOpacity={s.opacity ?? 0.14}
              strokeWidth={s.width ?? 2}
              strokeDasharray={s.dash}
              dot={false}
              connectNulls
            />
          );

          if (s.type === 'bar') return (
            <Bar key={i} {...sharedProps}
              fill={s.color}
              opacity={s.opacity ?? 0.9}
              barSize={Math.max(18, Math.min(72, 280 / barCount))}
              radius={[3, 3, 0, 0]}
            />
          );

          return (
            <Line key={i} {...sharedProps}
              stroke={s.color}
              strokeWidth={s.width ?? 2.2}
              strokeDasharray={s.dash}
              dot={s.dotR ? { r: s.dotR, fill: s.color, strokeWidth: 0 } : false}
              opacity={s.opacity ?? 1}
              connectNulls
            />
          );
        })}

        {/* Reference lines */}
        {refLines.map((r, i) => (
          r.x != null ? (
            <ReferenceLine
              key={`rx${i}`}
              x={r.x}
              stroke={r.color || 'var(--ink-mute)'}
              strokeDasharray={r.dash || '5 4'}
              strokeWidth={1.4}
              label={r.label ? { value: r.label, position: 'insideTopRight', fontSize: 10, fontWeight: 600, fill: r.color || 'var(--ink-mute)', fontFamily: 'var(--font-mono)' } : undefined}
            />
          ) : (
            <ReferenceLine
              key={`ry${i}`}
              y={r.y}
              stroke={r.color || 'var(--ink-mute)'}
              strokeDasharray={r.dash || '5 4'}
              strokeWidth={1.4}
              label={r.label ? { value: r.label, position: 'insideRight', fontSize: 10, fontWeight: 600, fill: r.color || 'var(--ink-mute)', fontFamily: 'var(--font-mono)' } : undefined}
            />
          )
        ))}

        {/* Markers as reference dots */}
        {markers.map((m, i) => (
          <React.Fragment key={`m${i}`}>
            {m.ring && (
              <ReferenceDot
                x={m.x} y={m.y}
                r={(m.r ?? 5) + 5}
                fill={m.color}
                fillOpacity={0.16}
                stroke="none"
              />
            )}
            <ReferenceDot
              x={m.x} y={m.y}
              r={m.r ?? 5}
              fill={m.color}
              stroke="var(--surface)"
              strokeWidth={2}
              label={m.label ? { value: m.label, position: 'top', fontSize: 10.5, fontWeight: 700, fill: m.color, fontFamily: 'var(--font-mono)' } : undefined}
            />
          </React.Fragment>
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
