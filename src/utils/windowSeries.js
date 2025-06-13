export default function windowSeries(data) {
  if (!data?.length) throw new Error('Series is empty');

  // 1 ️⃣  Normalise and sort (oldest → newest)
  const series = [...data]
    .map(d => ({ time: new Date(d.time), value: d.value }))
    .sort((a, b) => a.time - b.time);

  const latest = series.at(-1).time;

  /** Helpers to clone the date and move it back. */
  const backDate = (date, { months = 0, years = 0 }) => {
    const d = new Date(date);              // clone
    if (months) d.setMonth(d.getMonth() - months);
    if (years)  d.setFullYear(d.getFullYear() - years);
    return d;
  };

  //console.log(series)
  const output = {
    oneM:  series.filter(({ time }) => time >= backDate(latest,{months:1})),
    threeM:  series.filter(({ time }) => time >= backDate(latest,{months:3})),
    sixM:  series.filter(({ time }) => time >= backDate(latest,{months:6})),
    oneY:  series.filter(({ time }) => time >= backDate(latest,{years:1})),
    threeY:  series.filter(({ time }) => time >= backDate(latest,{years:3})),
    fiveY: series.filter(({ time }) => time >= backDate(latest,{years:5})),
  };

  return output
}