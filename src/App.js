// src/App.js

import React, { useState, useEffect } from 'react'
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
import 'antd/dist/reset.css' // Ant Design reset (v5+)
import './App.css'

// -----------------------------------------------------------------------------
// Reusable components (unchanged):
// -----------------------------------------------------------------------------

function StockChart({ data, title, width, height }) {
  return (
    <Card style={{ marginTop: 1 }}>
      <h3 style={{ marginBottom: 1 }}>{title}</h3>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data.price} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="close" stroke="#1890ff" dot={false} />
        </LineChart>

        <LineChart data={data} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="close" stroke="#1890ff" dot={false} />
        </LineChart>

        <LineChart data={data} margin={{ top: 1, right: 1, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="close" stroke="#1890ff" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <Container>
        <div style={{display: 'grid',gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',gap: 16,}}>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>Current Price</h5>
            <p>{data.kpis.currentPrice || '-'}</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>Daily Change</h5>
            <p>{data.kpis.dailyChange || '-'}%</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>Volume</h5>
            <p>{data.kpis.volume || '-'}</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>P/E Ratio</h5>
            <p>{data.fundamentals.pe || '-'}</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>ROE</h5>
            <p>{data.fundamentals.roe || '-'}%</p>
          </div>
          <div>
            <h5 style={{ color: '#888', marginBottom: 4 }}>Debt/Equity</h5>
            <p>{data.fundamentals.debtEquity || '-'}x</p>
          </div>
        </div>
      </Container>
    </Card>
    
  )
}

// -----------------------------------------------------------------------------
// Main App (mostly unchanged, except we now call our new fetchStockData)
// -----------------------------------------------------------------------------

export default function App() {
  const [symbol, setSymbol] = useState('AAPL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    prices: [],
    kpis: {},
    indicators: {},
    fundamentals: {},
    peers: [],
    news: [],
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await fetchStockData(symbol)
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Symbol selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Ticker Symbol"
          style={{ width: 100 }}
        />
        <Button type="primary" onClick={loadData} loading={loading}>
          Load
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 1,
          marginTop: 1,
        }}
      >
          <div
            style={{
              display: 'flex',
              gap: 1,
              marginTop: 1,
            }}
          >
              <div>
                {/* Fundamentals */}
                <Card style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: 16,
                    }}
                  >
                    <div>
                      <h5 style={{ color: '#888', marginBottom: 4 }}>Current Price</h5>
                      <p>{data.kpis.currentPrice || '-'}</p>
                    </div>
                    <div>
                      <h5 style={{ color: '#888', marginBottom: 4 }}>Daily Change</h5>
                      <p>{data.kpis.dailyChange || '-'}%</p>
                    </div>
                    <div>
                      <h5 style={{ color: '#888', marginBottom: 4 }}>Volume</h5>
                      <p>{data.kpis.volume || '-'}</p>
                    </div>
                    <div>
                      <h5 style={{ color: '#888', marginBottom: 4 }}>P/E Ratio</h5>
                      <p>{data.fundamentals.pe || '-'}</p>
                    </div>
                    <div>
                      <h5 style={{ color: '#888', marginBottom: 4 }}>ROE</h5>
                      <p>{data.fundamentals.roe || '-'}%</p>
                    </div>
                    <div>
                      <h5 style={{ color: '#888', marginBottom: 4 }}>Debt/Equity</h5>
                      <p>{data.fundamentals.debtEquity || '-'}x</p>
                    </div>
                  </div>
                </Card>
            </div>

              {/* Price and Technical Indicators */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: 16,
                  marginTop: 16,
                }}
              >
                <StockChart data={data.prices} title='Price chart'/>
                <StockChart data={data.indicators.rsi} title='RSI(14)'/>
                <StockChart data={data.indicators.macd} title='macd histogram(12,26,9)'/>
              </div>
            </div>

      </div>
      
      

      

      

      {/* News & Sentiment */}
      <Card style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Latest News & Sentiment</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.news.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 12 }}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1890ff', fontWeight: 500 }}
              >
                {item.headline}
              </a>
              <p style={{ color: '#888', fontSize: '0.85rem', margin: 4 }}>
                {item.sentiment}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      {error && (
        <p style={{ color: 'red', marginTop: 16 }}>Error: {error}</p>
      )}
    </div>
  )
}