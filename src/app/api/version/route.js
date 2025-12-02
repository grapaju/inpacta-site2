export const runtime = 'nodejs'

export async function GET() {
  const sha = process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.COMMIT_SHA || 'local'
  const short = sha.slice(0,7)
  return new Response(JSON.stringify({ commit: sha, short }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  })
}
