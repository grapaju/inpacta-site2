export default function HomePage() {
  return (
    <div style={{ padding: '50px', fontSize: '24px' }}>
      <h1>Site InPACTA</h1>
      <p>Esta é a página principal do site.</p>
      <p>Data: {new Date().toLocaleDateString()}</p>
      <a href="/admin/login" style={{ color: 'blue' }}>Ir para Admin</a>
    </div>
  )
}