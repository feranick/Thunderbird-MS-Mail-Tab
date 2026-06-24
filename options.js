const checkbox = document.getElementById("notificationsEnabled");
const status = document.getElementById("status");

function localizePage() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const msg = browser.i18n.getMessage(key);
    if (msg) {
      el.textContent = msg;
    }
  });
  const titleMsg = browser.i18n.getMessage("optionsTitle");
  if (titleMsg) {
    document.title = titleMsg;
  }
}

function restoreOptions() {
  browser.storage.local.get({ notificationsEnabled: true }).then((items) => {
    checkbox.checked = items.notificationsEnabled;
  });
}

checkbox.addEventListener("change", () => {
  browser.storage.local.set({ notificationsEnabled: checkbox.checked }).then(() => {
    status.textContent = browser.i18n.getMessage("optionsStatusSaved");
    setTimeout(() => { status.textContent = ""; }, 1500);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  localizePage();
  restoreOptions();
});
