from __future__ import annotations

from pathlib import Path
import re

from bs4 import BeautifulSoup, NavigableString


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "meranoder_plasma_helper_3pc_d20.html"


def _clear_direct_text(el) -> None:
    if el is None:
        return
    for node in list(el.children):
        if isinstance(node, NavigableString) and str(node).strip():
            node.extract()


def _set_direct_text(el, text: str) -> None:
    if el is None:
        return
    for node in list(el.children):
        if isinstance(node, NavigableString):
            node.extract()
    el.insert(0, text)


def _set_text(soup: BeautifulSoup, selector: str, text: str) -> None:
    _set_direct_text(soup.select_one(selector), text)


def _set_attr(soup: BeautifulSoup, selector: str, attr: str, value: str) -> None:
    el = soup.select_one(selector)
    if el is not None:
        el[attr] = value


def _set_option_text(soup: BeautifulSoup, select_id: str, value: str, text: str) -> None:
    sel = soup.find("select", id=select_id)
    if sel is None:
        return
    opt = sel.find("option", attrs={"value": value})
    if opt is not None:
        _set_direct_text(opt, text)


def _set_label_for_control(soup: BeautifulSoup, control_id: str, text: str) -> None:
    ctrl = soup.find(id=control_id)
    if ctrl is None:
        return

    label = soup.find("label", attrs={"for": control_id})
    if label is not None:
        _set_direct_text(label, text)
        return

    cur = ctrl
    for _ in range(4):
        parent = cur.parent
        if parent is None:
            break

        label = parent.find("label", recursive=False)
        if label is None:
            label = parent.find("label")
        if label is not None:
            _set_direct_text(label, text)
            return

        cur = parent


def _set_box_title_by_control(soup: BeautifulSoup, control_id: str, text: str) -> None:
    ctrl = soup.find(id=control_id)
    if ctrl is None:
        return
    box = ctrl.find_parent("div", class_="box")
    while box is not None:
        title = box.find("div", class_="t", recursive=False)
        if title is not None:
            _set_direct_text(title, text)
            return
        box = box.find_parent("div", class_="box")


def _cleanup_structural_noise(soup: BeautifulSoup) -> None:
    noisy_ids = [
        "judgeBasicPanel",
        "gmCard",
        "monsterOpsPanel",
        "monsterAdminControls",
        "monsterPanel",
        "realtimePanel",
        "adminTools",
        "gmBalanceControls",
        "adminDrawer",
        "adminInspectPanel",
        "userDrawer",
    ]
    for eid in noisy_ids:
        _clear_direct_text(soup.find(id=eid))

    # select 태그의 option 외 직렬 텍스트 노이즈 제거
    for sel in soup.find_all("select"):
        _clear_direct_text(sel)


def _apply_manual_texts(soup: BeautifulSoup) -> None:
    if soup.title is not None:
        soup.title.string = "메라노더 TRPG: GM 밸런스 + 3인 시트 + 다이스 헬퍼"

    _set_text(soup, "header .headerTitleRow h1", "TRPG 메러맨")
    _set_text(soup, "#judgeBasicPanel .t", "판정 기준")
    _set_text(soup, ".headerWhisper .t", "귓속말 to GM")
    _set_text(soup, ".headerChat .t", "세션 로그 / 채팅")
    _set_text(soup, "#gmCardTitle", "GM 밸런스 계수")
    _set_text(soup, "#gmPanelTabBalance", "밸런스")
    _set_text(soup, "#gmPanelTabMonster", "몬스터")
    _set_text(soup, "#gmCardDesc", "아래 계수는 PC 3명에게 공통 적용됩니다.")
    _set_text(soup, "#monsterPanelTitle", "몬스터 운영")
    _set_text(soup, "#monsterPanelDesc", "현재 전투 몬스터를 등록/관리합니다.")
    _set_text(soup, "#realtimePanel h2", "실시간 운영")

    _set_text(soup, 'label[for="showDcToUsers"] span', "플레이어에게 목표 DC 공개")
    _set_attr(soup, "#showDcToUsers", "title", "플레이어에게 목표 DC를 표시할지 선택")

    admin_tools = soup.find(id="adminTools")
    if admin_tools is not None:
        muted_list = admin_tools.find_all("div", class_="muted", recursive=False)
        if len(muted_list) > 0:
            _set_direct_text(muted_list[0], "관리자 스탯 / 포인트 설정")
        if len(muted_list) > 1:
            _set_direct_text(muted_list[1], "유저별 프로필 이미지")
        side_hint = admin_tools.find("div", class_="sideHint")
        if side_hint is not None:
            _set_direct_text(side_hint, "지급/회수 내역은 세션 로그에 함께 기록됩니다.")

    _set_box_title_by_control(soup, "gm_str_step", "GM 특성 보너스 채널")
    gm_box = soup.find(id="gm_str_step")
    if gm_box is not None:
        gm_box = gm_box.find_parent("div", class_="box")
    if gm_box is not None:
        p_smalls = gm_box.find_all("p", class_="small", recursive=False)
        if len(p_smalls) > 0:
            _set_direct_text(
                p_smalls[0],
                "이 채널은 공격 유형별 특성 보너스를 직접 설정합니다. 변경 즉시 실시간 반영됩니다.",
            )
        if len(p_smalls) > 1:
            _set_direct_text(
                p_smalls[1],
                "플라즈마 최대치 계산: pool 기준값을 기준으로, 초과 구간은 "
                "[시작값 + floor((pool-시작값)/N) * 증가값]으로 계산됩니다.",
            )

    _set_label_for_control(soup, "themeBrightness", "밝기")
    _set_option_text(soup, "themeImageMode", "texture", "텍스처 패턴(고정)")
    _set_label_for_control(soup, "themeImageBrightness", "텍스처 밝기")
    _set_label_for_control(soup, "themeImageSaturation", "텍스처 채도")

    _set_box_title_by_control(soup, "diceBodyColor", "GM 주사위 외형/질감")
    _set_label_for_control(soup, "diceTextureStyle", "표면 질감")
    _set_option_text(soup, "diceTextureStyle", "clean", "기본")
    _set_option_text(soup, "diceTextureStyle", "grain", "거친 질감")
    _set_option_text(soup, "diceTextureStyle", "worn", "마모")
    _set_option_text(soup, "diceTextureStyle", "metal", "금속광(강함)")
    _set_label_for_control(soup, "diceRoughness", "거칠기")
    _set_label_for_control(soup, "diceMetalness", "금속감")
    _set_label_for_control(soup, "diceRollDuration", "굴림 시간")
    _set_label_for_control(soup, "diceRollPower", "굴림 강도")

    export_box = soup.find(id="exportBox")
    if export_box is not None:
        details = export_box.find_parent("details")
        if details is not None:
            muted = details.find("p", class_="muted", recursive=False)
            if muted is not None:
                _set_direct_text(muted, "같은 세팅을 JSON으로 공유할 수 있습니다.")
    _set_label_for_control(soup, "exportBox", "내보내기 JSON")
    _set_label_for_control(soup, "importBox", "가져오기 JSON")

    pc_card = soup.find(id="pcBattleCard")
    if pc_card is not None:
        h2 = pc_card.find("h2")
        if h2 is not None:
            _set_direct_text(h2, "PC 3인 시트 + 전투")
        muted = pc_card.find("p", class_="muted")
        if muted is not None:
            _set_direct_text(muted, "현재 PC를 선택해 스탯을 조정하고 판정/전투를 진행합니다.")
        titles = pc_card.select(".userCombatTitle")
        if len(titles) > 0:
            _set_direct_text(titles[0], "적대 몬스터")
        if len(titles) > 1:
            _set_direct_text(titles[1], "플레이어 현황")

    _set_label_for_control(soup, "pcQuickDamageTarget", "대상")
    _set_option_text(soup, "pcQuickDamageTarget", "pc_active", "현재 PC")

    for i in range(3):
        card = soup.find(id=f"playerCard{i}")
        if card is None:
            continue
        small = card.select_one(".alwaysModBox > .small")
        if small is not None:
            _set_direct_text(small, "상시보정")
        labels = card.select(".alwaysModLabel")
        if len(labels) > 0:
            _set_direct_text(labels[0], "적중")
        if len(labels) > 1:
            _set_direct_text(labels[1], "위력")
        if len(labels) > 2:
            _set_direct_text(labels[2], "거리")

    _set_text(soup, "#pcBattleCard .diceHint", "판정 버튼으로 주사위를 굴려 결과를 확인하세요.")
    _set_text(soup, "#pcBattleCard .diceResult span", "합계:")
    _set_box_title_by_control(soup, "rollHitBtn", "주사위 판정")
    roll_btn = soup.find(id="rollHitBtn")
    if roll_btn is not None:
        roll_box = roll_btn.find_parent("div", class_="box")
        if roll_box is not None:
            small = roll_box.find("div", class_="small", recursive=False)
            if small is not None:
                _set_direct_text(small, "적중판정은 1d20 굴림을 사용합니다.")
    _set_label_for_control(soup, "damageDiceSides", "피해 주사위")

    _set_box_title_by_control(soup, "sta_hp", "기본 스탯")
    _set_label_for_control(soup, "sta_hp", "체력")
    _set_label_for_control(soup, "pc_name", "이름")
    _set_label_for_control(soup, "sta_str", "근력")
    _set_label_for_control(soup, "sta_dex", "민첩")
    _set_label_for_control(soup, "sta_int", "지능")
    _set_label_for_control(soup, "sta_plasma_power", "플라즈마 위력")
    _set_label_for_control(soup, "sta_cha", "매력")
    _set_label_for_control(soup, "sta_pool", "플라즈마 총량")
    _set_label_for_control(soup, "nameInput", "표시 이름")
    _set_label_for_control(soup, "pointStat", "포인트 분배")

    pc_stats = soup.find(id="pcStatsBox")
    if pc_stats is not None:
        t_rows = pc_stats.find_all("div", class_="t", recursive=False)
        if len(t_rows) > 1:
            _set_direct_text(t_rows[1], "스킬 포인트")
        p_smalls = pc_stats.find_all("p", class_="small", recursive=False)
        if len(p_smalls) > 0:
            _set_direct_text(p_smalls[0], "포인트는 남은 수치 내에서만 분배할 수 있습니다.")
        if len(p_smalls) > 1:
            _set_direct_text(p_smalls[1], "참고: NPC 전투/이벤트 판정은 GM 재량으로 처리됩니다.")

    _set_box_title_by_control(soup, "actionModeAttack", "행동 설정")
    action_box = soup.find(id="actionSetupBox")
    if action_box is not None:
        guide = action_box.find("div", class_="actionGuideText")
        if guide is not None:
            _set_direct_text(guide, "행동 단계 2가지를 선택하세요: 공격 / 아이템")
        preset_label = action_box.select_one(".actionPresetWrap > label")
        if preset_label is not None:
            _set_direct_text(preset_label, "빠른 프리셋")
        summary_label = action_box.select_one(".actionSummaryPill > span")
        if summary_label is not None:
            _set_direct_text(summary_label, "현재 설정")
    _set_text(soup, "#actionSetupSummary", "공격 · 플라즈마 · 강도 중 · 거리 근접 · Lv 1")

    _set_box_title_by_control(soup, "plasmaOrbs", "플라즈마 관리")
    plasma_panel = soup.find(id="plasmaPanel")
    if plasma_panel is not None:
        spans = plasma_panel.select(".plasmaMeta .pill span")
        if len(spans) > 0:
            _set_direct_text(spans[0], "현재 / 최대")
        if len(spans) > 1:
            _set_direct_text(spans[1], "동시 사용 한도")
    _set_text(
        soup,
        "#plasmaExtraMeta",
        "현재 플라즈마 보유량입니다. 템플릿 적용 시 사용량이 자동 반영됩니다.",
    )
    _set_label_for_control(soup, "plasmaSkillName", "기술 이름")
    _set_label_for_control(soup, "plasmaSkillBaseCost", "기본 플라즈마 소모")
    _set_label_for_control(soup, "plasmaSkillRange", "기술 거리")
    _set_option_text(soup, "plasmaSkillRange", "close", "근거리 집중")
    _set_option_text(soup, "plasmaSkillRange", "far", "원거리 집중")
    _set_label_for_control(soup, "plasmaSkillKind", "기술 유형")
    _set_label_for_control(soup, "plasmaSkillBuffHit", "적중 보정")
    _set_label_for_control(soup, "plasmaSkillBuffPow", "위력 보정")
    _set_label_for_control(soup, "plasmaSkillDesc", "기술 설명")
    _set_text(soup, "#plasmaSkillSaveStatus", "템플릿 저장 대기")

    _set_text(soup, ".calcResultBox > .t", "현재 PC 계산 결과")
    _set_box_title_by_control(soup, "hitBonus", "적중 보너스")
    _set_box_title_by_control(soup, "powBonus", "위력 보너스")
    _set_box_title_by_control(soup, "note", "비고")
    _set_text(soup, ".calcResultBox .breakdown .muted", "계산 로그")

    _set_text(soup, "#adminDrawer .sideDrawerHeader h2", "운영자 인벤토리")
    _set_text(soup, "#adminDrawer .sideDrawerHeader .sideTag", "[아이템 제작]")
    _set_label_for_control(soup, "adminItemBaseQty", "기본 수량")
    _set_box_title_by_control(soup, "adminInspectSlot", "관리자 유저 인벤토리 확인")
    _set_label_for_control(soup, "adminInspectGoldAmount", "골드 조정량")
    _set_box_title_by_control(soup, "adminNpcName", "동행 NPC 관리")
    _set_label_for_control(soup, "adminNpcPlasma", "플라즈마")
    _set_label_for_control(soup, "adminNpcHunger", "허기")
    _set_label_for_control(soup, "adminNpcImageFile", "NPC 이미지")
    _set_box_title_by_control(soup, "adminNpcTemplateSelect", "NPC 템플릿")
    _set_box_title_by_control(soup, "adminStatusGrid", "상태이상 설정")

    _set_text(soup, "#userDrawer .sideDrawerHeader h2", "유저 인벤토리")
    _set_text(soup, "#userDrawer .sideDrawerHeader .sideHint", "우측 패널에서 바로 사용/제거 가능합니다.")
    _set_box_title_by_control(soup, "userStatusBadges", "상태 배지")
    _set_label_for_control(soup, "userMemo", "메모장")
    _set_box_title_by_control(soup, "inventoryList", "인벤토리 / 소모품")
    _set_box_title_by_control(soup, "userNpcList", "동행 NPC")
    _set_box_title_by_control(soup, "roleMode", "실시간 세션")

    misc_labels = {
        "monsterEvaInput": "회피",
        "monsterImageFile": "몬스터 이미지",
        "healAmount": "빠른 PC 회복 수치",
        "grantPointsAmount": "지급 포인트",
        "adminPlasmaPlusOneBtn": "플라즈마 회복 (대상 유저)",
        "adminGoldAmount": "골드 지급/회수량",
    }
    for cid, text in misc_labels.items():
        _set_label_for_control(soup, cid, text)

    _set_option_text(soup, "adminStatName", "alwaysPow", "상시 위력 보정")


def _remaining_bad_direct_text(soup: BeautifulSoup) -> list[tuple[str, str, str]]:
    bad_pat = re.compile(r"[÷øðκгοĳ뷮з]")
    bad: list[tuple[str, str, str]] = []
    for el in soup.find_all(True):
        if el.name in ("script", "style"):
            continue
        direct = " ".join(
            str(t).strip() for t in el.find_all(string=True, recursive=False) if str(t).strip()
        )
        if direct and bad_pat.search(direct):
            bad.append((el.name, el.get("id", ""), direct))
    return bad


def main() -> None:
    html = HTML_PATH.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")

    _cleanup_structural_noise(soup)
    _apply_manual_texts(soup)

    out = str(soup)
    if not out.lstrip().lower().startswith("<!doctype html>"):
        out = "<!doctype html>\n" + out
    HTML_PATH.write_text(out, encoding="utf-8")

    check_soup = BeautifulSoup(out, "html.parser")
    bad = _remaining_bad_direct_text(check_soup)
    print(f"written: {HTML_PATH}")
    print(f"remaining_mojibake_direct_text: {len(bad)}")
    for tag, eid, txt in bad[:20]:
        print(f"{tag}#{eid}: {txt}")


if __name__ == "__main__":
    main()
