'use client'

import { useState } from 'react'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@inpacta.org.br')
  const [password, setPassword] = useState('admin123')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('Processando...')

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Salvar token no localStorage
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify(data.user))
        
        setMessage('Login realizado! Redirecionando...')
        
        // Aguardar um pouco mais para garantir que o localStorage foi persistido
        setTimeout(() => {
          // Verificar se realmente foi salvo
          const savedToken = localStorage.getItem('adminToken')
          if (savedToken) {
            window.location.href = '/admin'
          } else {
            setMessage('Erro ao salvar sessão. Tente novamente.')
            setLoading(false)
          }
        }, 1500)
      } else {
        setMessage('Erro: ' + (data.message || 'Credenciais inválidas'))
      }
    } catch (error) {
      setMessage('Erro de conexão: ' + error.message)
    } finally {
      setLoading(false)
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
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'PROCESSANDO...' : 'ENTRAR'}
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
      </div>
    </div>
  )
}