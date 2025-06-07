export default function stockTimeSeries(aggJson, rsiJson, macdJson,s10Json,s50Json,s200Json){
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
        close: bar.c,
      }
    })
  }

  let volSeries = []
  if (Array.isArray(aggJson.results)) {
    volSeries = aggJson.results.map((bar) => {
      // Polygon returns ts in milliseconds since epoch
      const dateObj = new Date(bar.t)
      const yyyy = dateObj.getFullYear()
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
      const dd = String(dateObj.getDate()).padStart(2, '0')
      return {
        date: `${yyyy}-${mm}-${dd}`,
        close: bar.v,
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

  let s10Series = []
  if (Array.isArray(s10Json.results.values)) {
    s10Series = s10Json.results.values.map((bar) => {
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

  let s50Series = []
  if (Array.isArray(s50Json.results.values)) {
    s50Series = s50Json.results.values.map((bar) => {
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

  let s200Series = []
  if (Array.isArray(s200Json.results.values)) {
    s200Series = s200Json.results.values.map((bar) => {
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

  let priceSeriesWindowed=windowSeries(priceSeries)
  let rsiSeriesWindowed=windowSeries(rsiSeries)
  let macdSeriesWindowed=windowSeries(macdSeries)
  let volSeriesWindowed=windowSeries(volSeries)
  let s10SeriesWindowed=windowSeries(s10Series)
  let s50SeriesWindowed=windowSeries(s50Series)
  let s200SeriesWindowed=windowSeries(s200Series)

  return {
    priceSeriesWindowed: priceSeriesWindowed,
    rsiSeriesWindowed: rsiSeriesWindowed,
    macdSeriesWindowed: macdSeriesWindowed,
    volSeriesWindowed: volSeriesWindowed,
    s10SeriesWindowed: s10SeriesWindowed,
    s50SeriesWindowed: s50SeriesWindowed,
    s200SeriesWindowed: s200SeriesWindowed,
  }
}


