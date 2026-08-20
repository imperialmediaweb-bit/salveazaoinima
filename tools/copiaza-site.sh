#!/usr/bin/env sh
#
# copiaza-site.sh — descarca un site public complet: HTML, CSS, JavaScript,
# imagini, fonturi. Adica designul si functiile care ruleaza in browser.
#
#   ./tools/copiaza-site.sh https://exemplu.ro
#   ./tools/copiaza-site.sh https://exemplu.ro folder-destinatie
#
# Foloseste wget daca exista. Daca nu (cazul Git Bash pe Windows),
# trece automat pe curl, care e mereu disponibil acolo.
#
set -u

URL="${1:-}"
OUTARG="${2:-}"
MAXPAGES="${MAXPAGES:-400}"

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

SCHEME=$(printf '%s' "$URL" | sed -E 's#^(https?)://.*#\1#')
HOSTPORT=$(printf '%s' "$URL" | sed -E 's#^https?://##; s#/.*$##')
HOST=$(printf '%s' "$HOSTPORT" | sed -E 's#:[0-9]+$##')
ROOT="$SCHEME://$HOSTPORT"
GAZDA_BAZA=$(printf '%s' "$HOST" | sed -E 's#^www\.##')
OUT="${OUTARG:-copie-$(printf '%s' "$HOST" | sed -E 's#^www\.##')}"

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

echo "Copiez $URL"
echo "  -> $OUT/"
echo

mkdir -p "$OUT" || exit 1

# ---------------------------------------------------------------- wget ------
copiaza_cu_wget() {
  echo "Folosesc wget."
  echo
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
}

# ---------------------------------------------------------------- curl ------
# Mic crawler: pleaca de la pagina de start, ia paginile de pe acelasi domeniu
# si toate resursele la care ele trimit (css, js, imagini, fonturi), apoi
# citeste si fisierele css ca sa prinda fonturile din url(...).

url_fara_ancora() {
  printf '%s' "$1" | sed -E 's/#.*$//'
}

gazda_url() {
  printf '%s' "$1" | sed -E 's#^https?://##; s#/.*$##; s#:[0-9]+$##; s#^www\.##'
}

acelasi_domeniu() {
  [ "$(gazda_url "$1")" = "$GAZDA_BAZA" ]
}

rezolva() {
  # rezolva( url_curent, referinta ) -> url absolut, sau gol daca il ignoram
  _base="$1"; _ref="$2"
  case "$_ref" in
    ""|"#"*|data:*|mailto:*|tel:*|javascript:*|blob:*) printf ''; return ;;
    http://*|https://*) printf '%s' "$_ref"; return ;;
    //*) printf '%s:%s' "$SCHEME" "$_ref"; return ;;
    /*)  printf '%s%s' "$ROOT" "$_ref"; return ;;
  esac
  _dir=$(printf '%s' "$_base" | sed -E 's#\?.*$##; s#/[^/]*$##')
  printf '%s/%s' "$_dir" "$_ref"
}

cale_locala() {
  # url -> cale relativa in folderul de iesire
  _p=$(printf '%s' "$1" | sed -E 's#^https?://[^/]*##; s#\?.*$##')
  _p=${_p#/}
  case "$_p" in
    "") _p="index.html" ;;
    */) _p="${_p}index.html" ;;
  esac
  # fara extensie in ultimul segment -> il tratam ca pagina
  _last=$(printf '%s' "$_p" | sed -E 's#.*/##')
  case "$_last" in
    *.*) ;;
    *) _p="$_p.html" ;;
  esac
  printf '%s' "$_p"
}

extrage_linkuri() {
  # citeste un fisier html si scoate valorile href= si src=
  sed -E 's/></>\n</g' "$1" \
    | grep -oiE '(href|src)[[:space:]]*=[[:space:]]*("[^"]*"|'"'"'[^'"'"']*'"'"')' \
    | sed -E 's/^[^=]*=[[:space:]]*//; s/^["'"'"']//; s/["'"'"']$//'
}

extrage_din_css() {
  grep -oiE 'url\([[:space:]]*["'"'"']?[^)"'"'"']+' "$1" \
    | sed -E 's/^url\([[:space:]]*//; s/^["'"'"']//'
}

copiaza_cu_curl() {
  echo "wget nu exista — folosesc curl."
  echo
  _q="$OUT/.coada"; _v="$OUT/.vazute"
  : > "$_q"; : > "$_v"
  # daca site-ul redirectioneaza (ex. spre www), pornim de la adresa finala
  _final=$(curl -sSL -o /dev/null -A "$UA" --max-time 30 -w '%{url_effective}' "$URL" 2>/dev/null)
  if [ -n "$_final" ] && [ "$_final" != "$URL" ]; then
    echo "Redirect: $URL -> $_final"
    URL="$_final"
    SCHEME=$(printf '%s' "$URL" | sed -E 's#^(https?)://.*#\1#')
    HOSTPORT=$(printf '%s' "$URL" | sed -E 's#^https?://##; s#/.*$##')
    ROOT="$SCHEME://$HOSTPORT"
    echo
  fi

  printf '%s\n' "$(url_fara_ancora "$URL")" >> "$_q"
  _n=0

  while :; do
    _u=$(head -n 1 "$_q" 2>/dev/null)
    [ -z "$_u" ] && break
    sed -i.bak '1d' "$_q" 2>/dev/null || { tail -n +2 "$_q" > "$_q.t" && mv "$_q.t" "$_q"; }
    rm -f "$_q.bak"

    # cheia de deduplicare e calea locala: "/" si "/index.html" sunt acelasi fisier
    _rel=$(cale_locala "$_u")
    grep -Fxq "$_rel" "$_v" 2>/dev/null && continue
    printf '%s\n' "$_rel" >> "$_v"

    _n=$((_n + 1))
    if [ "$_n" -gt "$MAXPAGES" ]; then
      echo "Am atins limita de $MAXPAGES fisiere. Ridic-o cu: MAXPAGES=1000 $0 $URL"
      break
    fi

    _dst="$OUT/$_rel"
    mkdir -p "$(dirname "$_dst")" 2>/dev/null

    _code=$(curl -sSL --compressed -A "$UA" --max-time 30 --retry 2 \
                 -w '%{http_code}' -o "$_dst" "$_u" 2>/dev/null)
    if [ "$_code" != "200" ]; then
      echo "  [$_code] $_u"
      rm -f "$_dst"
      continue
    fi
    _sz=$(wc -c < "$_dst" 2>/dev/null | tr -d ' ')
    echo "  [ok] $_rel ($_sz octeti)"

    case "$_rel" in
      *.html|*.htm)
        _nl=$(extrage_linkuri "$_dst" | wc -l | tr -d ' ')
        echo "       $_nl referinte gasite in pagina"
        extrage_linkuri "$_dst" | while IFS= read -r _ref; do
          _abs=$(rezolva "$_u" "$(url_fara_ancora "$_ref")")
          [ -z "$_abs" ] && continue
          if acelasi_domeniu "$_abs"; then printf '%s\n' "$_abs" >> "$_q"; fi
        done
        ;;
      *.css)
        extrage_din_css "$_dst" | while IFS= read -r _ref; do
          _abs=$(rezolva "$_u" "$(url_fara_ancora "$_ref")")
          [ -z "$_abs" ] && continue
          if acelasi_domeniu "$_abs"; then printf '%s\n' "$_abs" >> "$_q"; fi
        done
        ;;
    esac
  done

  rm -f "$_q" "$_v"
}

if [ "${USE_CURL:-0}" = "1" ]; then
  copiaza_cu_curl
elif command -v wget >/dev/null 2>&1; then
  copiaza_cu_wget
elif command -v curl >/dev/null 2>&1; then
  copiaza_cu_curl
else
  echo "Nu am gasit nici wget, nici curl."
  echo "Pe Windows: foloseste HTTrack (https://www.httrack.com) — are interfata grafica."
  exit 1
fi

echo
if [ ! -d "$OUT" ] || [ -z "$(ls -A "$OUT" 2>/dev/null)" ]; then
  echo "Nu s-a descarcat nimic. Verifica adresa sau conexiunea."
  exit 1
fi

echo "Gata. Ce a venit:"
echo "  pagini HTML : $(find "$OUT" -type f \( -name '*.html' -o -name '*.htm' \) 2>/dev/null | wc -l | tr -d ' ')"
echo "  fisiere CSS : $(find "$OUT" -type f -name '*.css' 2>/dev/null | wc -l | tr -d ' ')"
echo "  fisiere JS  : $(find "$OUT" -type f -name '*.js' 2>/dev/null | wc -l | tr -d ' ')"
echo "  imagini     : $(find "$OUT" -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.svg' -o -name '*.webp' -o -name '*.gif' -o -name '*.avif' \) 2>/dev/null | wc -l | tr -d ' ')"
echo "  fonturi     : $(find "$OUT" -type f \( -name '*.woff' -o -name '*.woff2' -o -name '*.ttf' -o -name '*.otf' \) 2>/dev/null | wc -l | tr -d ' ')"
echo "  total       : $(du -sh "$OUT" 2>/dev/null | cut -f1)"
echo
echo "Deschide: $OUT/index.html"

cat <<'NEXT'

Ce NU vine odata cu asta:
  - codul de pe server (PHP, baza de date, panoul de admin, procesarea platilor)
  - continut generat de JavaScript dupa incarcare (React, Vue, Next.js)
    -> pentru astea foloseste extensia SingleFile din Chrome/Firefox

Pasul urmator — urca folderul pe GitHub:
  git checkout -b copie-site
  git add -A
  git commit -m "copie site existent"
  git push -u origin copie-site
NEXT
