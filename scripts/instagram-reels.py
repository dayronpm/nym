#!/usr/bin/env python3
"""Importa los mejores reels de Instagram a la web.

Por qué existe: Instagram bloquea el acceso anónimo desde servidores (responde 429 y pone
muro de login), así que el análisis hay que hacerlo desde una máquina normal con sesión de
Instagram. Este script hace todo el trabajo:

  1. Entra en Instagram con `instaloader` (usando TU sesión; la contraseña la pides tú y no
     se guarda en ningún sitio).
  2. Lee tus publicaciones, se queda con los **reels** y los **puntúa** por métricas
     (reproducciones, "me gusta" y comentarios) — de ahí salen "los que más llaman la
     atención", no de una corazonada.
  3. Descarga la **miniatura** de los mejores, la sube al bucket `media` y la registra.
  4. Reescribe el bloque `reels` de la página `galeria` con los elegidos, mejor puntuados
     primero (Inicio los resume con `source_page: galeria`, así que salen solos en la portada).

Variedad: agrupa los reels por sus **hashtags** y no repite tema ni caption, así que los
elegidos no salen cinco iguales. Con `--require` se limita a los que contengan ciertos
hashtags o palabras (para asegurar que todos son de la misma temática).

Uso (en tu máquina, desde la raíz del proyecto):

    python -m pip install instaloader

    # El perfil objetivo puede ser distinto de la cuenta de login:
    npm run reels:import -- --profile CUENTA_OBJETIVO --login TU_CUENTA --top 5

    # Solo reels de una temática concreta (hashtags o palabras del caption):
    npm run reels:import -- --profile CUENTA_OBJETIVO --login TU_CUENTA --require masaje,facial

`--login` pide la contraseña por consola y no la guarda. Sin `--login` se intenta el acceso
anónimo (Instagram suele bloquearlo). Requiere `--env-file` (por defecto `.env.local`) con
NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY. NO subas ese archivo a ningún sitio.

Opcional: `--dry-run` analiza y muestra el ranking sin tocar Supabase.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

UA = "Mozilla/5.0 (compatible; nym-reels-import/1.0)"

# Pesos del ranking. Los "me gusta" y los comentarios valen más que una reproducción: una
# reproducción puede ser un vistazo sin interés; un comentario, no. Ajustables si quieres.
W_VIEWS = 1.0
W_LIKES = 5.0
W_COMMENTS = 8.0


def load_env(path: str) -> dict[str, str]:
    env: dict[str, str] = {}
    file = Path(path)
    if not file.is_file():
        sys.exit(f"No se encontró {path}. Pasa --env-file con la ruta correcta.")
    for line in file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip()
    return env


def rest(base: str, key: str, method: str, endpoint: str, payload=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(base + endpoint, data=data, method=method)
    request.add_header("apikey", key)
    request.add_header("Authorization", "Bearer " + key)
    request.add_header("Content-Type", "application/json")
    request.add_header("User-Agent", UA)
    request.add_header("Prefer", "return=representation,resolution=merge-duplicates")
    with urllib.request.urlopen(request) as response:
        body = response.read()
        return json.loads(body) if body else None


def upload(base: str, key: str, path: str, content: bytes, content_type: str) -> None:
    request = urllib.request.Request(
        f"{base}/storage/v1/object/media/{path}", data=content, method="POST"
    )
    request.add_header("apikey", key)
    request.add_header("Authorization", "Bearer " + key)
    request.add_header("Content-Type", content_type)
    request.add_header("User-Agent", UA)
    request.add_header("x-upsert", "true")
    with urllib.request.urlopen(request) as response:
        response.read()


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request) as response:
        return response.read()


def score(post) -> float:
    views = getattr(post, "video_view_count", 0) or 0
    return W_VIEWS * views + W_LIKES * post.likes + W_COMMENTS * post.comments


def hashtags_of(post) -> set:
    return {tag.lower() for tag in re.findall(r"#(\w+)", post.caption or "")}


def words_of(post) -> set:
    return {word.lower() for word in re.findall(r"\w+", post.caption or "") if len(word) > 3}


def pick_diverse(pool: list, count: int) -> list:
    """Elige `count` reels evitando repetir tema (por hashtags) y captions idénticos.

    Primera pasada: solo reels que aporten hashtags nuevos. Si con eso no se llega al número
    pedido (por ejemplo, pocos reels o sin hashtags), una segunda pasada rellena con los
    siguientes del ranking.
    """
    chosen: list = []
    used_tags: set = set()
    seen_captions: set = set()

    def caption_key(post) -> str:
        return (post.caption or "").strip().lower()[:120]

    for post in pool:
        tags = hashtags_of(post)
        key = caption_key(post)
        if key and key in seen_captions:
            continue
        if tags and (tags & used_tags):
            continue
        chosen.append(post)
        used_tags |= tags
        if key:
            seen_captions.add(key)
        if len(chosen) >= count:
            return chosen

    picked = {post.shortcode for post in chosen}
    for post in pool:
        if post.shortcode in picked:
            continue
        chosen.append(post)
        picked.add(post.shortcode)
        if len(chosen) >= count:
            break

    return chosen


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", required=True, help="Perfil OBJETIVO a analizar (sin @).")
    parser.add_argument("--login", help="Cuenta con la que iniciar sesión (sin @). Si se omite, acceso anónimo.")
    parser.add_argument("--sessionfile", help="Archivo de sesión de instaloader (alternativa a --login).")
    parser.add_argument("--top", type=int, default=5, help="Cuántos reels importar (por defecto 5).")
    parser.add_argument("--scan", type=int, default=80, help="Cuántas publicaciones analizar.")
    parser.add_argument(
        "--require",
        help="Hashtags o palabras que debe contener el caption, separados por comas.",
    )
    parser.add_argument("--env-file", default=".env.local")
    parser.add_argument("--dry-run", action="store_true", help="Solo analiza, no escribe nada.")
    args = parser.parse_args()

    try:
        import instaloader
    except ImportError:
        sys.exit("Falta instaloader. Instálalo con:  python -m pip install instaloader")

    loader = instaloader.Instaloader(
        quiet=True, max_connection_attempts=3, request_timeout=30
    )

    # La cuenta con la que se entra puede ser distinta del perfil objetivo.
    if args.sessionfile:
        loader.load_session_from_file(args.login or args.profile, args.sessionfile)
        print(f"Sesión cargada desde {args.sessionfile}.")
    elif args.login:
        print(f"Iniciando sesión como {args.login} (se pedirá la contraseña)...")
        try:
            loader.interactive_login(args.login, ask_for_password=True)
        except instaloader.exceptions.BadCredentialsException:
            sys.exit("Credenciales incorrectas.")
        except instaloader.exceptions.ConnectionException as error:
            sys.exit(f"Instagram bloqueó la conexión: {error}")
    else:
        print("Sin sesión: se intentará el acceso anónimo (Instagram suele bloquearlo).")

    try:
        profile = instaloader.Profile.from_username(loader.context, args.profile)
    except instaloader.exceptions.ProfileNotExistsException:
        sys.exit(f"El perfil {args.profile} no existe.")
    except instaloader.exceptions.LoginRequiredException:
        sys.exit("Instagram exige sesión para ver este perfil. Repite con --login TU_CUENTA.")

    print(f"Analizando hasta {args.scan} publicaciones...")
    reels = []
    try:
        for index, post in enumerate(profile.get_posts()):
            if index >= args.scan:
                break
            if post.is_video:
                reels.append(post)
    except Exception as error:  # noqa: BLE001 - se informa y se sigue con lo que haya
        print(f"Aviso: se cortó la lectura ({error}). Se usa lo leído hasta ahora.")

    if not reels:
        sys.exit("No se encontraron reels. ¿El perfil es público?")

    # Filtro de temática opcional: el reel debe contener alguno de los hashtags o palabras.
    if args.require:
        wanted = {
            token.strip().lower().lstrip("#")
            for token in args.require.split(",")
            if token.strip()
        }
        before = len(reels)
        reels = [post for post in reels if (hashtags_of(post) | words_of(post)) & wanted]
        print(f"Filtro --require: {len(reels)} de {before} reels coinciden con {sorted(wanted)}.")
        if not reels:
            sys.exit("Ningún reel coincide con --require.")

    reels.sort(key=score, reverse=True)
    chosen = pick_diverse(reels, args.top)
    chosen_codes = {post.shortcode for post in chosen}

    print(
        f"\n{'posición':<9}{'reproducciones':>15}{'me gusta':>11}{'comentarios':>13}"
        f"  {'hashtags':<26}enlace"
    )
    for position, post in enumerate(reels, start=1):
        marker = " *" if post.shortcode in chosen_codes else ""
        views = getattr(post, "video_view_count", 0) or 0
        tags = ",".join(sorted(hashtags_of(post))) or "-"
        print(
            f"{position:<9}{views:>15,}{post.likes:>11,}{post.comments:>13,}  "
            f"{tags[:24]:<26}https://www.instagram.com/reel/{post.shortcode}/{marker}"
        )

    if args.dry_run:
        print("\n--dry-run: no se escribió nada.")
        return

    env = load_env(args.env_file)
    base = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    key = env.get("SUPABASE_SECRET_KEY", "")
    if not base or not key:
        sys.exit("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en el entorno.")

    block_rows = rest(base, key, "GET", "/rest/v1/blocks?select=id,data&page=eq.galeria&type=eq.reels")
    if not block_rows:
        sys.exit("No existe el bloque de reels en la página 'galeria'.")
    block = block_rows[0]
    block_data = block["data"]

    items = []
    for post in chosen:
        cover = getattr(post, "display_url", None) or getattr(post, "url", None)
        path = f"reels/{post.shortcode}.jpg"
        try:
            content = download(cover)
        except Exception as error:  # noqa: BLE001
            print(f"  ✖ {post.shortcode}: no se pudo bajar la miniatura ({error}). Se salta.")
            continue

        upload(base, key, path, content, "image/jpeg")
        rest(
            base,
            key,
            "POST",
            "/rest/v1/media",
            [{"path": path, "filename": f"{post.shortcode}.jpg",
              "content_type": "image/jpeg", "size_bytes": len(content)}],
        )

        caption = (post.caption or "").strip().splitlines()
        title = caption[0][:100] if caption else None
        items.append({
            "id": f"ig-{post.shortcode}",
            "platform": "instagram",
            "url": f"https://www.instagram.com/reel/{post.shortcode}/",
            "title": title,
            "thumbnail": {"path": path, "alt": f"Reel de Instagram de {profile.full_name or args.profile}"},
            "enabled": True,
        })
        print(f"  ✔ {post.shortcode} -> {path}")

    if not items:
        sys.exit("No se pudo importar ningún reel.")

    block_data["items"] = items
    rest(base, key, "PATCH", f"/rest/v1/blocks?id=eq.{block['id']}", {"data": block_data})
    print(f"\n{len(items)} reel(s) importados al bloque de reels de 'galeria'.")
    print("Recuerda: el sitio cachea el contenido; hay que revalidar (guardar en el panel) o "
          "`npm run clean` en local para verlo.")


if __name__ == "__main__":
    main()
