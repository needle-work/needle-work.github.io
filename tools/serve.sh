#!/usr/bin/env bash
set -euo pipefail
SITE="$(cd "$(dirname "$0")/.." && pwd -P)"
BIND=127.0.0.1
if [[ "${1:-}" == "--public" ]]; then BIND=0.0.0.0; fi
exec python3 "$SITE/tools/serve.py" --bind "$BIND" --port 8765
