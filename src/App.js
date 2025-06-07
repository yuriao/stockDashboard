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
// Replace the old fetchStockData with calls to Polygon.io’s REST API:
//   • Historical Daily Aggregates for the past 6 months
//   • Snapshot data (current price, previous close, volume, etc.)
// -----------------------------------------------------------------------------

const API_KEY = process.env.REACT_APP_POLYGON_API_KEY

// Utility funciton: generate dates between two given date
function getAllDatesBetween(startDate, endDate) {
  // Parse input strings as Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // If start > end, return empty array (or you could swap them if you prefer)
  if (start > end) {
    return [];
  }

  const dates = [];
  let current = new Date(start);

  while (current <= end) {
    // Format current date as "YYYY-MM-DD"
    const year  = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day   = String(current.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return dates;
}


/**
 * Fetch both:
 *   1) Historical daily bars for the last ~6 months
 *   2) A snapshot (current price, prev close, volume)
 *
 * Returns an object shaped like:
 * {
 *   prices: [{ date, close }, …],
 *   kpis: { currentPrice, dailyChange, volume, beta: null },
 *   indicators: { rsi: null, macd: null },
 *   fundamentals: { pe: null, roe: null, debtEquity: null },
 *   peers: [],         // you could call another endpoint if you have a peer list
 *   news: [],          // you could call Polygon’s /v2/reference/news endpoint
 * }
 */
const fetchStockData = async (symbol) => {
  
  if (!API_KEY) {
    
    throw new Error('Polygon API key not found in REACT_APP_POLYGON_API_KEY')
    
  }
  
  // 1. Compute date range: from ~3 months ago until today
  const now = new Date()
  const monthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 3,
    now.getDate()
  )
  const toDate = now.toISOString().split('T')[0]       // YYYY-MM-DD
  const fromDate = monthsAgo.toISOString().split('T')[0] // YYYY-MM-DD
  
  // 2.1 Build the URLs
  //    GET https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}?sort=asc&limit=5000&apiKey=...
  const aggUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}` + `?adjusted=true&sort=asc&limit=5000&apiKey=${API_KEY}`

  //    GET https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/{ticker}?apiKey=...
  const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}` + `?apiKey=${API_KEY}`

  const macdUrl=`https://api.polygon.io/v1/indicators/macd/${symbol}`+`?timespan=day&adjusted=true&short_window=12&long_window=26&signal_window=9&series_type=close&order=asc&limit=90&` + `apiKey=${API_KEY}`
  const rsiUrl=`https://api.polygon.io/v1/indicators/rsi/${symbol}`+`?timespan=day&adjusted=true&window=14&series_type=close&order=asc&limit=90&adjusted=true&` + `apiKey=${API_KEY}`
  const financialUrl=`https://api.polygon.io/vX/reference/financials?ticker=${symbol}`+`&order=desc&limit=10&sort=filing_date&` + `apiKey=${API_KEY}`
  
  // 2.2 Fire both requests in parallel
  const [aggRes, snapRes] = await Promise.all([
    fetch(aggUrl),
    fetch(snapshotUrl),
  ])
  
  if (!aggRes.ok) {
    throw new Error(`Aggregates request failed: ${aggRes.statusText}`)
  }
  if (!snapRes.ok) {
    throw new Error(`Snapshot request failed: ${snapRes.statusText}`)
  }

  const aggJson = await aggRes.json()
  const snapJson = await snapRes.json()

  // 3. Build the technical factor URL and load data:
  const queryDates=getAllDatesBetween(fromDate, toDate)
 
   const [rsiRes, macdRes] = await Promise.all([
    fetch(rsiUrl),
    fetch(macdUrl),
  ])
  const rsiJson = await rsiRes.json()
  const macdJson = await macdRes.json()
  
  // 5. Parse the aggregates into an array of { date, close }
  let priceSeries = []
  if (Array.isArray(aggJson.results)) {
    priceSeries = aggJson.results.map((bar) => {
      // Polygon returns ts in milliseconds since epoch
      const dateObj = new Date(bar.t)
      const yyyy = dateObj.getFullYear()
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
      const dd = String(dateObj.getDate()).padStart(2, '0')
      return {
        date: `${yyyy}-${mm}-${dd}`,
        close: bar.vw,
      }
    })
  }

  let rsiSeries = []
  if (Array.isArray(rsiJson.results.values)) {
    rsiSeries = rsiJson.results.values.map((bar) => {
      // Polygon returns ts in milliseconds since epoch
      const dateObj = new Date(bar.timestamp)
      const yyyy = dateObj.getFullYear()
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
      const dd = String(dateObj.getDate()).padStart(2, '0')
      return {
        date: `${yyyy}-${mm}-${dd}`,
        close: bar.value,
      }
    })
  }


  let macdSeries = []
  if (Array.isArray(macdJson.results.values)) {
    macdSeries = macdJson.results.values.map((bar) => {
      // Polygon returns ts in milliseconds since epoch
      const dateObj = new Date(bar.timestamp)
      const yyyy = dateObj.getFullYear()
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
      const dd = String(dateObj.getDate()).padStart(2, '0')
      return {
        date: `${yyyy}-${mm}-${dd}`,
        close: bar.histogram,
      }
    })
  }

  console.log(rsiSeries)
  // 6. Extract snapshot data:
  //    • snapJson.ticker.day.c = current day’s close (≈ current price)
  //    • snapJson.ticker.day.o = today’s open
  //    • snapJson.ticker.day.h = today’s high
  //    • snapJson.ticker.day.l = today’s low
  //    • snapJson.ticker.day.v = today’s volume
  //    • snapJson.ticker.prevDay.c = previous market close
  let currentPrice = null
  let prevClose = null
  let volumeToday = null

  if (
    snapJson.ticker &&
    snapJson.ticker.day &&
    typeof snapJson.ticker.day.c === 'number'
  ) {
    currentPrice = snapJson.ticker.day.c
    volumeToday = snapJson.ticker.day.v
  }

  if (
    snapJson.ticker &&
    snapJson.ticker.prevDay &&
    typeof snapJson.ticker.prevDay.c === 'number'
  ) {
    prevClose = snapJson.ticker.prevDay.c
  }

  // 7. Compute dailyChange (%) if both currentPrice & prevClose exist
  let dailyChangePct = null
  if (currentPrice !== null && prevClose !== null && prevClose !== 0) {
    dailyChangePct = ((currentPrice - prevClose) / prevClose * 100).toFixed(2)
  }

  // 8. (Optional) If you had an endpoint for beta, technicals, fundamentals, peers, news, etc.,
  //    you would fire those here. For now, we’ll leave them null or empty.
  return {
    prices: priceSeries,
    kpis: {
      currentPrice: currentPrice !== null ? currentPrice.toFixed(2) : '-',
      dailyChange: dailyChangePct !== null ? dailyChangePct : '-',
      volume: volumeToday !== null ? volumeToday : '-',
    },
    indicators: {
      rsi: rsiSeries,          // To fetch: e.g. GET /v1/indicators/rsi/{ticker}?window=14
      macd: macdSeries,         // To fetch: e.g. GET /v1/indicators/macd/{ticker}?...
    },
    fundamentals: {
      pe: '-',           // Retrieve from a financials endpoint or another service
      roe: '-',          // Retrieve from financial statements if available
      debtEquity: '-',   // Likewise, parse from balance sheet
    },
    peers: [],           // You could call: GET /v3/reference/tickers/{symbol}?filter=market, or maintain your own peer list
    news: [],            // For Polygon news: /v2/reference/news?ticker={symbol}&order=desc&limit=5
  }
}

// -----------------------------------------------------------------------------
// Reusable components (unchanged):
// -----------------------------------------------------------------------------

function KpiCard({ title, value, unit }) {
  return (
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
  )
}

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