# Dream Atlas

AI Dream Journal: красивый дневник снов, который превращает записи в карту образов, эмоций, повторяющихся мотивов и символов.

Dream Atlas должен ощущаться не как обычный note-taking app с кнопкой "AI", а как личный атлас внутренней жизни: человек записывает сон, система бережно извлекает образы, эмоциональный тон, места, персонажей и повторяющиеся темы, а затем показывает, как эти элементы возвращаются во времени.

## Текущее состояние

Проект сейчас находится на стадии сильного фронтенд-прототипа:

- React + TypeScript + Vite.
- Tailwind CSS для темной визуальной системы.
- Zustand persist для локального хранения дневника.
- Список снов, редактор записи и панель AI insights.
- Моковые записи, которые задают тон продукта.
- Dev endpoint `/api/analyze-dream` в `vite.config.ts`.
- Локальный fallback-анализ, если `OPENAI_API_KEY` не задан.
- Поиск по тексту записи и AI-слоям анализа.
- Редактирование title, date, mood и удаление записей.
- Первый Atlas View с агрегацией symbols, emotions, places, characters и recurring themes.
- Мобильные режимы List / Write / Insights / Atlas вместо одной длинной страницы.
- Локальный autosave indicator и быстрый capture mode для записи сна.
- Фильтры списка по date, mood, theme и analysis status.

## Продуктовое ядро

Главный цикл MVP:

1. Пользователь быстро записывает сон после пробуждения.
2. AI возвращает структурированный анализ: summary, tone, emotions, symbols, places, characters, recurringThemes.
3. Запись сохраняется вместе с анализом.
4. Dream Atlas строит карту повторяющихся мотивов по всем снам.
5. Пользователь видит не отдельный "разбор сна", а долгую динамику своих образов и состояний.

## Роадмап

### Phase 1: Working AI Journal

Цель: превратить красивый прототип в реально работающий дневник.

- [x] Реализовать dev endpoint `/api/analyze-dream`.
- [x] Подключить AI-анализ со строгой JSON-схемой ответа.
- [x] Добавить локальный fallback без API key.
- [x] Сохранить анализ вместе с записью.
- [x] Добавить базовые действия с записями: удалить, переименовать, изменить дату, изменить mood.
- [x] Сделать поиск по title, text, symbols, places, characters и themes.
- Обновить empty/error/loading states так, чтобы они помогали пользователю, а не выглядели как технические заглушки.
- Добавить production-ready API deployment path вне Vite dev middleware.

Критерий готовности: пользователь может создать сон, проанализировать его, найти позже и увидеть сохраненный анализ после перезагрузки.

### Phase 2: Atlas View

Цель: добавить то, ради чего приложение называется Atlas.

- [x] Сделать отдельный режим или панель "Atlas".
- [x] Агрегировать symbols, emotions, places, characters и recurringThemes по всем снам.
- [x] Показывать частотность и последние появления символов.
- [x] Добавить emotion timeline по датам.
- [x] Добавить связи "symbol -> dreams" и "theme -> dreams".
- [x] Сделать быстрый переход из элемента карты к связанным снам.
- [x] Добавить раскрытие всех связанных снов для каждого элемента, а не только переход к последнему.
- [x] Добавить фильтр по типу сигнала: emotions, symbols, themes, places, people.

Критерий готовности: по накопленным записям видно, какие мотивы возвращаются и как меняется эмоциональный фон.

### Phase 3: Daily UX

Цель: сделать продукт удобным для ежедневного использования.

- [x] Переработать mobile UX: список, редактор и insights должны быть отдельными понятными состояниями, а не длинной вертикальной страницей.
- [x] Добавить autosave indicator.
- [x] Добавить быстрый morning capture mode: минимум UI, максимум места для текста.
- [x] Добавить фильтры по датам, настроению, темам и наличию анализа.
- Добавить экспорт данных в JSON или Markdown.
- Добавить импорт локального backup.

Критерий готовности: приложение не только красиво выглядит, но и выдерживает регулярное использование.

### Phase 4: Memory and Reflection

Цель: превратить набор записей в личную систему наблюдений.

- Еженедельный дайджест снов.
- "You may be circling..." insights на основе повторяющихся паттернов.
- Сравнение текущего сна с похожими прошлыми снами.
- Ручные заметки пользователя к AI-интерпретации.
- Возможность помечать символы как личные, спорные или неверные.

Критерий готовности: AI не просто выдает интерпретацию, а учится вокруг личного языка пользователя.

### Phase 5: Polish and Trust

Цель: подготовить основу для приватного бета-релиза.

- Privacy-first copy: данные снов чувствительные, это должно быть явно отражено в продукте.
- Настройки хранения и удаления данных.
- Тесты для store, анализа и atlas aggregation.
- Accessibility pass: keyboard navigation, focus states, contrast, screen reader labels.
- Production deployment path.
- Нормальная документация для запуска, AI config и архитектуры.

Критерий готовности: проект можно дать первому пользователю без ощущения "это просто демо".

## Архитектура

Ключевые файлы:

- `src/App.tsx` - основной layout приложения.
- `src/store/dreamStore.ts` - Zustand store, persistence, создание и обновление снов.
- `src/types/dream.ts` - доменная модель сна и анализа.
- `src/api/analyzeDreamClient.ts` - клиентский вызов анализа.
- `src/components/DreamList.tsx` - список записей.
- `src/components/DreamEditor.tsx` - редактор выбранного сна.
- `src/components/InsightsPanel.tsx` - панель анализа одного сна.
- `src/components/AtlasPanel.tsx` - агрегированная карта мотивов по всем снам.
- `src/utils/dreamSignature.ts` - визуальная подпись сна на основе эмоций.
- `src/utils/dreamAtlas.ts` - агрегация symbols, emotions, places, characters и themes.

## Development

```bash
npm install
npm run dev
```

AI config:

```bash
cp .env.example .env
```

Then set `OPENAI_API_KEY` in `.env`. If the key is omitted, `/api/analyze-dream` returns a deterministic local fallback analysis so the app remains usable during development.

Default model:

```bash
OPENAI_MODEL=gpt-5-mini
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Следующий лучший шаг

Самый полезный следующий шаг: завершить Phase 3 data portability и затем вынести `/api/analyze-dream` в production-ready backend/deployment target.

Это значит:

1. Добавить экспорт данных в JSON или Markdown.
2. Добавить импорт локального backup с валидацией структуры.
3. После этого вынести `/api/analyze-dream` в production-ready backend/deployment target.
