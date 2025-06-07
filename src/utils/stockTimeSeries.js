export default function stockTimeSeries(aggJson, rsiJson, macdJson,){
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

  let priceSeriesWindowed=windowSeries(priceSeries)
  let rsiSeriesWindowed=windowSeries(rsiSeries)
  let macdSeriesWindowed=windowSeries(macdSeries)

  return {
    priceSeriesWindowed: priceSeriesWindowed,
    rsiSeriesWindowed: rsiSeriesWindowed,
    macdSeriesWindowed: macdSeriesWindowed
  }
}


