"""Приём заявок с лендинга keycontent.ru и отправка в Telegram-бота.
Telegram с сервера недоступен напрямую, поэтому идём через HTTP-прокси (LEAD_PROXY, контейнер vpn).
"""
import json, os, time, html, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

TOKEN = os.environ["LEAD_BOT_TOKEN"]
CHAT = os.environ["LEAD_CHAT_ID"]
PROXY = os.environ.get("LEAD_PROXY", "")
opener = urllib.request.build_opener(
    urllib.request.ProxyHandler({"https": PROXY, "http": PROXY} if PROXY else {}))

hits = {}  # ip -> [timestamps]; не больше 5 заявок за 10 минут с одного адреса


def limited(ip):
    now = time.time()
    h = [t for t in hits.get(ip, []) if now - t < 600]
    if len(h) >= 5:
        hits[ip] = h
        return True
    h.append(now)
    hits[ip] = h
    return False


def send(text):
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{TOKEN}/sendMessage",
        data=json.dumps({"chat_id": CHAT, "text": text, "parse_mode": "HTML",
                         "disable_web_page_preview": True}).encode(),
        headers={"Content-Type": "application/json"})
    with opener.open(req, timeout=20) as r:
        return r.status == 200


def clean(v, n=300):
    return html.escape(str(v or "").strip()[:n])


class H(BaseHTTPRequestHandler):
    def _reply(self, code, body):
        b = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_POST(self):
        ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        try:
            n = int(self.headers.get("Content-Length", 0))
            if n > 5000:
                return self._reply(413, {"ok": False})
            d = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self._reply(400, {"ok": False})
        if d.get("website"):  # ловушка для ботов: поле скрыто от людей
            return self._reply(200, {"ok": True})
        name, phone = clean(d.get("name"), 100), clean(d.get("phone"), 40)
        if not phone:
            return self._reply(400, {"ok": False, "error": "phone"})
        if limited(ip):
            return self._reply(429, {"ok": False})
        lines = ["🔑 <b>Новая заявка с keycontent.ru</b>", f"Форма: {clean(d.get('form'), 40) or '—'}",
                 f"Имя: {name or '—'}", f"Телефон: {phone}"]
        if d.get("site"):
            lines.append(f"Сайт: {clean(d.get('site'), 200)}")
        if d.get("message"):
            lines.append(f"Сообщение: {clean(d.get('message'), 1000)}")
        try:
            send("\n".join(lines))
        except Exception as e:
            print("telegram error:", type(e).__name__, flush=True)
            return self._reply(502, {"ok": False})
        self._reply(200, {"ok": True})

    def log_message(self, *a):
        pass


ThreadingHTTPServer(("0.0.0.0", 8095), H).serve_forever()
