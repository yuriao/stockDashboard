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
import fetchStockData from './utils/fetchStockData.js'

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
      console.log('here 1')
      const json = await fetchStockData(symbol)
      console.log('here 2')
      setData(json)
    } catch (err) {
      setError(err.message)
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      
      {/*<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

      </div>*/}
    </div>  
  )
}