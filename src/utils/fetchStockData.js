/**
 * Fetch:
 *   1) Historical daily bars for the last 10 years
 *   2) A snapshot (current price, prev close, volume)
 *   3) rsi,macd
 *   4) finanical
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

import './stockTimeSeries.js'
import './fundamentals.js'

export default fetchStockData = async (symbol) => {
  
  const API_KEY = process.env.REACT_APP_POLYGON_API_KEY

  if (!API_KEY) {
    
    throw new Error('Polygon API key not found')
    
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
  const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}` + `?apiKey=${API_KEY}`
  const macdUrl=`https://api.polygon.io/v1/indicators/macd/${symbol}`+`?timespan=day&adjusted=true&short_window=12&long_window=26&signal_window=9&series_type=close&order=asc&limit=5000&` + `apiKey=${API_KEY}`
  const rsiUrl=`https://api.polygon.io/v1/indicators/rsi/${symbol}`+`?timespan=day&adjusted=true&window=14&series_type=close&order=asc&limit=5000&adjusted=true&` + `apiKey=${API_KEY}`
  const financialUrl=`https://api.polygon.io/vX/reference/financials?ticker=${symbol}`+`&order=desc&limit=10&sort=filing_date&` + `apiKey=${API_KEY}`
  const overviewUrl=`https://api.polygon.io/v3/reference/tickers/${symbol}`+`?` + `apiKey=${API_KEY}`
  const SMA10Url=`https://api.polygon.io/v1/indicators/sma/${symbol}`+`?timespan=day&adjusted=true&window=10&series_type=close&order=desc&limit=5000&` +`apiKey=${API_KEY}`
  const SMA50Url=`https://api.polygon.io/v1/indicators/sma/${symbol}`+`?timespan=day&adjusted=true&window=50&series_type=close&order=desc&limit=5000&` +`apiKey=${API_KEY}`
  const SMA200Url=`https://api.polygon.io/v1/indicators/sma/${symbol}`+`?timespan=day&adjusted=true&window=200&series_type=close&order=desc&limit=5000&` +`apiKey=${API_KEY}`

  // 2.2 Fire both requests in parallel
  const [aggRes, snapRes,rsiRes, macdRes,finRes,overviewRes,SMA10Res,SMA50Res, SMA200Res] = await Promise.all([
    fetch(aggUrl),
    fetch(snapshotUrl),
    fetch(rsiUrl),
    fetch(macdUrl),
    fetch(financialUrl),
    fetch(overviewUrl),
    fetch(SMA10Url),
    fetch(SMA50Url),
    fetch(SMA200Url),
  ])

  const aggJson = await aggRes.json()
  const snapJson = await snapRes.json()
  const rsiJson = await rsiRes.json()
  const macdJson = await macdRes.json()
  const finJson = await macdRes.json()
  const ovJson = await macdRes.json()
  const s10Json = await macdRes.json()
  const s50Json = await macdRes.json()
  const s200Json = await macdRes.json()

  let timeSeriesDat = stockTimeSeries(aggJson, rsiJson, macdJson,s10Json,s50Json,s200Json)
  let fundamentals = fundamentals(snapJson,ovJson,finJson)

  // 
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