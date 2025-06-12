// -----------------------------------------------------------------------------
// Reusable components (unchanged):
// -----------------------------------------------------------------------------
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Card, Button, Input, Table } from 'antd'
import React, { useState, useEffect } from 'react'

export default function StockChart({ data, title, width, height }) {

  const [timerange,setTimerange]=useState('oneM')
  console.log(data.price[timerange])
  return (

    <Card style={{ marginTop: 1 }}>
      <h3 style={{ marginBottom: 1 }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'left', flexDirection: 'row', gap: 8 }}>
        <Button onClick={() => setTimerange('oneM')}> {/*//() => : when button is clicked*/}
            1m
        </Button>
        <Button onClick={() => setTimerange('threeM')}>
            3m
        </Button>
        <Button onClick={() => setTimerange('sixM')}>
            6m
        </Button>
        <Button onClick={() => setTimerange('oneY')}>
            1y
        </Button>
        <Button onClick={() => setTimerange('threeY')}>
            3y
        </Button>
        <Button onClick={() => setTimerange('fiveY')}>
            5y
        </Button>
      </div>

        <LineChart data={data.price[timerange]} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={['dataMin', 'dataMax']} />
            <Tooltip />
            <Line type="monotone" dataKey="close" stroke="#1890ff" dot={false} />
        </LineChart>

        <LineChart data={data.rsi[timerange]} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={['dataMin', 'dataMax']} />
            <Tooltip />
            <Line type="monotone" dataKey="close" stroke="#1890ff" dot={false} />
        </LineChart>

        <LineChart data={data.macd[timerange]} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={['dataMin', 'dataMax']} />
            <Tooltip />
            <Line type="monotone" dataKey="close" stroke="#1890ff" dot={false} />
        </LineChart>

      <Card>
        <div style={{display: 'grid',gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',gap: 16,}}>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>Change</h5>
            <p>{(data.price[timerange][-1]-data.price[timerange][0])/data.price[timerange][0] || '-'}%</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>P/E Ratio</h5>
            <p>{'-'}</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>EPS</h5>
            <p>{'-'}%</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>marketCap</h5>
            <p>{'-'}x</p>
          </div>
        </div>
      </Card>
    </Card>
    
  )
}