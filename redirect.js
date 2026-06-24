// --- SPACES TOOLBAR BUTTON ---

browser.spacesToolbar.addButton('MSMail', {
  title: browser.i18n.getMessage("toolbarButtonTitle"),
  defaultIcons: "skin/ms_mail_icon.svg",
  url: "https://login.live.com/"
});

// --- USER-AGENT SPOOFING ---

browser.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    for (let header of details.requestHeaders) {
      if (header.name.toLowerCase() === "user-agent") {
        header.value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0";
        break;
      }
    }
    return { requestHeaders: details.requestHeaders };
  },
  {
    urls: [
      "https://login.live.com/*",
      "https://*.microsoft.com/*",
      "https://*.live.com/*",
      "https://*.outlook.com/*",
      "https://*.office.com/*"
    ]
  },
  ["blocking", "requestHeaders"]
);

// --- MS MAIL NOTIFICATION CODE ---
//

const mailState = new Map();           // tabId -> count
let notificationsEnabled = true;       // cached copy of the setting

// Load the setting on startup
browser.storage.local.get({ notificationsEnabled: true }).then((items) => {
  notificationsEnabled = items.notificationsEnabled;
});

// Keep the cached setting in sync if the user changes it in Options
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.notificationsEnabled) {
    notificationsEnabled = changes.notificationsEnabled.newValue;
  }
});

// Helper: does this URL look like an MS Mail / Outlook web mail tab?
function isMailUrl(url) {
  return !!url && (
    url.includes("outlook.live.com") ||
    url.includes("outlook.office.com") ||
    url.includes("outlook.office365.com") ||
    url.includes("mail.live.com")
  );
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.title && isMailUrl(tab.url)) {
    const title = changeInfo.title;

    // TEMPORARY: confirm the real title format, then remove this.
    console.log("MS Mail tab title:", JSON.stringify(title));

    const previousCount = mailState.get(tabId) || 0;

    // Look for a count anywhere in the title, e.g. "(3) Mail - ..."
    const match = title.match(/\((\d+)\+?\)/);
    const count = match ? parseInt(match[1], 10) : 0;

    if (count > previousCount && notificationsEnabled) {
      const body = count === 1
        ? browser.i18n.getMessage("notificationNewEmailSingle")
        : browser.i18n.getMessage("notificationNewEmailMultiple", [String(count)]);

      browser.notifications.create("ms-mail-unread-alert", {
        type: "basic",
        iconUrl: "skin/ms_mail_icon.png",
        title: browser.i18n.getMessage("notificationTitle"),
        message: body
      }).catch((error) => {
        console.error("Failed to create notification:", error);
      });
    }

    mailState.set(tabId, count);
  }
});

// Clean up tracking when a tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  mailState.delete(tabId);
});

// Focus the MS Mail tab when the notification is clicked
browser.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "ms-mail-unread-alert") {
    browser.tabs.query({}).then((tabs) => {
      const mailTab = tabs.find((t) => isMailUrl(t.url));
      if (mailTab) {
        browser.tabs.update(mailTab.id, { active: true });
        if (mailTab.windowId) {
          browser.windows.update(mailTab.windowId, { focused: true });
        }
      }
    }).catch((error) => {
      console.error("Error focusing MS Mail tab via notification click: ", error);
    });
  }
});
