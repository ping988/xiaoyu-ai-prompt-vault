const STORAGE_KEY = "promptVault";
const VAULT_VERSION = 3;

const DEFAULT_CATEGORIES = ["电商", "产品", "品牌", "视频", "海报"];

const DEFAULT_PROMPTS = [
  {
    id: "seed-cinematic",
    title: "逆向提示词专家",
    category: "电商",
    tags: ["角色设定", "逆向", "专家"],
    prompt:
      "生成[角色]的主题为“逆向提示词专家”的高质量角色图。人物必须具体、真实、有身份感，不要生成通用网红脸。请稳定保持脸型、五官比例、发际线、发型、年龄感、体型、姿态和服装结构。根据“逆向提示词专家”设计服饰、道具、表情、站姿或动作，让角色气质清楚但不夸张。皮肤需要真实毛孔、细纹、自然瑕疵和合理肤色，眼睛有清晰焦点与情绪，头发和服装材质有细节。镜头构图要有明确景别和光线方向，背景简洁但能支持角色叙事。",
    negative: "换脸、五官漂移、塑料皮肤、死板眼神、多余手指、融合手指、畸形肢体、过度美颜、无关文字和水印",
    notes: "适合创建角色设定、虚拟形象、AI 角色卡片。",
    favorite: true,
    createdAt: "2026-05-15T08:30:00.000Z",
    updatedAt: "2026-05-15T08:30:00.000Z"
  },
  {
    id: "seed-product",
    title: "徕卡电影质感",
    category: "产品",
    tags: ["产品精修", "电影光", "商业摄影"],
    prompt:
      "为[产品]生成一张主题为“徕卡电影质感”的高质量商业产品图。画面需要先保证产品本体绝对稳定：形状、比例、颜色、标志位置、标签排版、瓶盖或封口结构、材质质感、透视方向都不能改变；不要重新设计包装，不要编造任何可读文字。围绕“徕卡电影质感”建立明确场景，包含真实承载平面、接触阴影、环境反射、前后景层次和适度留白。镜头使用商业摄影逻辑，主体清晰，边缘干净，背景服务产品而不抢戏。",
    negative: "假文字、标志扭曲、重复产品、边缘融合、强噪点、过曝、廉价滤镜、产品变形",
    notes: "适合电商详情页、社媒投放、产品广告首图。",
    favorite: false,
    createdAt: "2026-05-15T08:20:00.000Z",
    updatedAt: "2026-05-15T08:20:00.000Z"
  },
  {
    id: "seed-poster",
    title: "极简品牌海报",
    category: "品牌",
    tags: ["极简", "留白", "品牌"],
    prompt:
      "极简品牌海报设计，主体占据视觉中心，背景保留大量留白，使用清晰的层级排版、克制的色彩组合和精致阴影，画面干净有呼吸感，适合新品发布、社媒封面或活动视觉。",
    negative: "拥挤排版、乱码文字、廉价渐变、过多装饰、模糊边缘、错位元素",
    notes: "生成海报时建议先用占位文字，后期再用设计工具替换真实文案。",
    favorite: true,
    createdAt: "2026-05-15T08:10:00.000Z",
    updatedAt: "2026-05-15T08:10:00.000Z"
  }
];

const state = {
  prompts: [],
  categories: [...DEFAULT_CATEGORIES],
  query: "",
  category: "",
  favoritesOnly: false,
  sortBy: "updatedAt",
  editingId: ""
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  newPromptButton: $("#newPromptButton"),
  searchButton: $("#searchButton"),
  searchInput: $("#searchInput"),
  quickFilters: $("#quickFilters"),
  allFilterButton: $("#allFilterButton"),
  favoriteFilterButton: $("#favoriteFilterButton"),
  openImportExportButton: $("#openImportExportButton"),
  totalCount: $("#totalCount"),
  favoriteCount: $("#favoriteCount"),
  resultTitle: $("#resultTitle"),
  resultHint: $("#resultHint"),
  sortSelect: $("#sortSelect"),
  promptList: $("#promptList"),
  editorDialog: $("#editorDialog"),
  promptForm: $("#promptForm"),
  editorTitle: $("#editorTitle"),
  titleInput: $("#titleInput"),
  categoryInput: $("#categoryInput"),
  categoryList: $("#categoryList"),
  tagsInput: $("#tagsInput"),
  promptInput: $("#promptInput"),
  negativeInput: $("#negativeInput"),
  notesInput: $("#notesInput"),
  favoriteInput: $("#favoriteInput"),
  deletePromptButton: $("#deletePromptButton"),
  importExportDialog: $("#importExportDialog"),
  jsonBox: $("#jsonBox"),
  exportButton: $("#exportButton"),
  importButton: $("#importButton"),
  toast: $("#toast")
};

init();

async function init() {
  bindEvents();
  await loadVault();
  render();
}

function bindEvents() {
  elements.newPromptButton.addEventListener("click", openCreateDialog);
  elements.searchButton?.addEventListener("click", () => elements.searchInput.focus());
  elements.searchInput.addEventListener("input", () => {
    state.query = elements.searchInput.value.trim();
    renderList();
  });
  elements.allFilterButton.addEventListener("click", () => {
    state.favoritesOnly = false;
    state.category = "";
    render();
  });
  elements.favoriteFilterButton.addEventListener("click", () => {
    state.favoritesOnly = true;
    state.category = "";
    render();
  });
  elements.openImportExportButton.addEventListener("click", openImportExportDialog);
  elements.sortSelect.addEventListener("change", () => {
    state.sortBy = elements.sortSelect.value;
    renderList();
  });
  elements.quickFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    state.favoritesOnly = false;
    render();
  });
  elements.promptList.addEventListener("click", handleListAction);
  elements.promptForm.addEventListener("submit", savePromptFromForm);
  elements.deletePromptButton.addEventListener("click", deleteEditingPrompt);
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
  elements.exportButton.addEventListener("click", exportVault);
  elements.importButton.addEventListener("click", importVault);
}

async function loadVault() {
  const data = await readStorage();
  const storedPrompts = Array.isArray(data?.prompts) ? data.prompts : [];
  const prompts =
    data?.version === VAULT_VERSION && storedPrompts.length
      ? storedPrompts
      : migratePromptVault(storedPrompts);
  state.prompts = normalizePrompts(prompts);
  state.categories = unique([
    ...DEFAULT_CATEGORIES,
    ...(Array.isArray(data?.categories) ? data.categories : []),
    ...state.prompts.map((prompt) => prompt.category)
  ].map(normalizeCategory));
  await persistVault();
}

async function persistVault() {
  state.categories = unique([...state.categories, ...state.prompts.map((prompt) => prompt.category)].map(normalizeCategory));
  await writeStorage({
    version: VAULT_VERSION,
    prompts: state.prompts,
    categories: state.categories
  });
}

function migratePromptVault(storedPrompts) {
  const seedIds = new Set(DEFAULT_PROMPTS.map((prompt) => prompt.id));
  const customPrompts = storedPrompts.filter((prompt) => {
    if (!prompt || seedIds.has(prompt.id)) return false;
    return String(prompt.title || "").trim() !== "测试提示词";
  });
  return [...DEFAULT_PROMPTS, ...customPrompts];
}

function readStorage() {
  return new Promise((resolve) => {
    if (globalThis.chrome?.storage?.local) {
      chrome.storage.local.get(STORAGE_KEY, (result) => resolve(result[STORAGE_KEY] || {}));
      return;
    }
    try {
      resolve(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      resolve({});
    }
  });
}

function writeStorage(value) {
  return new Promise((resolve) => {
    if (globalThis.chrome?.storage?.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: value }, resolve);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    resolve();
  });
}

function render() {
  renderSummary();
  renderFilters();
  renderCategoryList();
  renderList();
}

function renderSummary() {
  elements.totalCount.textContent = String(state.prompts.length);
  elements.favoriteCount.textContent = String(state.prompts.filter((prompt) => prompt.favorite).length);
  elements.allFilterButton.classList.toggle("active", !state.favoritesOnly && !state.category);
  elements.favoriteFilterButton.classList.toggle("active", state.favoritesOnly);
}

function renderFilters() {
  elements.quickFilters.innerHTML = state.categories
    .map(
      (category) => `
        <button class="filter-chip ${state.category === category ? "active" : ""}" data-category="${escapeHtml(category)}" type="button">
          <span aria-hidden="true">${getCategoryIcon(category)}</span>
          ${escapeHtml(category)}
        </button>
      `
    )
    .join("");
}

function renderCategoryList() {
  elements.categoryList.innerHTML = state.categories
    .map((category) => `<option value="${escapeHtml(category)}"></option>`)
    .join("");
}

function renderList() {
  const prompts = getVisiblePrompts();
  const modeName = state.favoritesOnly ? "我的收藏" : state.category || "全部提示词";
  elements.resultTitle.textContent = modeName;
  elements.resultHint.textContent = state.query
    ? `找到 ${prompts.length} 条匹配结果。`
    : "通过关键词快速定位可复用模板。";
  renderSummary();

  if (!prompts.length) {
    elements.promptList.innerHTML = `
      <div class="empty-state">
        没有找到匹配的提示词。<br />
        试试换个关键词，或新增一个模板。
      </div>
    `;
    return;
  }

  elements.promptList.innerHTML = prompts.map(renderPromptCard).join("");
}

function getVisiblePrompts() {
  const query = state.query.toLowerCase();
  return state.prompts
    .filter((prompt) => {
      const haystack = [
        prompt.title,
        prompt.category,
        prompt.prompt,
        prompt.negative,
        prompt.notes,
        ...(prompt.tags || [])
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!state.category || prompt.category === state.category) &&
        (!state.favoritesOnly || prompt.favorite) &&
        (!query || haystack.includes(query))
      );
    })
    .sort(sortPrompts);
}

function sortPrompts(a, b) {
  if (state.sortBy === "title") return a.title.localeCompare(b.title, "zh-CN");
  const left = new Date(a[state.sortBy] || 0).getTime();
  const right = new Date(b[state.sortBy] || 0).getTime();
  return right - left;
}

function renderPromptCard(prompt) {
  return `
    <article class="prompt-card">
      <header>
        <span class="card-icon" aria-hidden="true">${getCategoryIcon(prompt.category)}</span>
        <div>
          <div class="prompt-meta">${escapeHtml(prompt.category || "未分类")}</div>
          <h3>${escapeHtml(prompt.title)}</h3>
        </div>
        <button class="favorite ${prompt.favorite ? "active" : ""}" data-action="favorite" data-id="${prompt.id}" type="button" title="收藏" aria-label="收藏">
          ★
        </button>
      </header>
      <div class="tag-row">
        ${(prompt.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="prompt-body">
        <p>${escapeHtml(prompt.prompt)}</p>
      </div>
      <div class="card-actions">
        <button class="tiny" data-action="copy" data-id="${prompt.id}" type="button">复制</button>
        <button class="tiny" data-action="edit" data-id="${prompt.id}" type="button">编辑</button>
        <button class="tiny" data-action="delete" data-id="${prompt.id}" type="button">删除</button>
      </div>
    </article>
  `;
}

async function handleListAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const prompt = state.prompts.find((item) => item.id === button.dataset.id);
  if (!prompt) return;

  if (button.dataset.action === "copy") {
    await copyPrompt(prompt);
    return;
  }

  if (button.dataset.action === "favorite") {
    prompt.favorite = !prompt.favorite;
    prompt.updatedAt = new Date().toISOString();
    await persistVault();
    render();
    toast(prompt.favorite ? "已加入收藏。" : "已取消收藏。");
    return;
  }

  if (button.dataset.action === "duplicate") {
    openCreateDialog({
      ...prompt,
      id: "",
      title: `${prompt.title} 副本`,
      favorite: false
    });
    return;
  }

  if (button.dataset.action === "delete") {
    const confirmed = window.confirm(`删除“${prompt.title}”？此操作不可撤销。`);
    if (!confirmed) return;
    state.prompts = state.prompts.filter((item) => item.id !== prompt.id);
    await persistVault();
    render();
    toast("模板已删除。");
    return;
  }

  if (button.dataset.action === "edit") {
    openEditDialog(prompt);
  }
}

function openCreateDialog(seed = {}) {
  state.editingId = "";
  elements.editorTitle.textContent = "新增提示词模板";
  elements.deletePromptButton.classList.add("hidden");
  fillForm({
    title: seed.title || "",
    category: seed.category || state.category || "灵感收藏",
    tags: seed.tags || [],
    prompt: seed.prompt || "",
    negative: seed.negative || "",
    notes: seed.notes || "",
    favorite: Boolean(seed.favorite)
  });
  showDialog(elements.editorDialog);
}

function openEditDialog(prompt) {
  state.editingId = prompt.id;
  elements.editorTitle.textContent = "编辑提示词模板";
  elements.deletePromptButton.classList.remove("hidden");
  fillForm(prompt);
  showDialog(elements.editorDialog);
}

function fillForm(prompt) {
  elements.titleInput.value = prompt.title || "";
  elements.categoryInput.value = prompt.category || "";
  elements.tagsInput.value = (prompt.tags || []).join(", ");
  elements.promptInput.value = prompt.prompt || "";
  elements.negativeInput.value = prompt.negative || "";
  elements.notesInput.value = prompt.notes || "";
  elements.favoriteInput.checked = Boolean(prompt.favorite);
}

async function savePromptFromForm(event) {
  event.preventDefault();
  const now = new Date().toISOString();
  const existing = state.prompts.find((prompt) => prompt.id === state.editingId);
  const prompt = {
    id: existing?.id || crypto.randomUUID(),
    title: elements.titleInput.value.trim(),
    category: normalizeCategory(elements.categoryInput.value.trim()),
    tags: splitTags(elements.tagsInput.value),
    prompt: elements.promptInput.value.trim(),
    negative: elements.negativeInput.value.trim(),
    notes: elements.notesInput.value.trim(),
    favorite: elements.favoriteInput.checked,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  if (!prompt.title || !prompt.category || !prompt.prompt) {
    toast("请填写标题、分类和提示词正文。");
    return;
  }

  if (existing) {
    state.prompts = state.prompts.map((item) => (item.id === existing.id ? prompt : item));
  } else {
    state.prompts.unshift(prompt);
  }

  await persistVault();
  elements.editorDialog.close();
  render();
  toast(existing ? "模板已更新。" : "模板已新增。");
}

async function deleteEditingPrompt() {
  if (!state.editingId) return;
  const prompt = state.prompts.find((item) => item.id === state.editingId);
  if (!prompt) return;
  const confirmed = window.confirm(`删除“${prompt.title}”？此操作不可撤销。`);
  if (!confirmed) return;
  state.prompts = state.prompts.filter((item) => item.id !== state.editingId);
  await persistVault();
  elements.editorDialog.close();
  render();
  toast("模板已删除。");
}

async function copyPrompt(prompt) {
  const text = [
    prompt.prompt,
    prompt.negative ? `\n负面提示词：${prompt.negative}` : "",
    prompt.notes ? `\n备注：${prompt.notes}` : ""
  ]
    .filter(Boolean)
    .join("\n");
  await navigator.clipboard.writeText(text);
  toast("提示词已复制。");
}

function openImportExportDialog() {
  elements.jsonBox.value = "";
  showDialog(elements.importExportDialog);
}

function exportVault() {
  const payload = {
    name: "AI 提示词宝典",
    exportedAt: new Date().toISOString(),
    categories: state.categories,
    prompts: state.prompts
  };
  elements.jsonBox.value = JSON.stringify(payload, null, 2);
  elements.jsonBox.select();
  toast("已生成导出 JSON。");
}

async function importVault() {
  let payload;
  try {
    payload = JSON.parse(elements.jsonBox.value || "{}");
  } catch {
    toast("JSON 格式不正确。");
    return;
  }

  const incoming = normalizePrompts(Array.isArray(payload.prompts) ? payload.prompts : []);
  if (!incoming.length) {
    toast("没有可导入的模板。");
    return;
  }

  const map = new Map(state.prompts.map((prompt) => [prompt.id, prompt]));
  incoming.forEach((prompt) => map.set(prompt.id, prompt));
  state.prompts = Array.from(map.values());
  state.categories = unique([
    ...state.categories,
    ...(Array.isArray(payload.categories) ? payload.categories : []),
    ...incoming.map((prompt) => prompt.category)
  ]);
  await persistVault();
  elements.importExportDialog.close();
  render();
  toast(`已导入 ${incoming.length} 条模板。`);
}

function showDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }
  dialog.setAttribute("open", "");
}

function normalizePrompts(prompts) {
  return prompts
    .map((prompt) => {
      const now = new Date().toISOString();
      return {
        id: prompt.id || crypto.randomUUID(),
        title: String(prompt.title || "未命名提示词").trim(),
        category: normalizeCategory(String(prompt.category || "灵感收藏").trim()),
        tags: Array.isArray(prompt.tags) ? prompt.tags.map(String).filter(Boolean) : splitTags(prompt.tags || ""),
        prompt: String(prompt.prompt || prompt.promptZh || prompt.content || "").trim(),
        negative: String(prompt.negative || prompt.negativePrompt || "").trim(),
        notes: String(prompt.notes || "").trim(),
        favorite: Boolean(prompt.favorite),
        createdAt: prompt.createdAt || now,
        updatedAt: prompt.updatedAt || prompt.createdAt || now
      };
    })
    .filter((prompt) => prompt.prompt);
}

function splitTags(value) {
  return unique(
    String(value || "")
      .split(/[,，、\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  ).slice(0, 16);
}

function unique(values) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}

function normalizeCategory(category) {
  const value = String(category || "").trim();
  if (value === "角色") return "电商";
  if (value === "逆向工程") return "产品";
  if (value === "电影") return "视频";
  return value;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function getCategoryIcon(category) {
  const text = String(category || "");
  if (text.includes("角色") || text.includes("人物") || text.includes("肖像")) return "♙";
  if (text.includes("逆向") || text.includes("工程")) return "▣";
  if (text.includes("产品") || text.includes("电商")) return "▣";
  if (text.includes("品牌")) return "◎";
  if (text.includes("视频") || text.includes("电影") || text.includes("质感")) return "◈";
  if (text.includes("海报") || text.includes("设计")) return "▤";
  return "⌘";
}

let toastTimer = 0;
function toast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message || "";
  elements.toast.classList.add("visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2600);
}
