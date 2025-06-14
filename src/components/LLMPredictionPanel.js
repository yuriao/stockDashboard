import React, { useState } from 'react';
import axios from 'axios';

const LLMPredictionPanel = ({ data }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post('/api/llm-predict', { data });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl shadow-xl border max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">📊 LLM Stock Prediction</h2>
      <button
        onClick={handlePredict}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Predicting...' : 'Get LLM Prediction'}
      </button>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      {response && (
        <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
          <p><strong>📈 Prediction:</strong> {response.prediction}</p>
          <p><strong>🔒 Confidence:</strong> {response.confidence}%</p>
          <p><strong>🧠 Justification:</strong></p>
          <p className="text-gray-700 italic mt-1">{response.justification}</p>
        </div>
      )}
    </div>
  );
};

export default LLMPredictionPanel;