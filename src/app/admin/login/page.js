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
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_10px_30px_rgba(15,23,42,0.12)] p-6 sm:p-8">
        <div className="flex items-center justify-center mb-6">
          <img
            src="/logo-clara.svg?v=20251110"
            alt="INPACTA"
            className="h-10 w-auto"
          />
        </div>

        <h1 className="text-center text-xl font-semibold text-[var(--foreground)]">
          Entrar no Admin
        </h1>
        <p className="mt-1 text-center text-sm text-[var(--muted-text)]">
          Use suas credenciais para acessar o painel.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
              placeholder="admin@inpacta.org.br"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full admin-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
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