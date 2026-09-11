#!/usr/bin/env bash
# Set the three env vars /api/comments needs on the Vercel `presentations` project (scope pvragon-dev).
# Reads VERCEL_TOKEN, PVRAGON_SUPABASE_SERVICE_ROLE_KEY and PREZ_AGENT_TOKEN from personal/secrets/.env;
# generates PREZ_AGENT_TOKEN into that file if absent. Never prints a secret value.
set -euo pipefail
ENV=~/ai-workspace/personal/secrets/.env
PROJECT=prj_pRHerAjlcJTycxYERarTus29IAil
TEAM=team_Tfmo7QHhAPcZU7Cda7qwgDUq
val() { grep -E "^$1=" "$ENV" | head -1 | cut -d= -f2- | tr -d '"'; }
if ! grep -q '^PREZ_AGENT_TOKEN=' "$ENV"; then
  printf '\n# prez.prgn.ai /api/comments agent bearer (Rowan reads/replies/resolves threads) — %s\nPREZ_AGENT_TOKEN=%s\n' \
    "$(date +%F)" "$(python3 -c 'import secrets;print(secrets.token_urlsafe(32))')" >> "$ENV"
  echo "generated PREZ_AGENT_TOKEN in .env"
fi
python3 - "$(val VERCEL_TOKEN)" "$(val PVRAGON_SUPABASE_SERVICE_ROLE_KEY)" "$(val PREZ_AGENT_TOKEN)" "$PROJECT" "$TEAM" <<'PY'
import sys, json, urllib.request
tok, srk, agt, project, team = sys.argv[1:6]
assert tok and srk and agt, "missing a value in .env"
body = [
  {"key": "SUPABASE_URL", "value": "https://eordiwigblrpyydiampm.supabase.co", "type": "encrypted", "target": ["production", "preview"]},
  {"key": "SUPABASE_SERVICE_ROLE_KEY", "value": srk, "type": "sensitive", "target": ["production", "preview"]},
  {"key": "PREZ_AGENT_TOKEN", "value": agt, "type": "sensitive", "target": ["production", "preview"]},
]
req = urllib.request.Request(f"https://api.vercel.com/v10/projects/{project}/env?teamId={team}&upsert=true",
                             data=json.dumps(body).encode(), method="POST",
                             headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
r = json.loads(urllib.request.urlopen(req).read())
print("set:", [e["key"] for e in r.get("created", [])], "failed:", r.get("failed") or "none")
PY
echo "Now redeploy (push to main, or: cd ~/ai-workspace/projects/presentations && vercel --prod) so functions pick the vars up."
