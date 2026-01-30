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
        setLoading(false)
      }
    } catch (error) {
      setMessage('Erro de conexão: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center" suppressHydrationWarning>
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" className="h-10 w-auto">
            <text x="10" y="40" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="#0A2540">
              InPACTA
            </text>
          </svg>
        </div>

        <h1 className="text-center text-xl font-semibold text-gray-900">
          Entrar no Admin
        </h1>
        <p className="mt-1 text-center text-sm text-gray-600">
          Use suas credenciais para acessar o painel.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="admin@inpacta.org.br"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
              message.includes('Erro')
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}