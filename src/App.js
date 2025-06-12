// src/App.js

import React, { useState, useEffect } from 'react'
import { Button, Input } from 'antd'
import 'antd/dist/reset.css' // Ant Design reset (v5+)
import './App.css'
import fetchStockData from './utils/fetchStockData.js'
import StockChart from './components/StockChart.js'

// -----------------------------------------------------------------------------
// Main App (mostly unchanged, except we now call our new fetchStockData)
// -----------------------------------------------------------------------------

export default function App() {
  const [symbol, setSymbol] = useState('AAPL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const json = await fetchStockData(symbol)
      console.log(json)
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

      <div style={{display: 'flex',gap: 1,marginTop: 1}}>
          {data && !loading && <StockChart data={data} title={symbol} width={300} height={100} />}
      </div>
    </div>  
  )
}