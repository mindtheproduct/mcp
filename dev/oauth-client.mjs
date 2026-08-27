/**
 * Minimal Mind the Product MCP client: registers itself, gets consent in the
 * browser, then calls a tool and reads a full article.
 *
 *   node examples/oauth-client.mjs "product discovery"
 *
 * No dependencies — Node 20+.
 */
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { exec } from 'node:child_process';

const BASE = 'https://www.mindtheproduct.com';
// Trailing slash required: the bare path 308-redirects and not every client
// follows that on POST.
const MCP = `${BASE}/api/mcp/`;
const PORT = 8765;
const REDIRECT = `http://localhost:${PORT}/callback`;
const query = process.argv[2] ?? 'product discovery';

const b64url = (buf) => buf.toString('base64url');

async function json(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${url} → ${res.status} ${await res.text()}`);
  return res.json();
}

// 1. Discovery — the 401 tells us where the authorization server is.
const prm = await json(`${BASE}/.well-known/oauth-protected-resource`);
const as = await json(`${prm.authorization_servers[0]}/.well-known/oauth-authorization-server`);

// 2. Register this client. No credentials needed.
const client = await json(as.registration_endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ client_name: 'mtp-example-client', redirect_uris: [REDIRECT] }),
});

// 3. PKCE, then send the user to consent.
const verifier = b64url(randomBytes(32));
const challenge = b64url(createHash('sha256').update(verifier).digest());
const state = b64url(randomBytes(16));

const authUrl = new URL(as.authorization_endpoint);
authUrl.search = new URLSearchParams({
  client_id: client.client_id,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: 'mcp:read',
  state,
  code_challenge: challenge,
  code_challenge_method: 'S256',
}).toString();

const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== '/callback') return res.end();
    res.end('Connected. You can close this tab.');
    server.close();
    if (url.searchParams.get('state') !== state) return reject(new Error('state mismatch'));
    const err = url.searchParams.get('error');
    err ? reject(new Error(err)) : resolve(url.searchParams.get('code'));
  }).listen(PORT, () => {
    console.log('Approve in your browser:\n ', authUrl.toString());
    const open =
      process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${open} "${authUrl}"`);
  });
});

// 4. Exchange the code for a token.
const token = await json(as.token_endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT,
    client_id: client.client_id,
    code_verifier: verifier,
  }),
});

const rpc = (method, params) =>
  json(MCP, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });

// 5. Search, then read the top hit in full via its resource link.
const search = await rpc('tools/call', {
  name: 'search_mtp_content',
  arguments: { query, limit: 3 },
});

console.log('\nResults:');
for (const hit of search.result.structuredContent.results) {
  console.log(` • ${hit.title}\n   ${hit.url}`);
}

const top = search.result.structuredContent.results[0];
if (top) {
  const article = await rpc('resources/read', { uri: top.uri });
  console.log(`\nFull text of "${top.title}":\n`);
  console.log(article.result.contents[0].text.slice(0, 1200), '…');
}
