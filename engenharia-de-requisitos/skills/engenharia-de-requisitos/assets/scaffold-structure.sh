#!/usr/bin/env bash
#
# scaffold-structure.sh — Requirements-Engineering on-disk structure scaffolder + reorganizer
#
# Companion of references/10-estrutura-projeto.md (skill: engenharia-de-requisitos).
# Materializes the traceability spine (requirement -> Epic -> Feature -> CA/US -> Task -> Sprint)
# as a folder tree under a SINGLE root named `docs/`, mirroring the generic templates in
# assets/templates/. The concrete "Interpop" reference implementation lives in examples/.
#
# WORKFLOW (the rule: "always verify first"):
#   1. DETECT  — classify the target: GREENFIELD | HAS-STRUCTURE | LOOSE-FILES | LEGACY-MONOLITH.
#                LEGACY-MONOLITH = a single loose requirements doc (e.g. REQUISITOS*.md) from a
#                pre-`docs/` skill version; it is REPORTED with migration guidance, never auto-split.
#   2. CREATE  — seed any missing folder/template (never overwrites an existing file).
#   3. REORGANIZE — if loose RF/RNF/EP/F/sprint/ADR files are found, move them into place
#                   (auto-enabled on detection; `git mv` inside a repo to preserve history).
#   Adapt the seeded content to the host project afterwards — see the reference's
#   "Adaptation protocol" section (analyze the project's modules/roles/domain, or create the default).
#
# SAFETY MODEL (Extreme Ownership):
#   - Dry-run by DEFAULT. Nothing is written/moved unless --apply is passed.
#   - NEVER overwrites an existing file. Existing files are skipped and reported.
#   - Reorganize moves only UNAMBIGUOUS matches; ambiguous files are reported, not touched.
#
# USAGE:
#   bash scaffold-structure.sh [--root DIR] [--with-specs|--no-specs]
#                              [--reorganize|--no-reorganize] [--apply]
#
#   --root DIR        Root docs directory (default: docs). The whole structure lives under it.
#   --with-specs      Include specs/ (SDD) + tier-2 ADR template (default ON)
#   --no-specs        requirements/ + backlog/ only; ADRs stay single-tier in planning/adrs/
#   --reorganize      Force consolidation of loose files (auto-enabled when detected)
#   --no-reorganize   Never move loose files (create-only)
#   --apply           Actually create/move files (without it: dry-run preview only)
#   -h, --help        Show this help
#
# EXIT CODES: 0 ok · 1 usage error · 2 runtime error
set -euo pipefail

# ---------- locate generic templates (relative to this script) ----------
SELF="$(basename "${BASH_SOURCE[0]}")"
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SELF_DIR/templates"

# ---------- defaults ----------
ROOT="docs"
WITH_SPECS=1
REORGANIZE=auto      # auto | force | off
APPLY=0

# ---------- helpers ----------
c_reset=$'\033[0m'; c_dim=$'\033[2m'; c_grn=$'\033[32m'; c_yel=$'\033[33m'; c_cyn=$'\033[36m'; c_red=$'\033[31m'
info() { printf '%s%s%s\n' "$c_cyn" "$*" "$c_reset"; }
ok()   { printf '%s%s%s\n' "$c_grn" "$*" "$c_reset"; }
warn() { printf '%s%s%s\n' "$c_yel" "$*" "$c_reset"; }
err()  { printf '%s%s%s\n' "$c_red" "$*" "$c_reset" 1>&2; }
say()  { printf '%s\n' "$*"; }
usage() { sed -n '2,40p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

IS_GIT=0

copy_file() {  # copy_file <src-template> <dst>
  local s="$1" d="$2"
  if [ -e "$d" ]; then say "  ${c_dim}skip    ${c_reset}$d ${c_dim}(exists, untouched)${c_reset}"; return 0; fi
  if [ "$APPLY" -eq 1 ]; then mkdir -p "$(dirname "$d")"; cp "$s" "$d"; ok "  create  $d"; else warn "  PLAN    $d"; fi
}

mv_file() {  # mv_file <src> <dst>
  local s="$1" d="$2"
  [ -e "$s" ] || return 0
  if [ -e "$d" ]; then warn "  move SKIP  $s -> $d (target exists)"; return 0; fi
  if [ "$APPLY" -eq 1 ]; then
    mkdir -p "$(dirname "$d")"
    if [ "$IS_GIT" -eq 1 ] && git ls-files --error-unmatch "$s" >/dev/null 2>&1; then
      git mv "$s" "$d"; ok "  move git-mv  $s -> $d"
    else
      mv "$s" "$d"; ok "  move mv      $s -> $d"
    fi
  else
    warn "  move PLAN    $s -> $d"
  fi
}

# ---------- arg parsing ----------
while [ $# -gt 0 ]; do
  case "$1" in
    --root) ROOT="${2:?--root needs a value}"; shift 2;;
    --with-specs) WITH_SPECS=1; shift;;
    --no-specs) WITH_SPECS=0; shift;;
    --reorganize) REORGANIZE=force; shift;;
    --no-reorganize) REORGANIZE=off; shift;;
    --apply) APPLY=1; shift;;
    -h|--help) usage 0;;
    *) err "unknown argument: $1"; usage 1;;
  esac
done

[ -d "$TEMPLATE_DIR" ] || { err "template dir not found: $TEMPLATE_DIR"; exit 2; }
command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1 && IS_GIT=1 || IS_GIT=0
ROOT="${ROOT%/}"

# ---------- banner ----------
info "== ${SELF} =="
say  "root=${ROOT}/  with-specs=${WITH_SPECS}  reorganize=${REORGANIZE}  apply=${APPLY}  git=${IS_GIT}"
if [ "$(basename "$ROOT")" != "docs" ]; then
  warn "Note: convention is a single root named 'docs/'. You passed '--root ${ROOT}'."
fi
if [ "$APPLY" -eq 0 ]; then warn "DRY-RUN — nothing is created or moved. Re-run with --apply to execute."; fi
say ""

# ============================================================================
# STEP 1 — DETECT (always verify first)
# ============================================================================
info "[1/3] detect — classifying target '${ROOT}/'"
shopt -s nullglob globstar 2>/dev/null || true

has_structure=0
[ -d "$ROOT/requirements" ] || [ -d "$ROOT/backlog" ] && has_structure=1

# collect loose RE files (outside their canonical homes)
loose=()
for f in "$ROOT"/RF-*.md "$ROOT"/**/RF-*.md;  do case "$f" in "$ROOT"/requirements/*) :;; *) [ -e "$f" ] && loose+=("$f");; esac; done
for f in "$ROOT"/RNF-*.md "$ROOT"/**/RNF-*.md; do case "$f" in "$ROOT"/requirements/*) :;; *) [ -e "$f" ] && loose+=("$f");; esac; done
for f in "$ROOT"/EP-*.md "$ROOT"/backlog/EP-*.md;     do [ -e "$f" ] && loose+=("$f"); done
for f in "$ROOT"/F-*.md "$ROOT"/backlog/F-*.md;       do [ -e "$f" ] && loose+=("$f"); done
for f in "$ROOT"/sprint-*.md "$ROOT"/backlog/sprint-*.md; do [ -e "$f" ] && loose+=("$f"); done
for f in "$ROOT"/ADR-*.md "$ROOT"/planning/ADR-*.md;  do case "$f" in "$ROOT"/specs/*) :;; *) [ -e "$f" ] && loose+=("$f");; esac; done
# dedup (globstar ** can match a top-level file twice)
[ "${#loose[@]}" -gt 0 ] && mapfile -t loose < <(printf '%s\n' "${loose[@]}" | sort -u)

# collect LEGACY-MONOLITH candidates: a single requirements document produced by a
# pre-`docs/` version of the skill, sitting loose at the repo root (CWD) or at the
# docs root, never split into requirements/RF + requirements/RNF. We only REPORT
# these — splitting prose into per-module RF/RNF needs human/LLM judgment, so the
# scaffolder never auto-moves or auto-splits a monolith (it would destroy meaning).
monoliths=()
shopt -s nocaseglob 2>/dev/null || true
for f in \
  ./requisito*.md ./requirements.md ./srs*.md ./documento*requisito*.md ./*requisitos*unificad*.md \
  "$ROOT"/requisito*.md "$ROOT"/requirements.md "$ROOT"/srs*.md "$ROOT"/documento*requisito*.md "$ROOT"/*requisitos*unificad*.md
do
  case "$f" in "$ROOT"/requirements/*) continue;; esac
  [ -e "$f" ] && monoliths+=("$f")
done
shopt -u nocaseglob 2>/dev/null || true
[ "${#monoliths[@]}" -gt 0 ] && mapfile -t monoliths < <(printf '%s\n' "${monoliths[@]}" | sort -u)

if [ ! -d "$ROOT" ] && [ "${#monoliths[@]}" -gt 0 ]; then
  verdict="LEGACY-MONOLITH (${#monoliths[@]} loose requirements doc(s), no '${ROOT}/' spine) — will CREATE the structure; you MUST then MIGRATE (split) the monolith."
elif [ ! -d "$ROOT" ]; then
  verdict="GREENFIELD (no '${ROOT}/' yet) — will CREATE the standard structure."
elif [ "${#monoliths[@]}" -gt 0 ] && [ "$has_structure" -eq 0 ]; then
  verdict="LEGACY-MONOLITH (${#monoliths[@]} loose requirements doc(s), '${ROOT}/' exists but no RE spine) — will CREATE the structure; you MUST then MIGRATE (split) the monolith."
elif [ "${#loose[@]}" -gt 0 ]; then
  verdict="LOOSE-FILES (${#loose[@]} stray artifact(s)) — will CREATE missing + REORGANIZE."
elif [ "$has_structure" -eq 1 ]; then
  verdict="HAS-STRUCTURE — will fill only what is missing (idempotent), nothing overwritten."
else
  verdict="GREENFIELD ('${ROOT}/' exists but no RE structure) — will CREATE the standard structure."
fi
say "  verdict: $verdict"
if [ "${#loose[@]}" -gt 0 ]; then
  say "  loose files detected:"; for f in "${loose[@]}"; do say "    - $f"; done
fi
if [ "${#monoliths[@]}" -gt 0 ]; then
  warn "  LEGACY-MONOLITH candidate(s) — NOT auto-moved (prose split needs judgment):"
  for f in "${monoliths[@]}"; do say "    - $f"; done
  warn "  → After scaffolding, MIGRATE: split each into requirements/RF/RF-*.md + requirements/RNF/RNF-*.md,"
  warn "    seed personas-e-cenarios.md + glossario.md from it, and keep the original as a consolidated"
  warn "    overview that links INTO the split. See references/10-estrutura-projeto.md §8 (reorganizing)."
fi
# resolve auto reorganize
do_reorg=0
case "$REORGANIZE" in
  force) do_reorg=1;;
  off)   do_reorg=0;;
  auto)  [ "${#loose[@]}" -gt 0 ] && do_reorg=1 || do_reorg=0;;
esac
say ""

# ============================================================================
# STEP 2 — CREATE (mirror assets/templates/ into ROOT; skip existing)
# ============================================================================
info "[2/3] create — seeding folders + generic templates (skips existing)"
while IFS= read -r -d '' src; do
  rel="${src#"$TEMPLATE_DIR"/}"
  case "$rel" in
    specs/*) [ "$WITH_SPECS" -eq 0 ] && continue;;
  esac
  copy_file "$src" "$ROOT/$rel"
done < <(find "$TEMPLATE_DIR" -type f -print0)
say ""

# ============================================================================
# STEP 3 — REORGANIZE (consolidate loose files; conservative)
# ============================================================================
if [ "$do_reorg" -eq 1 ]; then
  info "[3/3] reorganize — consolidating loose files (unambiguous matches only)"
  for f in "$ROOT"/RF-*.md "$ROOT"/**/RF-*.md; do
    case "$f" in "$ROOT"/requirements/*) continue;; esac
    [ -e "$f" ] && mv_file "$f" "$ROOT/requirements/RF/$(basename "$f")"
  done
  for f in "$ROOT"/RNF-*.md "$ROOT"/**/RNF-*.md; do
    case "$f" in "$ROOT"/requirements/*) continue;; esac
    [ -e "$f" ] && mv_file "$f" "$ROOT/requirements/RNF/$(basename "$f")"
  done
  for f in "$ROOT"/EP-*.md "$ROOT"/backlog/EP-*.md; do
    [ -e "$f" ] && mv_file "$f" "$ROOT/backlog/epics/$(basename "$f")"
  done
  for f in "$ROOT"/F-*.md "$ROOT"/backlog/F-*.md; do
    [ -e "$f" ] && mv_file "$f" "$ROOT/backlog/features/$(basename "$f")"
  done
  for f in "$ROOT"/sprint-*.md "$ROOT"/backlog/sprint-*.md; do
    [ -e "$f" ] && mv_file "$f" "$ROOT/backlog/sprints/$(basename "$f")"
  done
  for f in "$ROOT"/ADR-*.md "$ROOT"/planning/ADR-*.md; do
    case "$f" in "$ROOT"/specs/*) continue;; esac
    [ -e "$f" ] && mv_file "$f" "$ROOT/planning/adrs/$(basename "$f")"
  done
  warn "  Ambiguous files (e.g. ADR-*.md already inside specs/<feature>/ subtrees) were NOT moved — review manually."
  say ""
else
  info "[3/3] reorganize — skipped (no loose files, or --no-reorganize)"
  say ""
fi

# ============================================================================
# summary
# ============================================================================
if [ "$APPLY" -eq 1 ]; then
  ok "Done. Structure materialized under '${ROOT}/'."
  say "NEXT — adapt the generic seeds to THIS project (do not leave placeholders):"
  say "  • detect language + rename/seed one RF per real module of the system"
  say "  • derive personas from the project's roles; seed the glossary from domain entities"
  say "  • see references/10-estrutura-projeto.md §\"Adaptation protocol\""
  if [ "${#monoliths[@]}" -gt 0 ]; then
    warn "  • MIGRATE the LEGACY-MONOLITH listed above: split it into requirements/RF + requirements/RNF,"
    warn "    seed personas + glossary from it, keep the original as a linked consolidated overview."
  fi
else
  warn "Dry-run complete. Re-run with --apply to execute the plan above."
  [ "${#monoliths[@]}" -gt 0 ] && warn "A LEGACY-MONOLITH was detected — see migration guidance above (it will NOT be auto-split)."
fi
