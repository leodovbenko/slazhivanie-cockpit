# Исходники OG-превью (social share cards)

Картинки соц-превью `site/og.png` и `site/og-webinar.png` собираются из HTML-шаблонов
здесь. Раньше источником был `og.svg` со старым логотипом (синяя «диафрагма») —
он удалён. Текущий бренд: кремовый знак «Пара» (улыбка + глиняная и зелёная точки),
Fraunces для заголовков, IBM Plex Sans для текста.

## Пересобрать

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for name in og og-webinar; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1200,630 \
    --default-background-color=00000000 --virtual-time-budget=6000 \
    --screenshot="../site/$name.png" "$(pwd)/$name.html"
done
```

Размер холста 1200×630 (стандарт OG). Шрифты тянутся с Google Fonts — нужен интернет.

## Кэш соц-сетей

При смене содержимого того же файла превью в Telegram/VK/FB держится из кэша.
Поэтому в мета-тегах у общего баннера версия: `og.png?v=2` (бампать при следующей
переделке). Вебинар вынесен в отдельный файл `og-webinar.png` — новый URL, кэша нет.
Принудительно освежить: Telegram — `@WebpageBot` (кнопка «Update with content»);
VK — vk.com/dev/pages.clearCache; Facebook — Sharing Debugger.
