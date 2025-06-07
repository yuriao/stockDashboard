export default function fundamentals(snapJson,ovJson,finJson) {
  
  let marketCap = null
  let eps = null
  let pe = null
  let currentPrice = snapJson.ticker.day.c

  marketCap=ovJson.market_cap
  eps=finJson.results[0].income_statement.basic_earnings_per_share
  pe=currentPrice.eps

  return {
    marketCap:marketCap,
    eps:eps,
    pe:pe
  }

}