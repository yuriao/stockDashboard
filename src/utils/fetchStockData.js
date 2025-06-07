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

  //    GET https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/{ticker}?apiKey=...
  const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}` + `?apiKey=${API_KEY}`

  const macdUrl=`https://api.polygon.io/v1/indicators/macd/${symbol}`+`?timespan=day&adjusted=true&short_window=12&long_window=26&signal_window=9&series_type=close&order=asc&limit=90&` + `apiKey=${API_KEY}`
  const rsiUrl=`https://api.polygon.io/v1/indicators/rsi/${symbol}`+`?timespan=day&adjusted=true&window=14&series_type=close&order=asc&limit=90&adjusted=true&` + `apiKey=${API_KEY}`
  const financialUrl=`https://api.polygon.io/vX/reference/financials?ticker=${symbol}`+`&order=desc&limit=10&sort=filing_date&` + `apiKey=${API_KEY}`
  
  // 2.2 Fire both requests in parallel
  const [aggRes, snapRes,rsiRes, macdRes,finRes] = await Promise.all([
    fetch(aggUrl),
    fetch(snapshotUrl),
    fetch(rsiUrl),
    fetch(macdUrl),
    fetch(financialUrl),
  ])
  
  if (!aggRes.ok) {
    throw new Error(`Aggregates request failed: ${aggRes.statusText}`)
  }
  if (!snapRes.ok) {
    throw new Error(`Snapshot request failed: ${snapRes.statusText}`)
  }
  if (!rsiRes.ok) {
    throw new Error(`Snapshot request failed: ${snapRes.statusText}`)
  }
  if (!macdRes.ok) {
    throw new Error(`Snapshot request failed: ${snapRes.statusText}`)
  }
  if (!finRes.ok) {
    throw new Error(`Snapshot request failed: ${snapRes.statusText}`)
  }

  const aggJson = await aggRes.json()
  const snapJson = await snapRes.json()
  const rsiJson = await rsiRes.json()
  const macdJson = await macdRes.json()
  const finJson = await macdRes.json()

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

  let priceSeriesWindowed=windowSeries(priceSeries)

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