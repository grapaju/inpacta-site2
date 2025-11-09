export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h1>Teste de Página Admin</h1>
      <p>Se você está vendo isso, a página está funcionando!</p>
      <p>Data: {new Date().toISOString()}</p>
    </div>
  )
}