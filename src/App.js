// src/App.js

import React, { useState, useEffect } from 'react'
import { Button, Input } from 'antd'
import 'antd/dist/reset.css' // Ant Design reset (v5+)
import './App.css'
import fetchStockData from './utils/fetchStockData.js'
import StockChart from './components/StockChart.js'
import LLMPredictionPanel from './components/LLMPredictionPanel.js'
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
    <div style={{ 
      padding: 24, 
      background: '#f0f2f5', 
      minHeight: '100vh',
      display: 'flex',
      gap: 16
    }}>
      <div style={{ flex: 2 }}>
        <div style={{ gap: 8, marginBottom: 16 }}>
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Ticker Symbol"
        />
        <Button type="primary" onClick={loadData} loading={loading}>
          Load
        </Button>
      </div>

        <div>
          {data && !loading && <StockChart data={data} title={symbol}/>
          }
        </div>
      </div>

      <div style={{ 
        flex: 1,
        background: '#fff',
        padding: 16,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Stock Information</h3>
        {data && !loading && (
          <div>
            <p><strong>Current Price:</strong> tbd</p>
            <p><strong>Change:</strong> tbd</p>
            <p><strong>Volume:</strong> tbd</p>
          </div>
        )}
      </div>
    </div>  
  )
}