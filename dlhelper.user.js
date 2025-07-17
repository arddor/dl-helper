// ==UserScript==
// @name         Download Helper
// @namespace    http://violentmonkey.net/
// @version      1.0
// @description  A script to help download files from various hosters and send them to RealDebrid, Premiumize, and JDownloader.
// @author       Me
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(async function () {
  "use strict";

  let JD_USER = GM_getValue("JD_USER", "").toLowerCase();
  let JD_PASS = GM_getValue("JD_PASS", "");
  let JD_DEVICE_ID = GM_getValue("JD_DEVICE_ID", "");

  const onedriveShortRegex =
    /^https:\/\/1drv\.ms\/[fu]\/[a-zA-Z0-9\/!_?&=-]+$/i;
  const onedriveRegex =
    /https:\/\/(?:onedrive\.live\.com|1drv\.ms)(?:\/\S+)?(?:\?redeem=[^&]+|id=[^&]+)/i;
  const supportedHosters = [
    onedriveShortRegex.source,
    onedriveRegex.source,
    "https:\\/\\/mega\\.nz\\/(?:#!|file\\/)[a-zA-Z0-9_-]+", // Mega
    "https:\\/\\/mega\\.nz\\/folder\\/[a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+", // Mega Folder
    "https:\\/\\/drive\\.google\\.com\\/file\\/d\\/[^\\/]+", // Google Drive File
    "https:\\/\\/drive\\.usercontent\\.google\\.com\\/download\\?id=[a-zA-Z0-9_-]+(?:&[^\\s]*)?", // Google Drive UserContent Download
    "https:\\/\\/drive\\.google\\.com\\/drive\\/folders\\/[^\\/]+", // Google Drive Folder
    "https:\\/\\/dropbox\\.com\\/s\\/[^\\/]+", // Dropbox
    "https:\\/\\/www\\.mediafire\\.com\\/file\\/[a-zA-Z0-9]+", // Mediafire
  ];

  const supportedHostersRegex = new RegExp(supportedHosters.join("|"), "i");

  const services = [
    {
      name: "OneDrive Direct",
      id: "onedrive",
      icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAABnklEQVR4nHXSPWsUYRTF8f99XmZmN7tkYyImEAkoVmlSWWpsVexi4QdQVLS0sZjkK2gvtqawSpciayOCAREMqawEEUTDZpPNzs4891oJweCvO3C6c+C00hz/Wtv0p2MAwExY73s2pGFt08eFuRXLprKm+rXHy5uHmAkiBuAozSFibNxoeLS14i/OfyDEXbH6fYjdvfh0+x4iRrkTAATgXPl5MbR6t0YHP8oJfqE5+q1OHMTCmSbSYHCV13c+cn83yly5d41YvPFFZ96qI7SpdHw8dKPhIaapDt2ZGHK/3Zk+//Dns6WvMru+/8XlnWWbHNemGkBEnENCIllCJZhrTYmZjjRVj4OZLTejQ0PNu8yRdzPybkYoMkzhZDiW0WB0ohLbqL0Ihu3Hqfxy0YsHWTubEe+dJaWpE5aMWEQ6zjXjo+qgOlEfeku9B3k7e+u6sxfSuEKTgQcJBmpYo7jou628JgwHzwXg0qtvV1zWum11PW1mpgqqCgraKLhCNU0+fX+yuAVleXbd/xP5e4nrqzj6fQDenemtwjLGXUl/AGS8vw4bgiP7AAAAAElFTkSuQmCC",
      handler: async (url) => {
        if (onedriveShortRegex.test(url)) {
          await openOneDriveWithAction(url);
          return;
        }
        if (onedriveRegex.test(url)) {
          const link = await getOneDriveDirectLink();
          displayDownloadLink(link);
        } else {
          throw Error("Not a OneDrive link");
        }
      },
    },
    {
      name: "RealDebrid",
      id: "realdebrid",
      icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAABEVBMVEUlJSUiISIaGhonJycdHR0pKipCQUJDQ0MzMzIBAgE6OTkwMDFubWknKCgxNTEpLCwqKSZKSkoUExoLJBI/Pz+GhX49PTu8u65nZmJ2dXDv7dionopraV8nLzImKiscKB4fHyYgMSYgMC4mJzMlLTkKCgwTIxczOywPDyMQHSQgJjs8OURUVE90gnPe3th+fnYmJClZWVfd2sq7t6iBgHj69+POzsyGknx4eHDX1cyQj4bb2tHCvreBfYLf3dR3d4Dr6dnJx7j19OzHxLZeXlz6+fBud28fHw+enYWioJLVzrmclX6lopLW09C9taTn5t+LhnklJRW0s5rX1L9ARk6urY40JRvRy7xZRDS+sqM3NjUYasLVAAAAlklEQVQI1xXBBRaCQAAFwA+C7BK2knZ3d3d33/8iPmfg9vnswr8guEGgKDyReCcviQgsOuUqRLkhSwTabFofWdZZbakidMNFT+b+QNmaH9pyfvx+drcr3fYgT+zD98t80nXfD71ZoYP7xdh0SwSBAjz58WPVLqY5MEmO8WRyWa835QDDciwXiSdi0TBAbIBLUUJBJ+/4AVyyEd2aDSSWAAAAAElFTkSuQmCC",
      handler: async (url) => {
        throw Error("RealDebrid integration is not implemented yet.");
      },
    },
    {
      name: "Premiumize",
      id: "premiumize",
      icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAA0lBMVEX///9jCgyMBwCjBAD38/P//vpmAgT//v3//vjl0M6DHwH++/L+10v27unpnBH8uhL/9dD67cvbvLf65qX8+fjEdGivNif75JL7+vfhpKLSoZreqJ6fFgTNPiXmtamNIxnnwrvl2NLw6el4BQJeAADYw8TZw8OPUVH64HHRd2vhd2TMaAv111rEFwDy0r3JQwC+cXn38NatGgaZLyZxFg3OLRDRvLzbtqCABQDWZ1GePj7RpKn1pgCoVVTIdBu6MgTtnSq7Tky/m5muenTGWwjqiA9I5Zs1AAAAeklEQVQI1y3LVRKDQBAE0EHC4sTd3T3BHe5/JdiB/pl5Vd1A0+4tu1CH78/O8/I2KKTp7XcCIE3Eh3s/Qey0sJdYvgbHAUH8U1e7qnQiKqYT25GqAMUryMLcu2NnuPrqhvEYIfgdI+sXblJhz2xllh0jyPogCJuFVL4F9o4KBP9q9U4AAAAASUVORK5CYII=",
      handler: async (url) => {
        throw Error("Premiumize integration is not implemented yet.");
      },
    },
    {
      name: "JDownloader",
      id: "jdownloader",
      icon: "data:image/png;base64,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",
      handler: async (url) => {
        if (onedriveShortRegex.test(url)) {
          await openOneDriveWithAction(url, "autodownload");
          return;
        }
        if (onedriveRegex.test(url)) {
          url = await getOneDriveDirectLink();
        }

        try {
          const jd = new MyJDownloader(JD_USER, JD_PASS);

          await jd.authenticate();
          console.log("✅ Successfully logged into MyJDownloader.");

          const devices = await jd.getDevices();
          const device = devices[0];
          console.log("✅ Found Device:", device);

          await jd.addLinks(device.id, [url]);
          console.log("✅ Link added to JDownloader successfully!", url);
        } catch (err) {
          console.error("❌ Error sending link to JDownloader:", err);
          throw err;
        }
      },
    },
  ];

  let selectedService = GM_getValue("selectedService", "onedrive");

  async function configureCredentials() {
    JD_USER = prompt("Enter your MyJDownloader email:", JD_USER).toLowerCase();
    if (JD_USER) GM_setValue("JD_USER", JD_USER);

    JD_PASS = prompt("Enter your MyJDownloader password:", JD_PASS);
    if (JD_PASS) GM_setValue("JD_PASS", JD_PASS);

    alert("✅ MyJDownloader credentials saved successfully!");
  }

  GM_registerMenuCommand("⚙️ Configure MyJDownloader", configureCredentials);

  function setService(serviceId) {
    selectedService = serviceId;
    GM_setValue("selectedService", serviceId);

    const directLinkBtn = document.getElementById("direct-link-btn");
    if (directLinkBtn) {
      const service = services.find((s) => s.id === serviceId);
      directLinkBtn.style.background = `url('${service.icon}') no-repeat center center !important`;
      directLinkBtn.title = `Download via ${service.name}`;
    }

    updateStyle();

    console.log(
      `🔄 Switched to service: ${services.find((s) => s.id === serviceId).name}`
    );
  }

  function updateStyle() {
    let style = document.getElementById("dl-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "dl-style";
      document.head.appendChild(style);
    }

    const service = services.find((s) => s.id === selectedService);

    style.textContent = `
        .dl-link {
            display: inline-block !important;
            position: relative !important;
            width: 12px !important;
            height: 12px !important;
            background-size: contain !important;
            cursor: pointer !important;
            border: 1px solid #ccc !important;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1) !important;
            margin-left: 5px !important;
        }
        .dl-link:hover {
            opacity: 0.8 !important;
        }
        .dl-link.ready {background: url('${service.icon}') no-repeat center center !important;}
        .dl-link.busy {background: url(data:image/gif;base64,R0lGODlhDAAMAKIGAIForORZKAgSEz9PUFDH4AOeyf///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJFAAGACwAAAAADAAMAAADK2g6rFbQseFgkU3ZCqfjhfc9XWYQaCqsQZuqrPsSq9AGmwLsoLMDPR1PkQAAIfkECRQABgAsAAAAAAwADAAAAyhoutX7qhX4JGsj68Cl3h32DVxAnEK6AOxJpMLaoqrCAq4F5c5+6o8EACH5BAkUAAYALAAAAAAMAAwAAAMqWGqsxcZB2VZ9kI0dOvjQNnTBB4Sc9wmsmDGs4L7xnBF4Thm5bvE9wi4BACH5BAkUAAYALAAAAAAMAAwAAAMrWGrc+qU5GKV5Io8NesvCNnTAp3EeIzZB26xMG7wb61pErj+Nvi8MX+6RAAAh+QQJFAAGACwAAAAADAAMAAADKlhqrMXGQdlWfZCNHTr40DZ0wQeEnPcJrJgxrOC+8ZwReE4ZuW7xPcIuAQAh+QQFFAAGACwAAAAADAAMAAADKGi61fuqFfgkayPrwKXeHfYNXECcQroA7EmkwtqiqsICrgXlzn7qjwQAOw==) no-repeat white !important;}
        .dl-link.success {background: url(data:image/gif;base64,R0lGODlhDAAMALMKAHi2EqnbOnqzKFmbHYS7J3CrJFmOGWafHZLELaLVL////wAAAAAAAAAAAAAAAAAAACH5BAEAAAoALAAAAAAMAAwAAAQ7UElDq7zKpJ0MlkMiAMnwKSFBlGe6mtIhH4mazDKXIIh+KIUdb5goXAqBYc+IQfKKJ4UgERBEJQIrJgIAOw==) no-repeat white !important;}
        .dl-link.error {background:url(data:image/gif;base64,R0lGODlhDAAMAIAAAP///8wzACH5BAAAAAAALAAAAAAMAAwAAAIRjI+pGwBsHGwPSlvnvIzrfxQAOw==) no-repeat !important;}
        .dl-dropdown {
            position: absolute !important;
            background: white !important;
            border: 1px solid gray !important;
            padding: 5px !important;
            border-radius: 5px !important;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1) !important;
            z-index: 10000 !important;
            white-space: nowrap !important;
        }
        .dl-dropdown a {
            display: block !important;
            padding: 5px !important;
            text-decoration: none !important;
            color: black !important;
            cursor: pointer !important;
        }
        .dl-dropdown a:hover {
            background: lightgray !important;
        }
        #onedrive-top-panel {
            position: fixed !important;
            top: 10px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: rgba(255, 255, 255, 0.95) !important;
            border: 1px solid #ccc !important;
            padding: 10px 15px !important;
            border-radius: 8px !important;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15) !important;
            z-index: 10000 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
        }
        #onedrive-top-panel .dl-link {
          margin-left: 0 !important
        }
        #direct-download-container {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            padding: 10px !important;
            background: rgba(0,0,0,0.9) !important;
            color: #fff !important;
            border-radius: 5px !important;
            z-index: 10000 !important;
            font-size: 14px !important;
            word-break: break-all !important;
        }
        #closeDownloadContainer {
            background: none !important;
            border: none !important;
            color: white !important;
            font-size: 16px !important;
            cursor: pointer !important;
        }
    `;
  }

  function displayDownloadLink(url) {
    let linkContainer = document.getElementById("direct-download-container");

    if (!linkContainer) {
      linkContainer = document.createElement("div");
      linkContainer.id = "direct-download-container";
      document.body.appendChild(linkContainer);
    }

    linkContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>📥 Direct Download Link:</strong>
        <button id="closeDownloadContainer">✖</button>
      </div>
      <a href="${url}" target="_blank" style="color: yellow;">${url}</a>
    `;

    document
      .getElementById("closeDownloadContainer")
      .addEventListener("click", () => {
        document.body.removeChild(linkContainer);
      });
  }

  // Create a global dropdown element
  let globalDropdown = document.createElement("div");
  globalDropdown.classList.add("dl-dropdown");
  globalDropdown.style.display = "none";
  globalDropdown.style.position = "absolute";
  document.body.appendChild(globalDropdown);

  // Populate dropdown options dynamically
  services.forEach((service) => {
    const option = document.createElement("a");
    option.textContent = service.name;
    option.href = "#";
    option.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get the currently active button
      if (globalDropdown.currentButton) {
        globalDropdown.currentButton.className = "dl-link ready";
        globalDropdown.currentButton.title = `Download via ${service.name}`;
        setService(service.id);
      }

      globalDropdown.style.display = "none";
    });
    globalDropdown.appendChild(option);
  });

  // Function to toggle dropdown at the right position
  function toggleDropdown(event, button) {
    event.preventDefault();
    event.stopPropagation();

    if (
      globalDropdown.style.display === "block" &&
      globalDropdown.currentButton === button
    ) {
      globalDropdown.style.display = "none";
      globalDropdown.currentButton = null;
      return;
    }

    globalDropdown.currentButton = button;
    const rect = button.getBoundingClientRect();
    console.log("rect", `${rect.bottom + window.scrollY}px !important`);

    globalDropdown.style.top = `${rect.bottom + window.scrollY}px`;
    globalDropdown.style.left = `${rect.left + window.scrollX}px`;
    globalDropdown.style.display = "block";
    console.log(
      "Dropdown Position:",
      globalDropdown.style.top,
      globalDropdown.style.left
    );

    document.addEventListener("click", closeDropdownOnOutsideClick);
    document.addEventListener("keydown", closeDropdownOnEscape);
  }

  // Function to close dropdown on outside click
  function closeDropdownOnOutsideClick(event) {
    if (
      !globalDropdown.contains(event.target) &&
      globalDropdown.currentButton !== event.target
    ) {
      globalDropdown.style.display = "none";
      globalDropdown.currentButton = null;
      document.removeEventListener("click", closeDropdownOnOutsideClick);
      document.removeEventListener("keydown", closeDropdownOnEscape);
    }
  }

  // Function to close dropdown when pressing Escape
  function closeDropdownOnEscape(event) {
    if (event.key === "Escape") {
      globalDropdown.style.display = "none";
      globalDropdown.currentButton = null;
      document.removeEventListener("click", closeDropdownOnOutsideClick);
      document.removeEventListener("keydown", closeDropdownOnEscape);
    }
  }

  // Modify existing download button creation to use global dropdown
  function createDownloadButton(url) {
    const service = services.find((s) => s.id === selectedService);
    const button = document.createElement("a");
    button.href = "#";
    button.className = "dl-link ready";
    button.title = `Download via ${service.name}`;

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      if (event.altKey) {
        toggleDropdown(event, button);
      } else {
        await triggerServiceHandler(url, button);
      }
    });

    return button;
  }

  async function triggerServiceHandler(url, button) {
    const service = services.find((s) => s.id === selectedService);
    if (service && service.handler) {
      button.className = "dl-link busy";
      console.log(`⏳ Executing handler for ${service.name}...`);

      try {
        await service.handler(url);
        button.className = "dl-link success";
      } catch (error) {
        console.error(`❌ Error in ${service.name} handler:`, error);
        button.className = "dl-link error";
      }
    }
  }

  function addDirectLinkButtons() {
    document
      .querySelectorAll("a[href]:not([data-dl-added])")
      .forEach((link) => {
        if (link.closest("#onedrive-top-panel")) return; // Skip top bar links

        link.setAttribute("data-dl-added", "true"); // Mark as processed
        if (supportedHostersRegex.test(link.href)) {
          const button = createDownloadButton(link.href);
          link.parentNode.insertBefore(button, link.nextSibling);
        }
      });

    updateStyle();

    // Ensure observer is only initialized once
    if (!window.directLinkObserver) {
      window.directLinkObserver = new MutationObserver((mutations) => {
        let newLinksFound = false;

        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.querySelectorAll) {
              node
                .querySelectorAll("a[href]:not([data-dl-added])")
                .forEach((link) => {
                  if (supportedHostersRegex.test(link.href)) {
                    newLinksFound = true;
                  }
                });
            }
          });
        });

        if (newLinksFound) {
          clearTimeout(window.debounceTimer);
          window.debounceTimer = setTimeout(() => {
            addDirectLinkButtons();
          }, 300); // Debounce to avoid excessive processing
        }
      });

      window.directLinkObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href"],
      });
    }
  }

  function insertTopBarButton() {
    if (!supportedHostersRegex.test(window.location.href)) return;

    let topPanel = document.getElementById("onedrive-top-panel");
    if (!topPanel) {
      topPanel = document.createElement("div");
      topPanel.id = "onedrive-top-panel";
      document.body.prepend(topPanel);
    }

    topPanel.innerHTML = ""; // Clear previous button
    const directButton = createDownloadButton(window.location.href);
    topPanel.appendChild(directButton);

    updateStyle();
  }

  async function getOneDriveDirectLink() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 10; // Try for up to 10 seconds

      function tryFindDownloadButton() {
        attempts++;

        // More precise selector targeting the download button
        let downloadButton = document.querySelector(
          'button[role="menuitem"][name="Download"][title="Download"][data-automationid="download"], ' +
            'button.ms-ContextualMenu-link[data-automationid="download"]'
        );

        if (!downloadButton) {
          // If not found, click the overflow button to check if it's inside the menu
          const overflowButton = document.querySelector(
            'button[data-automationid="overflowButton"]'
          );
          if (overflowButton) {
            console.log(
              "🔄 Clicking the overflow button to check for download options..."
            );
            overflowButton.click();
          }

          // Re-attempt to find the download button after expanding the menu
          downloadButton = document.querySelector(
            'button[role="menuitem"][name="Download"][title="Download"][data-automationid="download"], ' +
              'button.ms-ContextualMenu-link[data-automationid="download"]'
          );
        }

        if (downloadButton) {
          console.log("✅ Download button found! Clicking...");
          downloadButton.click();

          // Monitor for the iframe with the direct link
          const observer = new MutationObserver((mutations, obs) => {
            mutations.forEach(({ addedNodes }) => {
              addedNodes.forEach((node) => {
                if (
                  node.tagName === "IFRAME" &&
                  node.src.includes("/download.aspx")
                ) {
                  console.log("✅ Found download iframe:", node.src);
                  GM_setValue("onedriveDirectLink", node.src); // Store the link for retrieval
                  resolve(node.src);
                  node.remove();
                  obs.disconnect(); // Stop observing after finding the iframe
                }
              });
            });
          });

          observer.observe(document.body, { childList: true, subtree: true });

          // Set timeout to reject in case iframe never appears
          setTimeout(
            () => reject("❌ Download iframe not found within timeout."),
            10000
          );
          return;
        }

        if (attempts >= maxAttempts) {
          console.warn("❌ Download button not found after multiple attempts.");
          reject("Download button not found.");
        } else {
          setTimeout(tryFindDownloadButton, 1000); // Retry after 1 second
        }
      }

      tryFindDownloadButton();
    });
  }

  async function resolveOneDriveUrl(shortUrl) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "HEAD", // Use HEAD request to resolve redirection without downloading content
        url: shortUrl,
        onload: function (response) {
          if (response.finalUrl) {
            console.log("✅ Resolved OneDrive URL:", response.finalUrl);
            resolve(response.finalUrl);
          } else {
            reject("❌ Failed to resolve OneDrive short link.");
          }
        },
        onerror: function () {
          reject("❌ Network error when resolving OneDrive short link.");
        },
      });
    });
  }

  async function openOneDriveWithAction(shortUrl, action = "autodownload") {
    try {
      // Step 1: Resolve the final OneDrive URL
      const finalUrl = await resolveOneDriveUrl(shortUrl);
      console.log("🔄 Opening OneDrive with Auto-Download:", finalUrl);

      // Step 2: Open OneDrive in a new **window**
      const win = window.open(
        finalUrl,
        "_blank",
        "width=1200,height=600,left=200,top=100"
      );

      if (!win) {
        console.error("❌ Popup blocked! Please allow popups.");
        return;
      }

      console.log("📌 Monitoring the new window for redirection...");

      // Step 3: Monitor the new window until it becomes cross-origin
      const checkInterval = setInterval(() => {
        if (!win || win.closed) {
          clearInterval(checkInterval);
          console.error("❌ OneDrive window was closed before completion.");
          return;
        }

        try {
          // Try accessing a property (this works before redirection)
          const testAccess = win.location.hostname;
          console.log("🌐 Still on same domain:", testAccess);
        } catch (error) {
          // This error confirms the window has redirected to OneDrive (cross-origin error)
          console.log(
            "✅ OneDrive page loaded! Sending auto-download trigger..."
          );

          // Step 4: Send a message to the OneDrive window to trigger auto-download
          win.postMessage({ action }, "*");

          clearInterval(checkInterval); // Stop checking once detected
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Error resolving OneDrive link:", error);
    }
  }

  class MyJDownloader {
    constructor(email, password) {
      this.API_URL = "https://api.jdownloader.org";
      this.APP_KEY = "MyJDownloader-WebClient";
      this.EMAIL = email.toLowerCase();
      this.PASSWORD = password;
      this.authData = null;
    }

    async authenticate() {
      const loginSecret = await this.#createSecret(
        this.EMAIL,
        this.PASSWORD,
        "server"
      );
      const deviceSecret = await this.#createSecret(
        this.EMAIL,
        this.PASSWORD,
        "device"
      );

      const response = await this.#post(
        `/my/connect?email=${this.EMAIL}&appkey=${this.APP_KEY}`,
        loginSecret,
        null,
        true
      );
      if (!response.sessiontoken)
        throw new Error("Session token missing in response");

      this.authData = {
        sessiontoken: response.sessiontoken,
        regaintoken: response.regaintoken,
        serverEncryptionToken: await this.#updateEncryptionToken(
          loginSecret,
          response.sessiontoken
        ),
        deviceEncryptionToken: await this.#updateEncryptionToken(
          deviceSecret,
          response.sessiontoken
        ),
      };

      return this.authData;
    }

    async getDevices() {
      const { sessiontoken, serverEncryptionToken } = this.authData;

      const response = await this.#post(
        `/my/listdevices?sessiontoken=${sessiontoken}`,
        serverEncryptionToken,
        null,
        true
      );

      return response.list;
    }

    async addLinks(
      deviceId,
      links,
      autostart = false,
      packageName = null,
      destinationFolder = null
    ) {
      const { sessiontoken, deviceEncryptionToken } = this.authData;

      const action = "/linkgrabberv2/addLinks";
      let query = `/t_${encodeURIComponent(sessiontoken)}_${encodeURIComponent(
        deviceId
      )}${action}`;

      const payload = {
        links: links.join(","),
        autostart,
        priority: "DEFAULT",
        ...(packageName !== null && { packageName }),
        ...(destinationFolder !== null && {
          destinationFolder,
          overwritePackagizerRules: true,
        }),
      };

      return this.#post(query, deviceEncryptionToken, {
        url: action,
        params: [JSON.stringify(payload)],
        apiVer: 1,
      });
    }

    async #createSecret(email, password, domain) {
      return crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(email + password + domain)
      );
    }

    async #sign(key, data) {
      const encoder = new TextEncoder();
      const keyData = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign(
        "HMAC",
        keyData,
        encoder.encode(data)
      );
      return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    async #encrypt(data, ivKey) {
      const iv = ivKey.slice(0, 16);
      const key = ivKey.slice(16, 32);
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["encrypt"]
      );
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        new TextEncoder().encode(data)
      );
      return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    }

    async #decrypt(data, ivKey) {
      const iv = ivKey.slice(0, 16);
      const key = ivKey.slice(16, 32);
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
      );
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
      );
      return new TextDecoder().decode(decrypted);
    }

    async #updateEncryptionToken(oldToken, updateToken) {
      const updateTokenBytes = new Uint8Array(
        updateToken.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );
      const concatData = new Uint8Array([
        ...new Uint8Array(oldToken),
        ...updateTokenBytes,
      ]);
      return await crypto.subtle.digest("SHA-256", concatData);
    }

    async #post(path, encryptionToken, body = null, sign = false) {
      return new Promise(async (resolve, reject) => {
        const rid = Date.now();

        const url = new URL(path, this.API_URL);
        if (sign) {
          url.searchParams.set("rid", rid);
          const signature = await this.#sign(
            encryptionToken,
            url.pathname + url.search
          );
          url.searchParams.set("signature", signature);
        }

        const encryptedBody = body
          ? await this.#encrypt(
              JSON.stringify({ ...body, rid }),
              encryptionToken
            )
          : null;

        GM_xmlhttpRequest({
          method: "POST",
          url: url.toString(),
          headers: { "Content-Type": "application/aesjson-jd; charset=utf-8" },
          data: encryptedBody,
          responseType: "text",
          onload: async (response) => {
            if (response.status !== 200) {
              reject(`HTTP ${response.status}: ${response.responseText}`);
              return;
            }

            try {
              const decryptedResponse = JSON.parse(
                await this.#decrypt(response.responseText, encryptionToken)
              );

              if (decryptedResponse.rid !== rid) {
                reject(
                  "RID mismatch in response. Potential replay attack detected."
                );
                return;
              }

              resolve(decryptedResponse);
            } catch (err) {
              reject(`Error decrypting response: ${err.message}`);
            }
          },
          onerror: (error) => reject(`Request failed: ${error}`),
        });
      });
    }
  }

  setTimeout(async () => {
    if (supportedHostersRegex.test(window.location.href)) {
      insertTopBarButton();
    } else {
      addDirectLinkButtons();
    }

    window.addEventListener("message", async (event) => {
      console.log("test event", event.data?.action);
      if (event.data?.action === "autodownload") {
        console.log("send it to service");
        try {
          const service = services.find((s) => s.id === selectedService);
          await service.handler(window.location.href);

          console.log("✅ Autdownload sent");
          window.close();
        } catch (err) {
          console.error("❌ Error autodownload:", err);
        }
      }
      if (event.data?.action === "open") {
      }
    });
  }, 100);
})();
