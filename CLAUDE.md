# CLAUDE.md

이 파일은 이 저장소에서 코드 작업 시 Claude Code(claude.ai/code)에게 제공하는 안내입니다.

## 명령어

프론트엔드 (Next.js 16, 패키지 매니저: pnpm):

```bash
pnpm dev      # Next 개발 서버 (기본 포트 3000)
pnpm build    # 프로덕션 빌드
pnpm start    # 프로덕션 빌드 실행
```

`lint` 또는 `test` 스크립트는 없습니다. 타입 검사는 `pnpm exec tsc --noEmit`으로 수동 실행합니다.

백엔드 (Python FastAPI 에이전트, `server/agent.py`, 기본 포트 8000):

```bash
pip install -r server/requirements.txt
python server/agent.py                              # echo 모드
OPENAI_API_KEY=sk-xxx python server/agent.py        # gpt-4o-mini 사용
```

프론트엔드는 에이전트가 실행 중이어야 합니다. `.env.local`에 `NEXT_PUBLIC_AGUI_AGENT_URL`을 정의해야 하며 (미설정 시 기본값: `http://localhost:8000/agent`).

## 아키텍처

이 저장소는 두 프로세스로 구성된 데모입니다: assistant-ui 채팅 UI를 호스팅하는 Next.js 클라이언트와 SSE로 응답을 스트리밍하는 Python AG-UI 에이전트입니다. 핵심 부분은 이 둘이 연결되는 경계입니다.

**런타임 브리지 (`app/MyRuntimeProvider.tsx`).** 전체를 이어주는 중심 글루 코드입니다. `@ag-ui/client`의 `HttpAgent`를 에이전트 URL에 연결해 생성하고, `@assistant-ui/react-ag-ui`의 `useAgUiRuntime`으로 감싼 뒤 `AssistantRuntimeProvider`를 통해 노출합니다. `currentThreadId`가 변경될 때마다 새 `HttpAgent`가 생성되며, threadId는 요청 시점이 아닌 에이전트 생성 시점에 바인딩됩니다.

**멀티 스레드 상태는 클라이언트 전용입니다.** 스레드는 ref(`threadsRef`)에 보관된 `Map`에 저장되며 영속성은 없습니다. 커스텀 `threadListAdapter`는 해당 맵을 기반으로 `onSwitchToNewThread` / `onSwitchToThread`를 구현하고, `runtime.thread.subscribe` 이펙트가 변경 시마다 메시지를 맵에 스냅샷합니다. Python 서버는 `threadId`를 불투명한 태그로 처리하며(로깅하지만 서버측 히스토리는 유지하지 않음), 대화 연속성은 클라이언트가 전체 메시지 목록을 재전송하는 방식으로 유지됩니다.

**클라이언트 사이드 도구 (`app/page.tsx`).** 도구는 스레드의 형제 컴포넌트로 마운트된 `BrowserAlertTool` 내에서 `useAssistantTool`로 등록됩니다. `execute`는 브라우저에서 실행되며 반환값은 `render` prop을 통해 렌더링됩니다. AG-UI 에이전트 자체는 tool-call 이벤트를 내보내는 것 외에는 이 도구들에 대해 알 필요가 없습니다.

**서버의 AG-UI 프로토콜 (`server/agent.py`).** `/agent` POST 엔드포인트는 JSON 이벤트의 `text/event-stream`을 반환합니다: `RUN_STARTED` → `TEXT_MESSAGE_START` → 반복적인 `TEXT_MESSAGE_CONTENT`(`delta` 포함) → `TEXT_MESSAGE_END` → `RUN_FINISHED`(또는 `RUN_ERROR`). 이벤트 헬퍼는 `create_event()`입니다. 두 가지 백엔드가 연결되어 있습니다: `echo_agent`(기본값)와 `openai_agent`(`OPENAI_API_KEY` 설정 시 선택). 에이전트를 확장할 때(예: tool-call 이벤트 추가) 이 이벤트 이름 형태를 유지하세요 — 클라이언트의 AG-UI 어댑터가 이를 소비합니다.

**UI 레이어.** `components/assistant-ui/*`는 assistant-ui 레지스트리의 shadcn 레지스트리 컴포넌트입니다(`components.json`의 `registries["@assistant-ui"]`에 설정됨). `components/ui/*`는 표준 shadcn 프리미티브입니다(스타일: new-york, 기본 색상: zinc). 경로 별칭 `@/*`는 저장소 루트로 해석됩니다.

## 알아두면 유용한 관례

- 루트 레이아웃에 `export const dynamic = "force-dynamic"`이 적용된 App Router — 채팅 화면은 정적으로 렌더링되지 않습니다.
- Tailwind v4 (`@tailwindcss/postcss`), `tailwind.config.*` 없음 — 설정은 `app/globals.css`에 있습니다.
- React 19 + Next 16; 런타임 프로바이더와 페이지에 `"use client"`가 필요합니다.
- `.env.local`이 로컬 설정의 기준 파일이며, `server/agent.py`는 `python-dotenv`를 통해 `.env.local`과 `.env`를 모두 로드합니다.

## gstack

웹 브라우징은 모두 gstack의 `/browse` 스킬을 사용하세요. `mcp__claude-in-chrome__*` 도구는 절대 사용하지 마세요.

사용 가능한 gstack 스킬:

- `/office-hours`
- `/plan-ceo-review`
- `/plan-eng-review`
- `/plan-design-review`
- `/design-consultation`
- `/design-shotgun`
- `/design-html`
- `/review`
- `/ship`
- `/land-and-deploy`
- `/canary`
- `/benchmark`
- `/browse`
- `/connect-chrome`
- `/qa`
- `/qa-only`
- `/design-review`
- `/setup-browser-cookies`
- `/setup-deploy`
- `/setup-gbrain`
- `/retro`
- `/investigate`
- `/document-release`
- `/document-generate`
- `/codex`
- `/cso`
- `/autoplan`
- `/plan-devex-review`
- `/devex-review`
- `/careful`
- `/freeze`
- `/guard`
- `/unfreeze`
- `/gstack-upgrade`
- `/learn`
