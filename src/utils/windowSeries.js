export default function windowSeries(data) {
  if (!data?.length) throw new Error('Series is empty');

  // 1 ️⃣  Normalise and sort (oldest → newest)
  const series = [...data]
    .map(d => ({ time: new Date(d.time), price: d.price }))
    .sort((a, b) => a.time - b.time);

  const latest = series.at(-1).time;

  /** Helpers to clone the date and move it back. */
  const backDate = (date, { months = 0, years = 0 }) => {
    const d = new Date(date);              // clone
    if (months) d.setMonth(d.getMonth() - months);
    if (years)  d.setFullYear(d.getFullYear() - years);
    return d;
  };

  const horizons = {
    '1m':  backDate(latest, { months: 1 }),
    '3m':  backDate(latest, { months: 3 }),
    '6m':  backDate(latest, { months: 6 }),
    '1y':  backDate(latest, { years: 1  }),
    '5y':  backDate(latest, { years: 5  }),
    '10y': backDate(latest, { years: 10 }),
  };

  // 2 ️⃣  Build the output object by filtering once per horizon
  return Object.fromEntries(
    Object.entries(horizons).map(([key, cutoff]) => [
      key,
      series.filter(({ time }) => time >= cutoff),
    ]),
  );
}