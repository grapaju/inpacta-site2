'use client'

import { useState } from 'react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('Processando...')

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage('Login realizado! Redirecionando...')
        setTimeout(() => {
          window.location.href = '/admin'
        }, 1000)
      } else {
        setMessage('Erro: ' + (data.message || 'Credenciais inválidas'))
      }
    } catch (error) {
      setMessage('Erro de conexão: ' + error.message)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#333',
          fontSize: '28px'
        }}>
          🔐 Admin INPACTA
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              color: '#555',
              fontWeight: 'bold'
            }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@inpacta.mg.gov.br"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              color: '#555',
              fontWeight: 'bold'
            }}>
              Senha:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            ENTRAR
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: message.includes('Erro') ? '#ffebee' : '#e8f5e8',
            border: `1px solid ${message.includes('Erro') ? '#f44336' : '#4caf50'}`,
            borderRadius: '5px',
            textAlign: 'center',
            color: message.includes('Erro') ? '#c62828' : '#2e7d32'
          }}>
            {message}
          </div>
        )}

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          <p>📧 admin@inpacta.mg.gov.br</p>
          <p>🔑 admin123</p>
        </div>
      </div>
    </div>
  )
}