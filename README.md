# Mind the Product MCP

Connect any MCP client to 15 years of product management writing, conference talks and
podcasts from [Mind the Product](https://www.mindtheproduct.com) — plus live events and
the product job board.

```
https://www.mindtheproduct.com/api/mcp/
```

Read-only. Free. Sign in with a Mind the Product account when your client prompts you.

---

## Install

**Claude Code**

```bash
claude mcp add --transport http mind-the-product https://www.mindtheproduct.com/api/mcp/
```

**Claude / ChatGPT** — Settings → Connectors → Add custom connector, paste the URL above.

**Cursor / VS Code**

```bash
code --add-mcp '{"name":"mind-the-product","type":"http","url":"https://www.mindtheproduct.com/api/mcp/"}'
```

**Codex** — in `~/.codex/config.toml`:

```toml
[mcp_servers.mind_the_product]
url = "https://www.mindtheproduct.com/api/mcp/"
```

**Anything else**

```json
{
  "mcpServers": {
    "mind-the-product": {
      "url": "https://www.mindtheproduct.com/api/mcp/"
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

## Signing in

Your client handles it. The first time you use the MCP it'll open a browser and ask you
to sign in with your Mind the Product account — free to create — and that's it.

There's no API key to manage. Access is read-only and tied to you personally, so
nothing you connect can post, comment, or change anything in your account.

## Things to build with it

Copy-paste projects. No code, no setup — connect the MCP, paste the prompt, go.

| | What it is |
| --- | --- |
| 🎲 [PM Trivia Night](examples/pm-trivia) | A quiz game where every answer cites a real article |
| 🕵️ [Two Truths and a Lie](examples/two-truths-and-a-lie) | Spot the invented product claim |
| 🧭 [Your First 90 Days](examples/first-90-days) | Choose-your-own-adventure for new product leaders |
| 🔥 [Roadmap Roast](examples/roadmap-roast) | Paste your roadmap, get it pulled apart with receipts |
| 🃏 [Flashcard Factory](examples/flashcard-factory) | Has your AI build you a real flashcards app |
| 📍 [ProductTank Radar](examples/producttank-radar) | Finds the product community near you |

**Made something?** Open a PR and add it — a folder, a README, the prompt you used.
We'd like this to be where people find out what's possible.

## For developers

Protocol revision `2026-07-28`, Streamable HTTP transport. Full reference —
tool schemas, the OAuth flow, resources, errors, rate limits — is at
[mindtheproduct.com/mcp/docs](https://www.mindtheproduct.com/mcp/docs).

Raw protocol examples live in [`dev/`](dev): a shell walkthrough of the whole flow,
and a dependency-free Node client. The registry manifest is
[`server.json`](server.json).

## Licence

Code in this repo is MIT. Mind the Product content served through the API remains
© Mind the Product and is provided for use within AI assistants, not for redistribution.
