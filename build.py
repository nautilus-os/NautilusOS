import base64
import mimetypes
import pathlib
import re
import urllib.parse
import urllib.request
import shutil

root = pathlib.Path(__file__).resolve().parent
index_path = root / "index.html"
output_dir = root / "NautilusOS-OneFile"
output_path = output_dir / "index.html"
placeholder_path = output_dir / "placeholder-deleteme"
cache = {}


def fetch_bytes(url):
    if url not in cache:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp:
            cache[url] = resp.read()
    return cache[url]


def inline_remote_css(url):
    css = fetch_bytes(url).decode("utf-8")

    def repl(match):
        target = match.group(1).strip().strip("\"'")
        if target.startswith("data:"):
            return match.group(0)
        asset_url = urllib.parse.urljoin(url, target)
        data = fetch_bytes(asset_url)
        mime = mimetypes.guess_type(asset_url)[0] or "application/octet-stream"
        encoded = base64.b64encode(data).decode("ascii")
        return f"url('data:{mime};base64,{encoded}')"

    css = re.sub(r"url\(([^)]+)\)", repl, css)
    return f"<style>\n{css}\n</style>"


def inline_local_file(path):
    full_path = root / path.lstrip("/")
    return full_path.read_text(encoding="utf-8")


index_text = index_path.read_text(encoding="utf-8")



def inline_local_assets(css_text, css_file_path):
    def repl(match):
        target = match.group(1).strip().strip("\"'")
        if target.startswith("data:") or target.startswith("#"):
            return match.group(0)
        
        if target.startswith("http://") or target.startswith("https://"):
            return match.group(0)

        asset_path = (css_file_path.parent / target).resolve()
        
        try:
            if not asset_path.exists():
                print(f"Warning: Asset not found: {asset_path}")
                return match.group(0)
            
            data = asset_path.read_bytes()
            mime = mimetypes.guess_type(asset_path)[0] or "application/octet-stream"
            encoded = base64.b64encode(data).decode("ascii")
            return f"url('data:{mime};base64,{encoded}')"
        except Exception as e:
            print(f"Failed to inline {asset_path}: {e}")
            return match.group(0)

    return re.sub(r"url\(([^)]+)\)", repl, css_text)


def replace_stylesheet(match):
    href = match.group(1)
    if href.startswith("http://") or href.startswith("https://"):
        return inline_remote_css(href)
    
    css_path = root / href.lstrip("/")
    css = css_path.read_text(encoding="utf-8")
    css = inline_local_assets(css, css_path)
    return f"<style>\n{css}\n</style>"


link_pattern = re.compile(r'<link\s+[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\'][^>]*>', re.IGNORECASE)
index_text = re.sub(link_pattern, replace_stylesheet, index_text)


def replace_script(match):
    src = match.group(1)
    if src.startswith("http://") or src.startswith("https://"):
        script_text = fetch_bytes(src).decode("utf-8")
    else:
        script_text = inline_local_file(src)
    return f"<script>\n{script_text}\n</script>"


script_pattern = re.compile(r'<script\s+[^>]*src=["\']([^"\']+)["\'][^>]*></script>', re.IGNORECASE)
index_text = re.sub(script_pattern, replace_script, index_text)


output_dir.mkdir(parents=True, exist_ok=True)
if placeholder_path.exists():
    if placeholder_path.is_file():
        placeholder_path.unlink()
    elif placeholder_path.is_dir():
        shutil.rmtree(placeholder_path)
output_path.write_text(index_text, encoding="utf-8")
print(f"Wrote {output_path}")
