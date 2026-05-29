#!/usr/bin/env bash
#
# vendor_cockroach_docs.sh
#
# Fetches machine-generated doc files from cockroachdb/cockroach and
# cockroachdb/cockroach-operator, vendors them into this repo, and updates
# driver/ORM version strings in the tooling pages.
#
# Usage:
#   ./vendor_cockroach_docs.sh              # sync all active release branches
#   ./vendor_cockroach_docs.sh release-26.2 # sync a single branch
#
# Requirements: curl, python3 (for CSV parsing)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VERSIONS_CSV="$REPO_ROOT/src/current/_data/versions.csv"
GENERATED_DIR="$REPO_ROOT/src/current/_includes/cockroach-generated"
TOOLING_DIR="$REPO_ROOT/src/current/_includes"

COCKROACH_RAW="https://raw.githubusercontent.com/cockroachdb/cockroach"

# Generated doc files to fetch per branch (source path under docs/generated/).
GENERATED_FILES=(
  "eventlog.md"
  "logformats.md"
  "logging.md"
  "settings/settings.html"
  "sql/aggregates.md"
  "sql/functions.md"
  "sql/operators.md"
  "sql/window_functions.md"
)

# Minimum version to vendor (older versions don't have generated docs).
MIN_VERSION="23.1"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log() { printf '==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }

version_ge() {
  # Returns 0 if $1 >= $2 (comparing major.minor as floats).
  python3 -c "
import sys
a = tuple(int(x) for x in sys.argv[1].split('.'))
b = tuple(int(x) for x in sys.argv[2].split('.'))
sys.exit(0 if a >= b else 1)
" "$1" "$2"
}

fetch_file() {
  local url="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  if curl -sfL --retry 3 "$url" -o "$dest"; then
    return 0
  else
    warn "Failed to fetch: $url"
    return 1
  fi
}

# ---------------------------------------------------------------------------
# 1. Sync generated doc files from cockroachdb/cockroach
# ---------------------------------------------------------------------------

sync_generated_docs() {
  local branch="$1"
  local dest_dir="$GENERATED_DIR/$branch"

  log "Syncing generated docs for $branch"

  for file in "${GENERATED_FILES[@]}"; do
    local url="$COCKROACH_RAW/$branch/docs/generated/$file"
    local dest="$dest_dir/$file"
    fetch_file "$url" "$dest"
  done
}

# ---------------------------------------------------------------------------
# 2. Update driver/ORM version strings in tooling.md
# ---------------------------------------------------------------------------

# Each entry: go_file_name|variable_pattern|sed_replacement_prefix
# The variable_pattern is used to grep the value from the Go file.
TOOLING_VARS=(
  "npgsql.go|npgsqlSupportedTag|v"
  "pgx.go|supportedPGXTag|"
  "libpq.go|libPQSupportedTag|"
  "pgjdbc.go|supportedPGJDBCTag|"
  "asyncpg.go|asyncpgSupportedTag|"
  "ruby_pg.go|rubyPGVersion|"
  "gorm.go|gormSupportedTag|"
  "gopg.go|gopgSupportedTag|"
  "hibernate.go|supportedHibernateTag|"
  "sequelize.go|supportedSequelizeCockroachDBRelease|"
  "knex.go|supportedKnexTag|"
  "activerecord.go|supportedRailsVersion|"
  "django.go|djangoSupportedTag|cockroach-"
)

extract_go_var() {
  # Extract a string variable value from a Go source file fetched from GitHub.
  local go_file="$1" var_name="$2" strip_prefix="$3"
  local url="$COCKROACH_RAW/master/pkg/cmd/roachtest/tests/$go_file"
  local content
  content="$(curl -sfL "$url")" || { warn "Failed to fetch $url"; return 1; }

  local value
  value="$(echo "$content" | python3 -c "
import sys, re
text = sys.stdin.read()
m = re.search(r'(?:var|const)\s+${var_name}\s*=\s*\"([^\"]+)\"', text)
if m:
    val = m.group(1)
    prefix = '${strip_prefix}'
    if prefix and val.startswith(prefix):
        val = val[len(prefix):]
    print(val)
else:
    sys.exit(1)
")" || { warn "Could not extract $var_name from $go_file"; return 1; }

  echo "$value"
}

update_tooling_versions() {
  log "Fetching driver/ORM versions from cockroachdb/cockroach master"

  # Build a sed script with all version replacements.
  local sed_commands=()
  local tmpfile
  tmpfile="$(mktemp)"

  for entry in "${TOOLING_VARS[@]}"; do
    IFS='|' read -r go_file var_name strip_prefix <<< "$entry"
    local value
    value="$(extract_go_var "$go_file" "$var_name" "$strip_prefix")" || continue
    log "  $var_name = $value"

    # Write a Python replacement entry.
    echo "$var_name|$value" >> "$tmpfile"
  done

  # Apply replacements to all tooling.md files.
  log "Updating tooling.md files"
  python3 - "$tmpfile" "$TOOLING_DIR" << 'PYEOF'
import csv
import glob
import os
import re
import sys

vars_file = sys.argv[1]
includes_dir = sys.argv[2]

# Read variable values.
var_values = {}
with open(vars_file) as f:
    for line in f:
        line = line.strip()
        if '|' in line:
            name, value = line.split('|', 1)
            var_values[name] = value

# Build a combined regex that matches any remote_include for roachtest vars.
# This handles both var and const declarations and various whitespace patterns.
pattern = re.compile(
    r'\{%\s*remote_include\s+https://raw\.githubusercontent\.com/cockroachdb/cockroach/[^|]+\|\|'
    r'(?:var|const)\s+(\w+)\s*=\s*"[^|]*\|\|"[^%]*%\}'
)

def replace_match(m):
    var_name = m.group(1)
    if var_name in var_values:
        return var_values[var_name]
    return m.group(0)  # Leave unchanged if not found.

# Also handle commented-out remote_includes.
comment_pattern = re.compile(
    r'\{%\s*comment\s*%\}\{%\s*remote_include\s+https://raw\.githubusercontent\.com/cockroachdb/cockroach/[^}]+%\}\{%\s*endcomment\s*%\}'
)

tooling_files = glob.glob(os.path.join(includes_dir, 'v*/misc/tooling.md'))
for filepath in sorted(tooling_files):
    with open(filepath) as f:
        content = f.read()

    original = content
    content = pattern.sub(replace_match, content)
    content = comment_pattern.sub('', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  Updated {os.path.relpath(filepath)}")

PYEOF

  rm -f "$tmpfile"
}

# ---------------------------------------------------------------------------
# 3. Update cockroach-operator version
# ---------------------------------------------------------------------------
# NOTE: The operator version was previously fetched from
# cockroachdb/cockroach-operator/master/version.txt and written to
# latest_operator_version.md.  That file has been removed; the operator
# version is now maintained manually.  Kept as a no-op placeholder so that
# callers do not break.

update_operator_version() {
  log "Skipping operator version (maintained manually)"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  local target_branch="${1:-}"

  if [[ -n "$target_branch" ]]; then
    # Sync a single branch.
    sync_generated_docs "$target_branch"
  else
    # Sync all active branches from versions.csv.
    log "Reading branches from $VERSIONS_CSV"
    local branches
    branches="$(python3 -c "
import csv, sys
with open('$VERSIONS_CSV') as f:
    reader = csv.DictReader(f)
    for row in reader:
        v = row['major_version'].lstrip('v')
        branch = row['crdb_branch_name']
        # Print branches >= minimum version.
        parts = tuple(int(x) for x in v.split('.'))
        min_parts = tuple(int(x) for x in '$MIN_VERSION'.split('.'))
        if parts >= min_parts:
            print(branch)
")"

    for branch in $branches; do
      sync_generated_docs "$branch"
    done
  fi

  update_tooling_versions
  update_operator_version

  log "Done. Review changes with: git diff --stat"
}

main "$@"
