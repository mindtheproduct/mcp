#!/usr/bin/env bash
# The Mind the Product MCP flow, end to end, in shell.
# Needs: curl, jq, python3 (for PKCE).
set -euo pipefail

BASE="https://www.mindtheproduct.com"
MCP="$BASE/api/mcp"
REDIRECT="http://localhost:8765/callback"

echo "1. Unauthenticated call — read the challenge"
curl -isL -X POST "$MCP" -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | grep -i 'www-authenticate' || true

echo; echo "2. Protected-resource metadata"
curl -s "$BASE/.well-known/oauth-protected-resource" | jq .

echo; echo "3. Authorization server metadata"
curl -s "$BASE/.well-known/oauth-authorization-server" | jq .

echo; echo "4. Register this client"
CLIENT_ID=$(curl -s -X POST "$BASE/api/mcp/oauth/register/" \
  -H 'Content-Type: application/json' \
  -d "{\"client_name\":\"curl example\",\"redirect_uris\":[\"$REDIRECT\"]}" | jq -r .client_id)
echo "client_id: $CLIENT_ID"

echo; echo "5. PKCE pair"
VERIFIER=$(python3 -c "import secrets,base64;print(base64.urlsafe_b64encode(secrets.token_bytes(32)).rstrip(b'=').decode())")
CHALLENGE=$(python3 -c "
import hashlib,base64,sys
print(base64.urlsafe_b64encode(hashlib.sha256(sys.argv[1].encode()).digest()).rstrip(b'=').decode())" "$VERIFIER")

echo; echo "6. Open this in a browser, approve, and copy the ?code= you land on:"
echo "$BASE/oauth/authorize/?client_id=$CLIENT_ID&redirect_uri=$REDIRECT&response_type=code&scope=mcp:read&state=xyz&code_challenge=$CHALLENGE&code_challenge_method=S256"
read -rp "code: " CODE

echo; echo "7. Exchange it"
TOKEN=$(curl -s -X POST "$BASE/api/mcp/oauth/token/" \
  -d grant_type=authorization_code -d "code=$CODE" -d "redirect_uri=$REDIRECT" \
  -d "client_id=$CLIENT_ID" -d "code_verifier=$VERIFIER" | jq -r .access_token)

echo; echo "8. Search"
curl -sL -X POST "$MCP" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_mtp_content","arguments":{"query":"product discovery","limit":3}}}' \
  | jq '.result.structuredContent'

echo; echo "9. Read one of them in full"
URI=$(curl -sL -X POST "$MCP" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_mtp_content","arguments":{"query":"product discovery","limit":1}}}' \
  | jq -r '.result.structuredContent.results[0].uri')
curl -sL -X POST "$MCP" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"resources/read\",\"params\":{\"uri\":\"$URI\"}}" \
  | jq -r '.result.contents[0].text' | head -40
