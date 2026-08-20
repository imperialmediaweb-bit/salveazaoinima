#!/usr/bin/env bash
#
# copiaza-site.sh — descarca un site public complet: HTML, CSS, JavaScript,
# imagini, fonturi. Adica designul si functiile care ruleaza in browser.
#
#   ./tools/copiaza-site.sh https://salveazaoinima.ro
#   ./tools/copiaza-site.sh https://salveazaoinima.ro copie-site
#
# Rezultatul e un folder pe care il poti deschide direct in browser
# (index.html) sau urca intr-un repo ca sa fie citit de altcineva.
#
set -uo pipefail

URL="${1:-}"
OUT="${2:-}"

if [ -z "$URL" ]; then
  cat <<'USAGE'
Utilizare:
  ./tools/copiaza-site.sh <adresa-site> [folder-destinatie]

Exemplu:
  ./tools/copiaza-site.sh https://salveazaoinima.ro
USAGE
  exit 1
fi

case "$URL" in
  http://*|https://*) ;;
  *) URL="https://$URL" ;;
esac

HOST=$(printf '%s' "$URL" | sed -E 's#^https?://##; s#/.*$##; s#:[0-9]+$##; s#^www\.##')
OUT="${OUT:-copie-$HOST}"

if ! command -v wget >/dev/null 2>&1; then
  cat <<'NOWGET'
wget nu este instalat.

  macOS:          brew install wget
  Ubuntu/Debian:  sudo apt install wget
  Windows:        foloseste HTTrack (https://www.httrack.com) — are interfata grafica

NOWGET
  exit 1
fi

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

echo "Copiez $URL"
echo "  -> $OUT/"
echo

mkdir -p "$OUT"

wget \
  --mirror \
  --page-requisites \
  --convert-links \
  --adjust-extension \
  --no-parent \
  --no-host-directories \
  --directory-prefix="$OUT" \
  --user-agent="$UA" \
  --execute robots=off \
  --tries=3 \
  --timeout=25 \
  --wait=0.3 \
  --random-wait \
  --no-verbose \
  "$URL"

STATUS=$?

echo
if [ ! -d "$OUT" ] || [ -z "$(ls -A "$OUT" 2>/dev/null)" ]; then
  echo "Nu s-a descarcat nimic. Verifica adresa sau conexiunea."
  exit 1
fi

echo "Gata. Ce a venit:"
echo "  pagini HTML : $(find "$OUT" -type f \( -name '*.html' -o -name '*.htm' \) | wc -l | tr -d ' ')"
echo "  fisiere CSS : $(find "$OUT" -type f -name '*.css'  | wc -l | tr -d ' ')"
echo "  fisiere JS  : $(find "$OUT" -type f -name '*.js'   | wc -l | tr -d ' ')"
echo "  imagini     : $(find "$OUT" -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.svg' -o -name '*.webp' -o -name '*.gif' -o -name '*.avif' \) | wc -l | tr -d ' ')"
echo "  fonturi     : $(find "$OUT" -type f \( -name '*.woff' -o -name '*.woff2' -o -name '*.ttf' -o -name '*.otf' \) | wc -l | tr -d ' ')"
echo "  total       : $(du -sh "$OUT" 2>/dev/null | cut -f1)"
echo
echo "Deschide: $OUT/index.html"

if [ "$STATUS" -ne 0 ]; then
  echo
  echo "Nota: wget a raportat cod $STATUS — unele fisiere pot lipsi"
  echo "(link-uri rupte pe site sau resurse de pe alt domeniu)."
fi

cat <<'NEXT'

Ce NU vine odata cu asta:
  - codul de pe server (PHP, baza de date, panoul de admin)
  - continut generat de JavaScript dupa incarcare (React, Vue, Next.js)
    -> pentru astea foloseste extensia SingleFile din Chrome/Firefox:
       deschizi pagina, apesi butonul extensiei, iese un singur .html complet

Ca sa mi-l arati mie, urca folderul intr-un repo:
  git checkout -b copie-site
  git add <folder> && git commit -m "copie site existent"
  git push -u origin copie-site
NEXT
