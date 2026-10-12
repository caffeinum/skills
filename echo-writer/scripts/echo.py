#!/usr/bin/env python3
"""Send one prompt to Echo (echo.fulcrum.inc), a writing model that takes a persona.

  echo.py "Rewrite this button label: Continue without AI features"
  cat draft.md | echo.py --persona "E. B. White" "Tighten this page, keep every fact:"
  echo.py --check            # is a key configured? (never prints it)

The prompt is the positional argument, stdin, or both (argument first, then stdin).
Prints only the reply text. Exits non-zero with the API's own error on failure.
"""
import argparse, json, os, sys, urllib.error, urllib.request

API = os.environ.get("ECHO_BASE_URL", "https://echo.fulcrum.inc/api/v1").rstrip("/")
DEFAULT_PERSONA = os.environ.get("ECHO_PERSONA", "Julia Evans")
KEY_FILES = ["~/.config/echo/key", "~/.config/vibeos-writer/echo_key"]


def find_key():
    if os.environ.get("ECHO_API_KEY", "").strip():
        return os.environ["ECHO_API_KEY"].strip(), "$ECHO_API_KEY"
    for path in KEY_FILES:
        p = os.path.expanduser(path)
        if os.path.isfile(p):
            key = open(p).read().strip()
            if key:
                return key, path
    sys.exit("echo.py: no Echo key. Set $ECHO_API_KEY or put the key in "
             + " or ".join(KEY_FILES) + " (one line, nothing else).")


def ask(prompt, persona, key, timeout):
    body = json.dumps({"model": "echo", "input": prompt, "persona": persona}).encode()
    req = urllib.request.Request(API + "/responses", body,
                                 {"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    try:
        data = json.load(urllib.request.urlopen(req, timeout=timeout))
    except urllib.error.HTTPError as e:
        sys.exit(f"echo.py: HTTP {e.code} from Echo: {e.read().decode(errors='replace')[:500]}")
    except urllib.error.URLError as e:
        sys.exit(f"echo.py: could not reach {API}: {e.reason}")
    # output[] holds a reasoning item first, then the message; keep only text parts
    parts = [c["text"] for o in data.get("output", []) for c in (o.get("content") or []) if c.get("text")]
    if not parts:
        sys.exit("echo.py: Echo answered with no text: " + json.dumps(data)[:500])
    return "\n".join(parts).strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("prompt", nargs="?", default="")
    ap.add_argument("--persona", default=DEFAULT_PERSONA, help=f"writer to write as (default: {DEFAULT_PERSONA})")
    ap.add_argument("--timeout", type=int, default=600)
    ap.add_argument("--check", action="store_true", help="report where the key comes from, then exit")
    a = ap.parse_args()
    key, source = find_key()
    if a.check:
        print(f"key found in {source}; endpoint {API}; default persona {DEFAULT_PERSONA}")
        return
    stdin = "" if sys.stdin.isatty() else sys.stdin.read()
    prompt = "\n\n".join(x for x in (a.prompt.strip(), stdin.strip()) if x)
    if not prompt:
        ap.error("give a prompt as an argument or on stdin")
    print(ask(prompt, a.persona, key, a.timeout))


if __name__ == "__main__":
    main()
