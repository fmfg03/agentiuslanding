#!/usr/bin/env bash
set -Eeuo pipefail
# Execute from a git clone of fmfg03/agentiuslanding with push permission.
# Usage: bash scripts/import-agentius-v7.sh /absolute/path/agentius-home-comercial-v7-rc.zip
ZIP="${1:-}"
if [[ -z "$ZIP" || ! -f "$ZIP" ]]; then echo "Usage: $0 /absolute/path/agentius-home-comercial-v7-rc.zip" >&2; exit 2; fi
command -v unzip >/dev/null || { echo "unzip required" >&2; exit 2; }
command -v git >/dev/null || { echo "git required" >&2; exit 2; }
REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"
ORIGIN="$(git remote get-url origin)"
case "$ORIGIN" in *github.com*fmfg03/agentiuslanding*) ;; *) echo "Wrong repository: $ORIGIN" >&2; exit 3;; esac
if [[ -n "$(git status --porcelain)" ]]; then echo "Working tree must be clean" >&2; exit 3; fi
git fetch origin staging/agentius-home-v7-rc
git switch staging/agentius-home-v7-rc 2>/dev/null || git switch -c staging/agentius-home-v7-rc --track origin/staging/agentius-home-v7-rc
git pull --ff-only origin staging/agentius-home-v7-rc
if ! unzip -t "$ZIP" >/dev/null; then echo "Invalid ZIP" >&2; exit 4; fi
TARGET="$REPO/preview/v7"
mkdir -p "$TARGET"
unzip -oq "$ZIP" -d "$TARGET"
for f in index.html app.js styles.css soluciones/inventarios-trazabilidad.html soluciones/seguimiento-comercial.html soluciones/automatizacion-operativa.html; do
  test -s "$TARGET/$f" || { echo "Missing $f" >&2; exit 5; }
done
test "$(find "$TARGET/assets" -type f -name '*.webp' | wc -l)" -ge 8 || { echo "Missing optimized images" >&2; exit 5; }
git add preview/v7
git diff --cached --check
echo "--- Files staged ---"
git diff --cached --stat
echo "--- Changes ONLY in preview/v7 ---"
if git diff --cached --name-only | grep -v '^preview/v7/'; then echo "Unexpected tracked files" >&2; exit 6; fi
git commit -m "feat(staging): import complete Agentius V7 release candidate"
git push origin staging/agentius-home-v7-rc
echo "Uploaded V7 to GitHub branch staging/agentius-home-v7-rc"
echo "PREVIEW DIRECTORY: preview/v7 (not production root)"
echo "No Nginx or Cloudflare configuration was changed."
