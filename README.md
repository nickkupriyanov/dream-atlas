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
- Production-compatible `/api/analyze-dream` route в `api/analyze-dream.ts`.
- Vite dev middleware использует тот же server handler во время разработки.
- Интеграция с Timeweb Agent через OpenAI-compatible API.
- Локальный fallback-анализ, если `TIMEWEB_OPENAI_BASE_URL` или `TIMEWEB_AGENT_TOKEN` не заданы.
- Поиск по тексту записи и AI-слоям анализа.
- Редактирование title, date, mood и удаление записей.
- Первый Atlas View с агрегацией symbols, emotions, places, characters и recurring themes.
- Мобильные режимы List / Write / Insights / Atlas вместо одной длинной страницы.
- Локальный autosave indicator и быстрый capture mode для записи сна.
- Фильтры списка по date, mood, theme и analysis status.
- Экспорт дневника в JSON или Markdown и импорт локального JSON backup.
- Weekly digest, похожие прошлые сны и личные заметки к AI-интерпретации.
- Статусы AI-символов: personal, questionable, wrong.

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
- [x] Подключить AI-анализ со строгим структурированным JSON-ответом.
- [x] Добавить локальный fallback без agent credentials.
- [x] Сохранить анализ вместе с записью.
- [x] Добавить базовые действия с записями: удалить, переименовать, изменить дату, изменить mood.
- [x] Сделать поиск по title, text, symbols, places, characters и themes.
- Обновить empty/error/loading states так, чтобы они помогали пользователю, а не выглядели как технические заглушки.
- [x] Добавить production-ready API deployment path вне Vite dev middleware.

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
- [x] Добавить экспорт данных в JSON или Markdown.
- [x] Добавить импорт локального backup.

Критерий готовности: приложение не только красиво выглядит, но и выдерживает регулярное использование.

### Phase 4: Memory and Reflection

Цель: превратить набор записей в личную систему наблюдений.

- [x] Еженедельный дайджест снов.
- [x] "You may be circling..." insights на основе повторяющихся паттернов.
- [x] Сравнение текущего сна с похожими прошлыми снами.
- [x] Ручные заметки пользователя к AI-интерпретации.
- [x] Возможность помечать символы как личные, спорные или неверные.

Критерий готовности: AI не просто выдает интерпретацию, а учится вокруг личного языка пользователя.

### Phase 5: Polish and Trust

Цель: подготовить основу для приватного бета-релиза.

- [x] Privacy-first copy: данные снов чувствительные, это должно быть явно отражено в продукте.
- [x] Настройки хранения и удаления данных.
- [x] Тесты для store, анализа, import/export validation, atlas aggregation и ключевых UI flows.
- Accessibility pass: keyboard navigation, focus states, contrast, screen reader labels. Started with pressed states, text-area labels, progress semantics and clearer button labels.
- [x] Production deployment path.
- [x] Нормальная документация для запуска, AI config и архитектуры. Started with private beta release checklist.

Критерий готовности: проект можно дать первому пользователю без ощущения "это просто демо".

## Архитектура

Ключевые файлы:

- `src/App.tsx` - основной layout приложения.
- `src/store/dreamStore.ts` - Zustand store, persistence, создание и обновление снов.
- `src/types/dream.ts` - доменная модель сна и анализа.
- `src/api/analyzeDreamClient.ts` - клиентский вызов анализа.
- `src/server/dreamAnalysis.ts` - общий server handler для AI анализа и fallback.
- `api/analyze-dream.ts` - production-compatible API route для Vercel.
- `src/components/DreamList.tsx` - список записей.
- `src/components/DreamEditor.tsx` - редактор выбранного сна.
- `src/components/InsightsPanel.tsx` - панель анализа одного сна.
- `src/components/AtlasPanel.tsx` - агрегированная карта мотивов по всем снам.
- `src/utils/dreamSignature.ts` - визуальная подпись сна на основе эмоций.
- `src/utils/dreamAtlas.ts` - агрегация symbols, emotions, places, characters и themes.

## Development

Recommended runtime: Node.js 18.18+; Node 20 LTS is preferred for deploys.

```bash
npm install
npm run dev
```

AI config:

```bash
cp .env.example .env
```

Then set the Timeweb agent credentials in `.env`:

```bash
TIMEWEB_AGENT_TOKEN=...
TIMEWEB_OPENAI_BASE_URL=https://agent.timeweb.cloud/api/v1/cloud-ai/agents/.../v1
```

If `TIMEWEB_OPENAI_BASE_URL` or `TIMEWEB_AGENT_TOKEN` is omitted, `/api/analyze-dream` returns a deterministic local fallback analysis so the app remains usable during development.

Timeweb setup:

- Use the prompt and panel values from [docs/timeweb-agent-setup.md](/Users/nickkupriyanov/Documents/LLM%20Projects/Dream%20Atlas/dream-atlas/docs/timeweb-agent-setup.md).
- The server route calls the Timeweb OpenAI-compatible API and validates the returned JSON before saving it.

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Tests:

```bash
npm run test
```

Privacy and storage:

- Dream notes are persisted locally in this browser through Zustand/localStorage.
- JSON and Markdown export are available from the Backup panel.
- The Privacy panel can delete the local journal from the current browser after confirmation.
- AI analysis sends only the selected dream text to `/api/analyze-dream`; without `TIMEWEB_OPENAI_BASE_URL` or `TIMEWEB_AGENT_TOKEN`, the route uses the deterministic local fallback.

Private beta release:

- See `docs/private-beta-release.md` for environment, deployment, verification and beta trust checklist.
- See `docs/beta-feedback-template.md` for first-user feedback prompts.

## Следующий лучший шаг

Самый полезный следующий шаг: провести первый реальный private beta QA session.

Это значит:

1. Пройти основной сценарий с клавиатуры и на мобильном viewport.
2. Дать приложение первому пользователю вместе с beta feedback template.
3. По результатам QA закрыть найденные accessibility, copy и trust gaps.
