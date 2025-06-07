export default function fundamentals(data) {
  // 1. Extract snapshot data:
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

  // 2. Compute dailyChange (%) if both currentPrice & prevClose exist
  let dailyChangePct = null
  if (currentPrice !== null && prevClose !== null && prevClose !== 0) {
    dailyChangePct = ((currentPrice - prevClose) / prevClose * 100).toFixed(2)
  }
}