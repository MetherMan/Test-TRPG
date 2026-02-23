(function(){
  const PARTS = [
    { key: "head", label: "머리", x: 50, y: 11 },
    { key: "left_arm", label: "왼팔", x: 30, y: 24 },
    { key: "chest", label: "가슴", x: 50, y: 27 },
    { key: "right_arm", label: "오른팔", x: 70, y: 24 },
    { key: "left_wrist", label: "왼손목", x: 24, y: 38 },
    { key: "abdomen", label: "복부", x: 50, y: 40 },
    { key: "right_wrist", label: "오른손목", x: 76, y: 38 },
    { key: "left_hand", label: "왼손", x: 20, y: 52 },
    { key: "left_leg", label: "왼다리", x: 43, y: 59 },
    { key: "right_leg", label: "오른다리", x: 57, y: 59 },
    { key: "right_hand", label: "오른손", x: 80, y: 52 },
    { key: "left_calf", label: "왼종아리", x: 43, y: 75 },
    { key: "right_calf", label: "오른종아리", x: 57, y: 75 },
    { key: "left_foot", label: "왼발", x: 43, y: 91 },
    { key: "right_foot", label: "오른발", x: 57, y: 91 }
  ];

  const PART_KEYS = PARTS.map((part) => part.key);
  const LEVEL_LABELS = ["정상", "노랑", "주황", "빨강", "검정"];
  const LEVEL_CLASSES = ["lvl0", "lvl1", "lvl2", "lvl3", "lvl4"];
  const PART_BY_KEY = new Map(PARTS.map((part) => [part.key, part]));

  function toInt(value){
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function clamp(n, min, max){
    return Math.max(min, Math.min(max, n));
  }

  function createEmptyMap(){
    const out = {};
    for(const key of PART_KEYS){
      out[key] = 0;
    }
    return out;
  }

  function sanitizeMap(raw){
    const source = raw && typeof raw === "object" ? raw : {};
    const out = createEmptyMap();
    for(const key of PART_KEYS){
      out[key] = clamp(toInt(source[key]), 0, 4);
    }
    return out;
  }

  function makeSilhouetteDataUrl(){
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 190">',
      '<defs>',
      '<linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#dbc7a1"/>',
      '<stop offset="100%" stop-color="#b4966b"/>',
      '</linearGradient>',
      '</defs>',
      '<g fill="url(#skin)" stroke="#6d4f2f" stroke-width="2.2" stroke-linejoin="round">',
      '<circle cx="60" cy="21" r="15"/>',
      '<rect x="44" y="38" width="32" height="46" rx="13"/>',
      '<rect x="26" y="47" width="14" height="44" rx="7"/>',
      '<rect x="80" y="47" width="14" height="44" rx="7"/>',
      '<rect x="21" y="86" width="12" height="25" rx="6"/>',
      '<rect x="87" y="86" width="12" height="25" rx="6"/>',
      '<rect x="45" y="84" width="13" height="54" rx="7"/>',
      '<rect x="62" y="84" width="13" height="54" rx="7"/>',
      '<rect x="43" y="136" width="13" height="35" rx="6"/>',
      '<rect x="64" y="136" width="13" height="35" rx="6"/>',
      '<ellipse cx="49" cy="178" rx="11" ry="6"/>',
      '<ellipse cx="71" cy="178" rx="11" ry="6"/>',
      '</g>',
      '</svg>'
    ].join("");
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const SILHOUETTE_SRC = makeSilhouetteDataUrl();

  function renderBoard(container, injuryMapRaw, options){
    const opts = options && typeof options === "object" ? options : {};
    const readOnly = !!opts.readOnly;
    const onToggle = typeof opts.onToggle === "function" ? opts.onToggle : null;
    const onToggleDetail = typeof opts.onToggleDetail === "function" ? opts.onToggleDetail : null;
    const onReset = typeof opts.onReset === "function" ? opts.onReset : null;
    const injuryMap = sanitizeMap(injuryMapRaw);

    container.innerHTML = "";
    container.classList.toggle("readonly", readOnly);

    const top = document.createElement("div");
    top.className = "injuryBoardTop";
    const title = document.createElement("div");
    title.className = "injuryBoardTitle";
    title.textContent = "부위 상태";
    top.appendChild(title);

    if(!readOnly && onReset){
      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "injuryResetBtn";
      resetBtn.textContent = "초기화";
      resetBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        onReset();
      });
      top.appendChild(resetBtn);
    }
    container.appendChild(top);

    const board = document.createElement("div");
    board.className = "injuryBodyBoard";
    container.appendChild(board);

    const image = document.createElement("img");
    image.className = "injuryBodySilhouette";
    image.alt = "부위 상태 도식";
    image.src = SILHOUETTE_SRC;
    image.decoding = "async";
    board.appendChild(image);

    for(const part of PARTS){
      const level = clamp(toInt(injuryMap[part.key]), 0, 4);
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `injuryHotspot ${LEVEL_CLASSES[level] || "lvl0"}`;
      dot.style.left = `${part.x}%`;
      dot.style.top = `${part.y}%`;
      dot.setAttribute("aria-label", `${part.label} 상태 ${LEVEL_LABELS[level] || LEVEL_LABELS[0]}`);
      dot.title = `${part.label}: ${LEVEL_LABELS[level] || LEVEL_LABELS[0]}`;
      if(readOnly || (!onToggle && !onToggleDetail)){
        dot.classList.add("readonly");
        dot.tabIndex = -1;
      }else{
        dot.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if(onToggleDetail){
            onToggleDetail(part.key, 1);
          }else{
            onToggle(part.key);
          }
        });
        dot.addEventListener("contextmenu", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if(onToggleDetail){
            onToggleDetail(part.key, -1);
          }else{
            onToggle(part.key);
          }
        });
      }
      board.appendChild(dot);
    }

    const legend = document.createElement("div");
    legend.className = "injuryLegend";
    legend.textContent = readOnly
      ? "색상: 노랑/주황/빨강/검정"
      : "좌클릭 순환: 정상→노랑→주황→빨강→검정 | 우클릭: 1단계 감소";
    container.appendChild(legend);
  }

  window.InjuryBodyMap = {
    PART_KEYS,
    PART_BY_KEY,
    LEVEL_LABELS,
    createEmptyMap,
    sanitizeMap,
    renderBoard
  };
})();
