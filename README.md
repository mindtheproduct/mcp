# Mind the Product MCP

Connect any MCP client to 15 years of product management writing, conference talks and
podcasts from [Mind the Product](https://www.mindtheproduct.com) — plus live events and
the product job board.

```
https://www.mindtheproduct.com/api/mcp
```

Read-only. Free. Sign in with a Mind the Product account when your client prompts you.

---

## Install

**Claude Code**

```bash
claude mcp add --transport http mtp-knowledge https://www.mindtheproduct.com/api/mcp
```

**Claude / ChatGPT** — Settings → Connectors → Add custom connector, paste the URL above.

**Cursor / VS Code**

```bash
code --add-mcp '{"name":"mtp-knowledge","type":"http","url":"https://www.mindtheproduct.com/api/mcp"}'
```

**Codex** — in `~/.codex/config.toml`:

```toml
[mcp_servers.mtp_knowledge]
url = "https://www.mindtheproduct.com/api/mcp"
```

**Anything else**

```json
{
  "mcpServers": {
    "mtp-knowledge": {
      "url": "https://www.mindtheproduct.com/api/mcp"
    }
  }
}
```

There is a one-click install for most clients at
[mindtheproduct.com/mcp](https://www.mindtheproduct.com/mcp).

---

## What you can ask

> What frameworks work best for B2B product discovery?

> Summarise the latest Mind the Product thinking on AI product management.

> What else should I read about outcome-driven roadmaps?

> Are there any ProductTank meetups near me this month?

> Show me remote senior PM roles on the job board.

No commands to learn — your client picks the right tool.

---

## Tools

| Tool | What it does |
| --- | --- |
| `search_mtp_content` | Hybrid semantic + keyword search across 1,500+ articles, talks and guides |
| `get_article` | Full text of one article, with authors, date and categories |
| `list_recent` | Recently published articles, optionally filtered by topic |
| `get_related` | Vector-similarity reading lists — what to read next |
| `search_events` | MTP conferences, workshops and ProductTank meetups worldwide |
| `search_jobs` | Live listings from the Mind the Product job board |

All six are read-only and annotated as such.

## Resources

Articles are exposed as MCP resources, so full text is one `resources/read` away —
no second tool call, no guessing slugs.

```
mtp://article/{slug}
```

Every search result carries a `resource_link` pointing at one of these. The four content
tools also return `structuredContent` matching their `outputSchema`, so you can parse
results rather than scraping markdown.

---

## Authentication

OAuth 2.1 with PKCE, and no pre-registration. Your client registers itself via dynamic
client registration, you approve once in the browser, and it gets a token bound to your
account.

There is no API key and no `client_credentials` grant — every token belongs to a person
who clicked approve.

Discovery starts from a `401`:

```bash
curl -isL -X POST https://www.mindtheproduct.com/api/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

The `WWW-Authenticate` header points at the protected-resource metadata, and everything
follows from there. Full walkthrough:
[mindtheproduct.com/mcp/docs](https://www.mindtheproduct.com/mcp/docs).

---

## Examples

- [`examples/curl.sh`](examples/curl.sh) — the whole flow in shell, discovery to tool call
- [`examples/oauth-client.mjs`](examples/oauth-client.mjs) — a minimal Node client that
  registers, opens a browser for consent, and calls a tool

## Built something?

Open a PR adding it here. We'd like this to be the place people find out what's possible.

## Spec

Protocol revision `2026-07-28`, Streamable HTTP transport. Registry manifest lives in
[`server.json`](server.json).

## Licence

Code in this repo is MIT. Mind the Product content served through the API remains
© Mind the Product and is provided for use within AI assistants, not for redistribution.
