"use client"

import React from "react"
import Link from "next/link"

export default function ContactForm() {
  const [status, setStatus] = React.useState({ loading: false, message: '', type: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      nome: form.nome.value,
      email: form.email.value,
      organizacao: form.organizacao.value,
      assunto: form.assunto.value,
      mensagem: form.mensagem.value,
      website: form.website?.value || ''
    }
    try {
      setStatus({ loading: true, message: '', type: '' })
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (res.ok && json?.ok) {
        setStatus({ loading: false, message: 'Mensagem enviada com sucesso!', type: 'success' })
        form.reset()
      } else {
        setStatus({ loading: false, message: json?.error || 'Não foi possível enviar. Tente novamente.', type: 'error' })
      }
    } catch (err) {
      setStatus({ loading: false, message: 'Erro ao enviar. Verifique sua conexão.', type: 'error' })
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--primary)] mb-2">Nome *</label>
          <input type="text" name="nome" required className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] ring-focus transition-colors" placeholder="Seu nome completo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--primary)] mb-2">E-mail *</label>
          <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] ring-focus transition-colors" placeholder="seu@email.com" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-2">Organização</label>
        <input type="text" name="organizacao" className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] ring-focus transition-colors" placeholder="Nome da sua organização" />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-2">Assunto *</label>
        <select name="assunto" required className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--accent)] ring-focus transition-colors">
          <option value="">Selecione um assunto</option>
          <option value="parceria">Parceria Institucional</option>
          <option value="consultoria">Consultoria Técnica</option>
          <option value="projeto">Desenvolvimento de Projeto</option>
          <option value="suporte">Suporte e Treinamento</option>
          <option value="imprensa">Imprensa</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--primary)] mb-2">Mensagem *</label>
        <textarea name="mensagem" rows={6} required className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] ring-focus transition-colors resize-none" placeholder="Descreva sua necessidade, projeto ou dúvida..." />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-start gap-3">
        <input type="checkbox" id="privacy" name="privacy" required className="mt-1 size-4 text-[var(--accent)] border-[var(--border)] rounded focus:ring-[var(--accent)]" />
        <label htmlFor="privacy" className="text-sm text-[color:var(--muted)]">
          Concordo com o tratamento dos meus dados conforme a{" "}
          <Link href="/lgpd" className="text-[var(--accent)] hover:underline">Política de Privacidade (LGPD)</Link>.
        </label>
      </div>

      {status.message && (
        <div className={`p-3 rounded-lg border text-sm ${status.type === 'success' ? 'border-green-500 text-green-600 bg-green-500/10' : 'border-red-500 text-red-600 bg-red-500/10'}`}>
          {status.message}
        </div>
      )}

      <button type="submit" disabled={status.loading} className="w-full px-8 py-4 bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold rounded-xl hover:scale-105 transition-transform ring-focus disabled:opacity-60 disabled:cursor-not-allowed">
        {status.loading ? 'Enviando...' : 'Enviar Mensagem'}
      </button>
    </form>
  )
}
