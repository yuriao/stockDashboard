import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Card, Button } from 'antd';
import React, { useState } from 'react';

export default function StockChart({ data, title }) {
  const [timerange, setTimerange] = useState('oneM');

  if (
    !data ||
    !data.price?.[timerange] ||
    !data.rsi?.[timerange] ||
    !data.macd?.[timerange]
  ) {
    return <Card><p>No data available for the selected time range.</p></Card>;
  }

  const priceData = data.price[timerange];
  const rsiData = data.rsi[timerange];
  const macdData = data.macd[timerange];

  const firstClose = priceData?.[0]?.close;
  const lastClose = priceData?.[priceData.length - 1]?.close;
  const changePct = firstClose && lastClose ? ((lastClose - firstClose) / firstClose * 100).toFixed(2) : '-';

  return (
    <Card style={{ marginTop: 1 }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <Button onClick={() => setTimerange('oneM')}>1m</Button>
        <Button onClick={() => setTimerange('threeM')}>3m</Button>
        <Button onClick={() => setTimerange('sixM')}>6m</Button>
        <Button onClick={() => setTimerange('oneY')}>1y</Button>
        <Button onClick={() => setTimerange('threeY')}>3y</Button>
        <Button onClick={() => setTimerange('fiveY')}>5y</Button>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={priceData} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#1890ff" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={rsiData} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#1890ff" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={macdData} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#1890ff" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <Card style={{ marginTop: 16 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 16,
        }}>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>Change</h5>
            <p>{changePct}%</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>P/E Ratio</h5>
            <p>-</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>EPS</h5>
            <p>-</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>Market Cap</h5>
            <p>-</p>
          </div>
        </div>
      </Card>
    </Card>
  );
}