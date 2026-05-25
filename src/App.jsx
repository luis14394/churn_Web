import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [formData, setFormData] = useState({
    tenure: 12,
    monthly_charges: 85.5,
    support_calls: 2,
    contract_type: 'month-to-month',
    internet_service: 'Fiber',
    payment_method: 'credit_card'
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [allModels, setAllModels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await axios.get(`${API_URL}/metrics`);
      setMetrics(res.data.metricas);
      const modelsList = Object.entries(res.data.todos_los_modelos).map(([name, data]) => ({
        name,
        ...data
      }));
      setAllModels(modelsList);
    } catch (err) {
      console.error('Error cargando métricas:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tenure' || name === 'support_calls' ? parseInt(value) : 
              name === 'monthly_charges' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const res = await axios.post(`${API_URL}/predict`, formData);
      setPrediction(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al predecir');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riesgo) => {
    if (riesgo === 'ALTO') return '#FF6B6B';
    if (riesgo === 'MEDIO') return '#FFD93D';
    return '#6BCB77';
  };

  const chartData = metrics ? [
    { name: 'Accuracy', value: metrics.accuracy * 100 },
    { name: 'Precision', value: metrics.precision * 100 },
    { name: 'Recall', value: metrics.recall * 100 },
    { name: 'F1-Score', value: metrics.f1_score * 100 },
    { name: 'ROC-AUC', value: metrics.roc_auc * 100 }
  ] : [];

  // Página de inicio
  if (currentPage === 'home') {
    return (
      <div className="app">
        <div className="home-container">
          <div className="hero-section">
            <div className="hero-badge">🤖 Machine Learning</div>
            <h1 className="hero-title">
              Churn <span className="gradient-text">Predictor</span>
            </h1>
            <p className="hero-subtitle">
              Predicción de abandono de clientes con inteligencia artificial
            </p>
            <button className="cta-button" onClick={() => setCurrentPage('predict')}>
              🚀 Comenzar a Predecir
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>95% de Precisión</h3>
              <p>Modelo entrenado con datos reales de telecomunicaciones</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Predicciones en Tiempo Real</h3>
              <p>Resultados instantáneos al ingresar los datos del cliente</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>5 Algoritmos Comparados</h3>
              <p>Logistic Regression, Random Forest, SVM, y más</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Open Source</h3>
              <p>Código 100% abierto y transparente</p>
            </div>
          </div>

          <div className="info-section">
            <div className="info-card">
              <h2>📖 ¿Qué es Churn?</h2>
              <p>El <strong>churn</strong> (abandono de clientes) es una métrica crítica en telecomunicaciones. Este predictor utiliza algoritmos de Machine Learning para identificar clientes en riesgo de cancelar su servicio.</p>
              <br/>
              <h3>🎯 Beneficios:</h3>
              <ul>
                <li>✅ Identificación temprana de clientes en riesgo</li>
                <li>✅ Reducción de pérdida de ingresos</li>
                <li>✅ Estrategias de retención personalizadas</li>
                <li>✅ Mejora de la experiencia del cliente</li>
              </ul>
            </div>
            <div className="info-card">
              <h2>🧠 Cómo funciona</h2>
              <p>El modelo analiza 6 variables clave del cliente para predecir la probabilidad de abandono:</p>
              <ul>
                <li>📅 <strong>Antigüedad</strong> - Meses como cliente</li>
                <li>💰 <strong>Gasto mensual</strong> - Cargo en USD</li>
                <li>📞 <strong>Soporte</strong> - Llamadas al servicio técnico</li>
                <li>📄 <strong>Tipo de contrato</strong> - Mensual, Anual, Bianual</li>
                <li>🌐 <strong>Servicio de internet</strong> - Fibra, DSL, Sin internet</li>
                <li>💳 <strong>Método de pago</strong> - Tarjeta, Transferencia, Efectivo</li>
              </ul>
              <div className="model-badge">
                🏆 Mejor modelo: <strong>Logistic Regression</strong> (F1-Score: 72.2%)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Página de predicción
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => setCurrentPage('home')}>
            ⚡ Churn Predictor
          </div>
          <button className="nav-button" onClick={() => setCurrentPage('home')}>
            🏠 Inicio
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <h2>📝 Datos del Cliente</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>📅 Meses como cliente (tenure)</label>
              <input type="number" name="tenure" value={formData.tenure} onChange={handleInputChange} min="0" max="120" required />
            </div>

            <div className="form-group">
              <label>💰 Cargo mensual (USD)</label>
              <input type="number" name="monthly_charges" value={formData.monthly_charges} onChange={handleInputChange} step="0.01" min="0" required />
            </div>

            <div className="form-group">
              <label>📞 Llamadas a soporte</label>
              <input type="number" name="support_calls" value={formData.support_calls} onChange={handleInputChange} min="0" required />
            </div>

            <div className="form-group">
              <label>📄 Tipo de contrato</label>
              <select name="contract_type" value={formData.contract_type} onChange={handleInputChange}>
                <option value="month-to-month">📆 Mensual</option>
                <option value="one_year">📅 Anual</option>
                <option value="two_year">📅 Bianual</option>
              </select>
            </div>

            <div className="form-group">
              <label>🌐 Servicio de internet</label>
              <select name="internet_service" value={formData.internet_service} onChange={handleInputChange}>
                <option value="Fiber">⚡ Fibra óptica</option>
                <option value="DSL">📡 DSL</option>
                <option value="None">❌ Sin internet</option>
              </select>
            </div>

            <div className="form-group">
              <label>💳 Método de pago</label>
              <select name="payment_method" value={formData.payment_method} onChange={handleInputChange}>
                <option value="credit_card">💳 Tarjeta de crédito</option>
                <option value="bank_transfer">🏦 Transferencia bancaria</option>
                <option value="cash">💵 Efectivo</option>
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? '🔮 Analizando...' : '🔮 Predecir Churn'}
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          {prediction && (
            <div className="result" style={{ borderTopColor: getRiskColor(prediction.riesgo) }}>
              <div className="result-header">
                <span className="result-label">{prediction.churn_label}</span>
                <span className={`risk-badge ${prediction.riesgo}`}>{prediction.riesgo}</span>
              </div>
              <div className="probability-bar">
                <div className="probability-fill" style={{ width: `${prediction.probabilidad * 100}%`, background: getRiskColor(prediction.riesgo) }}></div>
              </div>
              <div className="probability-text">{Math.round(prediction.probabilidad * 100)}% de probabilidad</div>
              <div className="recommendation">💡 {prediction.recomendacion}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h2>📊 Rendimiento del Modelo</h2>
          {metrics && (
            <>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-value">{(metrics.accuracy * 100).toFixed(1)}%</div>
                  <div className="metric-label">🎯 Accuracy</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{(metrics.precision * 100).toFixed(1)}%</div>
                  <div className="metric-label">📌 Precision</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{(metrics.recall * 100).toFixed(1)}%</div>
                  <div className="metric-label">🔍 Recall</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{(metrics.f1_score * 100).toFixed(1)}%</div>
                  <div className="metric-label">⭐ F1-Score</div>
                </div>
              </div>

              <div className="chart-container">
                <h3>📈 Comparativa de métricas</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ background: '#1A1A2E', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#00D4FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="models-table">
                <h3>🤖 Comparación de algoritmos</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Modelo</th>
                      <th>Accuracy</th>
                      <th>F1-Score</th>
                      <th>ROC-AUC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allModels.map((model, idx) => (
                      <tr key={idx} className={model.name === 'Logistic Regression' ? 'best-model' : ''}>
                        <td>{model.name === 'Logistic Regression' ? '🏆 ' : ''}{model.name}</td>
                        <td>{(model.accuracy * 100).toFixed(1)}%</td>
                        <td>{(model.f1_score * 100).toFixed(1)}%</td>
                        <td>{(model.roc_auc * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;