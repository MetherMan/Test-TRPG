# TRPG Base System Report

작성일: 2026-02-19  
대상 프로젝트: `TRPG 베이스`  
기준 코드: `meranoder_plasma_helper_3pc_d20.html`, `meranoder_plasma_helper_3pc_d20.js`, `server.js`

## 1) 프로젝트 개요
- 단일 페이지 기반 TRPG 운영 도구.
- 3인 플레이어 시트(PC1~PC3) + GM 밸런스 + 몬스터 운영 + 실시간 세션 동기화.
- 전투/판정/인벤토리/상태이상/부위 손상/채팅/귓속말까지 한 시스템에서 처리.
- 서버는 `Express + Socket.IO`, 클라이언트는 순수 HTML/CSS/JS.

## 2) 런타임 아키텍처
- 서버:
  - 정적 파일 서빙 + 실시간 상태 브로드캐스트.
  - 룸 단위 상태 관리(`roomId` 기반).
  - 상태 파일 영속화(`realtime_state.json`) + 백업 폴더 순환.
- 클라이언트:
  - 단일 상태 객체(`state`) 중심 렌더링.
  - GM/유저 모드 전환.
  - 입력 -> 계산 -> 렌더 -> (권한에 따라) 서버 동기화.

## 3) 핵심 데이터 구조(요약)
- 전역 상태(`state`) 주요 필드:
  - `k`: GM 계산 계수
  - `pcs[3]`: 플레이어 데이터
  - `itemTemplates`, `npcTemplates`, `monsterTemplates`
  - `activeMonsters`, `publishedActiveMonsters`
  - `encounter`, `publishedEncounter`
  - `logs`, `syncVersion`, `dc`, `enemyEva`, `showDcToUsers`, `theme`
- PC 주요 필드:
  - 기본 스탯: `hp/str/dex/int/plasmaPower/cha/pool`
  - 전투 상태: `plasmaNow/plasmaMax/plasmaCap/alwaysHit/skipTurns`
  - 행동 상태: `type/distance/shape/intensity/multi/plasmaLayers`
  - 부가 상태: `statusEffects/hunger/injuryMap/skillPoints/gold/inventory/memo/avatar`

## 4) GM 기능(구현됨)
- 전투 기준값:
  - 기본 DC, 적 회피 보정, DC 공개 여부 토글.
- GM 밸런스 계수:
  - 강도/형태 보정, 플라즈마 리스크, 특성 보너스 채널, 기본 환산 계수 채널.
- 몬스터:
  - 몬스터 템플릿 생성/수정/삭제.
  - 전투 대상 모드:
    - `single`(공용 단일)
    - `swarm`(무리)
    - `per_player`(플레이어별)
  - 전투 적용/숨김(publish/hide).
  - 몬스터 이미지 업로드.
  - 런타임 몬스터 리스트/포커스/부위 손상 편집.
- 플레이어 관리:
  - HP/회복/스탯/플라즈마/골드/포인트 조정.
  - 플레이어 아바타 업로드.
  - 상태이상 직접 부여/초기화.
- 인벤 운영:
  - 아이템 템플릿 생성/수정/삭제/지급.
  - 대상 플레이어 인벤토리 검사/소모/삭제/골드 조정.
  - 템플릿/인벤 정렬(가나다 기준) 반영됨.
- 동행 NPC:
  - NPC 추가/삭제/템플릿 저장/불러오기/삭제.
  - NPC HP/플라즈마/메모/이미지/부위 손상 관리.
- 세션/동기화:
  - 로컬 저장/불러오기, 로컬 상태 강제 푸시.
  - JSON 내보내기/가져오기.
  - 테마 커스터마이징(색상, 텍스처 파라미터, 배경 이미지).

## 5) 플레이어 기능(구현됨)
- 본인 캐릭터 조작:
  - 이름 변경, 포인트 분배, 행동 설정, 판정 실행, 메모 작성.
- 행동 설정:
  - 빠른 프리셋 버튼(물리 기본/플라즈마 단일/플라즈마 범위/아이템).
  - 현재 행동 요약 표시.
  - 고급 상세 접기(플라즈마 에너지/레이어/상세 규칙).
- 인벤토리:
  - 필터(전체/아이템/소모품), 대상 선택.
  - 동작: `사용`, `주기`, `버리기`.
- 커뮤니케이션:
  - 세션 채팅, GM 귓속말.
- 동기화:
  - 유저 행동 설정 변경을 서버에 별도 동기화(`user_update_action_state`)하여 덮어쓰기 문제 완화.

## 6) 전투/판정 시스템(현재 구현 로직)
- 주사위:
  - 적중: 고정 `1d20`
  - 피해: 선택형 `1d4/1d6/1d8/1d12/1d20`
  - 3D 다이스 렌더 포함.
- 공격 유형:
  - `physical`, `plasma`, `item`
- 형태:
  - 물리: `physical_all_in`, `physical_precise`
  - 플라즈마: `single`, `spread`, `place`, `stabilize`
  - 아이템: `item_instant`
- 거리:
  - `ultra_close`, `close`, `normal`, `far`, `very_far`
- 플라즈마:
  - 사용량/강도/레이어 누적에 따른 보정 및 리스크 반영.
  - 안정화(stabilize) 조건 충족 시 추가 처리(리스크/휴식/집중 상태 관련).
- 판정 로그:
  - 채팅 로그와 별도로 roll 결과 기록.

## 7) 상태이상/부위 손상
- 상태이상 키 다수 지원(기절/침묵/실명/골절/중독/화상/동상/감전/출혈/허기/정신집중 등).
- 부위 손상 맵(`injuryMap`) 지원:
  - 플레이어/몬스터/NPC 각각 부위별 단계값 관리.
  - `injury_body_map.js` 기반 보드 UI 사용.

## 8) 인벤토리/템플릿/NPC/몬스터 정렬 및 표시
- 인벤토리 정렬:
  - 이름 우선 가나다 정렬(동률 시 타입/ID).
- 아이템 템플릿 정렬:
  - 관리자 템플릿 목록/선택 모두 가나다 정렬.
- 관리자 인스펙트 인벤토리:
  - 동일 정렬 기준 적용.

## 9) 실시간 통신(Socket.IO) 이벤트
- 클라이언트 -> 서버:
  - `join_room`
  - `user_spend_point`
  - `user_rename_self`
  - `user_update_memo`
  - `user_update_action_state`
  - `user_inventory_action`
  - `user_use_plasma`
  - `user_consume_skip_turn`
  - `whisper_to_gm`
  - `gm_whisper_reply`
  - `chat_send`
  - `roll_outcome`
  - `admin_clear_logs`
  - `admin_update_state`
- 서버 -> 클라이언트:
  - `room_state`
  - `whisper_state`
  - `client_meta`
  - `presence_update`
  - `server_notice`

## 10) 권한/보안/접속
- 초대 토큰 기반 접근:
  - URL 쿼리 + 쿠키 기반 인증 흐름.
  - 토큰 파일: `invite_token.txt`
- 역할:
  - `admin` / `user`
  - 서버에서 이벤트별 역할/슬롯 검증 수행.
- 관리자 전환:
  - 클라이언트에서 관리자 잠금/해제 세션 캐시 로직 존재.
- 공개 공유:
  - `run_public_share.bat`로 Cloudflare Tunnel 연동 가능.

## 11) 저장/백업/복구
- 실시간 상태:
  - 서버 메모리 상태 -> `realtime_state.json` 주기 저장.
- 백업:
  - `backups/`에 timestamp 백업 + latest 백업 유지/순환.
- 로컬 저장:
  - 클라이언트 localStorage 기본/경량 스냅샷 저장 경로 분리.

## 12) 최근 반영 사항(현재 코드 기준)
- 유저 행동 설정 서버 동기화 이벤트 추가(`user_update_action_state`).
- 인벤토리/템플릿 가나다 정렬 반영.
- 유저 인벤 액션을 `사용/주기/버리기`로 구성.
- 행동 설정 UI 단순화:
  - 프리셋 버튼
  - “이번 행동” 요약
  - 플라즈마 상세를 고급 접기 영역으로 분리

## 13) 다음 설계 논의용 포인트(타 모델/팀 공유 권장)
- 거리 상태를 유저 입력이 아닌 GM 전용 통제로 전환할지.
- 플라즈마 스킬 개인 템플릿(유저별 프리셋 저장/호출) 도입 방식.
- 부위 타격 선택권(유저 선택/GM 지정/랜덤) 운영 규칙의 기본값.
- 전투 턴 절차를 명시적으로 강제할지(선언 -> 소모확정 -> 적중 -> 피해 -> 후처리).

