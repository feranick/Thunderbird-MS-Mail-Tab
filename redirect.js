browser.spacesToolbar.addButton('MSMail', {
    title: "MIcrosoft Mail",
    defaultIcons: "skin/ms_mail_icon.svg",
    url: "https://login.live.com/"
});

browser.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (let header of details.requestHeaders) {
      if (header.name.toLowerCase() === "user-agent") {
        header.value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0";
        break;
      }
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["https://login.live.com/*", "https://*.microsoft.com/*"] },
  ["blocking", "requestHeaders"]
);
