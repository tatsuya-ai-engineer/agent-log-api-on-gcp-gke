const healthStatus = document.querySelector("#health-status");
const logCount = document.querySelector("#log-count");
const logsMessage = document.querySelector("#logs-message");
const logsTable = document.querySelector("#logs-table");
const logsBody = document.querySelector("#logs-body");
const form = document.querySelector("#log-form");
const formMessage = document.querySelector("#form-message");
const refreshButton = document.querySelector("#refresh-all");

function setHealthStatus(label, kind) {
  healthStatus.textContent = label;
  healthStatus.className = `status status-${kind}`;
}

async function loadHealth() {
  setHealthStatus("確認中", "pending");
  try {
    const response = await fetch("/health");
    const data = await response.json();
    if (!response.ok || data.status !== "ok") {
      throw new Error("Health check failed");
    }
    setHealthStatus("正常", "ok");
  } catch {
    setHealthStatus("接続できません", "error");
  }
}

function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  return cell;
}

function renderLogs(logs) {
  logsBody.replaceChildren();
  logCount.textContent = `${logs.length} 件`;
  logsTable.hidden = logs.length === 0;
  logsMessage.hidden = logs.length > 0;
  logsMessage.textContent = logs.length === 0 ? "まだ受信したログはありません。右のフォームから送信できます。" : "";

  for (const log of logs) {
    const row = document.createElement("tr");
    row.append(
      createCell(String(log.id)),
      createCell(log.agent_id),
      createCell(log.actor_user_id),
      createCell(log.tool_name),
      createCell(log.action),
      createCell(log.status),
    );
    logsBody.append(row);
  }
}

async function loadLogs() {
  try {
    const response = await fetch("/logs");
    if (!response.ok) {
      throw new Error("Could not load logs");
    }
    renderLogs(await response.json());
  } catch {
    logsTable.hidden = true;
    logsMessage.hidden = false;
    logsMessage.textContent = "ログを取得できませんでした。APIが起動しているか確認してください。";
  }
}

async function refreshDashboard() {
  refreshButton.disabled = true;
  await Promise.all([loadHealth(), loadLogs()]);
  refreshButton.disabled = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const values = new FormData(form);
  const payload = Object.fromEntries(values.entries());
  if (!payload.actor_user_id) {
    delete payload.actor_user_id;
  }

  submitButton.disabled = true;
  formMessage.textContent = "送信中です。";
  try {
    const response = await fetch("/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Could not create log");
    }
    formMessage.textContent = "送信しました。ログ一覧を更新します。";
    await loadLogs();
  } catch {
    formMessage.textContent = "送信できませんでした。入力内容とAPIの状態を確認してください。";
  } finally {
    submitButton.disabled = false;
  }
});

refreshButton.addEventListener("click", refreshDashboard);
refreshDashboard();
