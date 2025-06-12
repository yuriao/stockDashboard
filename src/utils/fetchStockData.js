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

import stockTimeSeries from './stockTimeSeries.js'
import fundamentals from './fundamentals.js'

export default async function fetchStockData (symbol){
  
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
  console.log('here 3')
  // 2.1 Build the URLs
  //    GET https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}?sort=asc&limit=2000&apiKey=...
  const aggUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}` + `?adjusted=true&sort=asc&limit=2000&apiKey=${API_KEY}`
  const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}` + `?apiKey=${API_KEY}`
  const macdUrl=`https://api.polygon.io/v1/indicators/macd/${symbol}`+`?timespan=day&adjusted=true&short_window=12&long_window=26&signal_window=9&series_type=close&order=asc&limit=2000&` + `apiKey=${API_KEY}`
  const rsiUrl=`https://api.polygon.io/v1/indicators/rsi/${symbol}`+`?timespan=day&adjusted=true&window=14&series_type=close&order=asc&limit=2000&adjusted=true&` + `apiKey=${API_KEY}`
  const financialUrl=`https://api.polygon.io/vX/reference/financials?ticker=${symbol}`+`&order=desc&limit=10&sort=filing_date&` + `apiKey=${API_KEY}`
  const overviewUrl=`https://api.polygon.io/v3/reference/tickers/${symbol}`+`?` + `apiKey=${API_KEY}`
  const SMA10Url=`https://api.polygon.io/v1/indicators/sma/${symbol}`+`?timespan=day&adjusted=true&window=10&series_type=close&order=desc&limit=2000&` +`apiKey=${API_KEY}`
  const SMA50Url=`https://api.polygon.io/v1/indicators/sma/${symbol}`+`?timespan=day&adjusted=true&window=50&series_type=close&order=desc&limit=2000&` +`apiKey=${API_KEY}`
  const SMA200Url=`https://api.polygon.io/v1/indicators/sma/${symbol}`+`?timespan=day&adjusted=true&window=200&series_type=close&order=desc&limit=2000&` +`apiKey=${API_KEY}`

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
  console.log('here 4')
  const aggJson = await aggRes.json()
  const snapJson = await snapRes.json()
  const rsiJson = await rsiRes.json()
  const macdJson = await macdRes.json()
  const finJson = await finRes.json()
  const ovJson = await overviewRes.json()
  const s10Json = await SMA10Res.json()
  const s50Json = await SMA50Res.json()
  const s200Json = await SMA200Res.json()

  console.log('here5')
  let timeSeriesDat = stockTimeSeries(aggJson, rsiJson, macdJson,s10Json,s50Json,s200Json)
  let fundamental = fundamentals(snapJson,ovJson,finJson)

  console.log(timeSeriesDat)
  // 
  // 8. (Optional) If you had an endpoint for beta, technicals, fundamentals, peers, news, etc.,
  //    you would fire those here. For now, we’ll leave them null or empty.
  return {
    price: timeSeriesDat.priceSeriesWindowed,
    rsi: timeSeriesDat.rsiSeriesWindowed,
    macd: timeSeriesDat.macdSeriesWindowed,
    vol: timeSeriesDat.volSeriesWindowed,
    sma10: timeSeriesDat.s10SeriesWindowed,
    sma50: timeSeriesDat.s50SeriesWindowed,
    sma200: timeSeriesDat.s200SeriesWindowed,
    marketCap: fundamental.marketCap,
    eps: fundamental.eps,
    pe:fundamental.pe
  }
}