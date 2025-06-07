// -----------------------------------------------------------------------------
// Reusable components (unchanged):
// -----------------------------------------------------------------------------

export default function StockChart({ data, title, width, height }) {
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