(function () {
  "use strict";

  var CACHE_PREFIX = "tribetip_widget_config:v3:";
  var CACHE_TTL_MS = 60000;
  var REFRESH_MS = 60000;
  var TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,48}$/;
  var HIGHLIGHT_COLOR = "#f5b942";
  var DEFAULT_POSITION = "bottom-right";

  var script = document.currentScript;
  if (!script) {
    return;
  }

  var token = "";
  try {
    token = new URL(script.src).searchParams.get("token") || "";
  } catch (error) {
    console.warn("[Tribetip] Widget: invalid script URL.");
    return;
  }

  if (!TOKEN_PATTERN.test(token)) {
    console.warn("[Tribetip] Widget: missing or invalid token.");
    return;
  }

  function resolveApiBase() {
    var explicit = script.getAttribute("data-api");
    if (explicit) {
      return explicit.replace(/\/$/, "");
    }

    try {
      var scriptUrl = new URL(script.src);
      var host = scriptUrl.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return scriptUrl.protocol + "//" + host + ":3001";
      }
      if (host === "tribetip.africa") {
        return "https://api.tribetip.africa";
      }
      return scriptUrl.protocol + "//api." + host;
    } catch (error) {
      return "";
    }
  }

  var apiBase = resolveApiBase();
  if (!apiBase) {
    console.warn("[Tribetip] Widget: could not resolve API URL.");
    return;
  }

  var currentConfigJson = "";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readCachedEntry() {
    try {
      var raw = sessionStorage.getItem(CACHE_PREFIX + token);
      if (!raw) {
        return null;
      }

      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.config || !parsed.cached_at) {
        return null;
      }

      if (Date.now() - parsed.cached_at > CACHE_TTL_MS) {
        return null;
      }

      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeCachedConfig(config) {
    try {
      sessionStorage.setItem(
        CACHE_PREFIX + token,
        JSON.stringify({
          config: config,
          cached_at: Date.now(),
        }),
      );
    } catch (error) {
      // Ignore quota or privacy mode errors.
    }
  }

  function clearCachedConfig() {
    try {
      sessionStorage.removeItem(CACHE_PREFIX + token);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function removeWidgetHost() {
    var host = document.querySelector("[data-tribetip-widget-host]");
    if (host) {
      host.remove();
    }
  }

  function loadConfig(onReady, options) {
    var silent = options && options.silent;

    fetch(apiBase + "/widget/config?token=" + encodeURIComponent(token), {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(function (response) {
        if (response.status === 404) {
          clearCachedConfig();
          removeWidgetHost();
          return null;
        }

        if (!response.ok) {
          throw new Error("config unavailable");
        }

        return response.json();
      })
      .then(function (payload) {
        if (!payload) {
          return;
        }

        var config = payload && payload.config;
        if (!config || !config.destination_url) {
          clearCachedConfig();
          removeWidgetHost();
          return;
        }

        writeCachedConfig(config);
        onReady(config);
      })
      .catch(function () {
        var cached = readCachedEntry();
        if (cached && cached.config && cached.config.destination_url) {
          onReady(cached.config);
          return;
        }

        removeWidgetHost();

        if (!silent) {
          console.warn("[Tribetip] Widget: could not load configuration.");
        }
      });
  }

  function positionStyles(position) {
    switch (position || DEFAULT_POSITION) {
      case "bottom-left":
        return "left:20px;bottom:20px;";
      case "top-right":
        return "right:20px;top:20px;";
      case "top-left":
        return "left:20px;top:20px;";
      default:
        return "right:20px;bottom:20px;";
    }
  }

  function creatorInitials(displayName) {
    return String(displayName || "")
      .split(/\s+/)
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .join("")
      .slice(0, 2);
  }

  function openDestination(config) {
    var destination = config.destination_url;
    if (!destination) {
      return;
    }

    if (config.open_same_tab) {
      window.location.assign(destination);
      return;
    }

    window.open(destination, "_blank", "noopener,noreferrer");
  }

  function buildAvatarMarkup(config) {
    if (config.icon_url) {
      return (
        '<img class="avatar-img" src="' +
        escapeHtml(config.icon_url) +
        '" alt="" />'
      );
    }

    return (
      '<span class="avatar-initials" aria-hidden="true">' +
      escapeHtml(creatorInitials(config.display_name || config.app_name)) +
      "</span>"
    );
  }

  function buildPresetMarkup(presets) {
    var labels = Array.isArray(presets) && presets.length >= 3
      ? presets.slice(0, 3)
      : ["", "", "Custom"];

    return labels
      .map(function (label, index) {
        var featured = index === 1 ? " preset-featured" : "";
        return (
          '<div class="preset' +
          featured +
          '">' +
          escapeHtml(label) +
          "</div>"
        );
      })
      .join("");
  }

  function render(config) {
    var nextConfigJson = JSON.stringify(config);
    if (nextConfigJson === currentConfigJson && document.querySelector("[data-tribetip-widget-host]")) {
      return;
    }

    currentConfigJson = nextConfigJson;
    removeWidgetHost();

    var position = config.position || DEFAULT_POSITION;
    var username = config.username || "";
    var displayName = config.display_name || config.app_name || username;
    var bio =
      config.bio ||
      "If my work helped you today, send a tip — it keeps everything free for everyone.";
    var countryLabel = config.country_label || "Creator";
    var buttonLabel = config.cta_text || ("Support @" + username);
    var paymentHint = config.payment_hint || "No account needed · Pay securely online";

    var host = document.createElement("div");
    host.setAttribute("data-tribetip-widget-host", "");
    var shadow = host.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.textContent =
      ":host{all:initial;}" +
      ".wrap{position:fixed;z-index:2147483000;pointer-events:none;" +
      positionStyles(position) +
      "max-width:min(320px,calc(100vw - 40px));font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}" +
      ".card{pointer-events:auto;cursor:pointer;border:1px solid #ebe6df;background:#fff;border-radius:24px;padding:20px;" +
      "box-shadow:0 2px 16px rgba(26,26,26,.06),0 12px 40px rgba(26,26,26,.08);transition:transform .15s ease,box-shadow .15s ease;}" +
      ".card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(26,26,26,.08),0 16px 44px rgba(26,26,26,.1);}" +
      ".card:focus-visible{outline:2px solid #247a45;outline-offset:3px;}" +
      ".header{display:flex;align-items:center;gap:12px;}" +
      ".avatar{flex-shrink:0;width:56px;height:56px;border-radius:16px;background:#fff8e6;display:flex;align-items:center;justify-content:center;overflow:hidden;}" +
      ".avatar-img{width:100%;height:100%;object-fit:cover;}" +
      ".avatar-initials{font-size:18px;font-weight:700;color:#247a45;}" +
      ".identity{min-width:0;}" +
      ".username{margin:0;font-size:14px;font-weight:700;color:#1a1a1a;}" +
      ".subtitle{margin:2px 0 0;font-size:13px;color:#6b6b6b;}" +
      ".bio{margin:14px 0 0;font-size:14px;line-height:1.55;color:#4a4a4a;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}" +
      ".presets{margin-top:18px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}" +
      ".preset{border-radius:12px;background:#f7f4ef;padding:10px 6px;text-align:center;font-size:11px;font-weight:700;color:#1a1a1a;}" +
      ".preset-featured{background:" +
      HIGHLIGHT_COLOR +
      ";}" +
      ".cta{margin-top:14px;border-radius:9999px;background:" +
      HIGHLIGHT_COLOR +
      ";padding:12px 16px;text-align:center;font-size:14px;font-weight:700;color:#1a1a1a;}" +
      ".footer{margin:10px 0 0;text-align:center;font-size:11px;color:#6b6b6b;line-height:1.4;}" +
      "@media (max-width:640px){.wrap{max-width:min(300px,calc(100vw - 24px));}.card{padding:16px;border-radius:20px;}.bio{-webkit-line-clamp:2;}}";

    var card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.setAttribute("aria-label", buttonLabel + ". Opens tip page in a new tab.");
    card.innerHTML =
      '<div class="header">' +
      '<div class="avatar">' +
      buildAvatarMarkup(config) +
      "</div>" +
      '<div class="identity">' +
      '<p class="username">@' +
      escapeHtml(username) +
      "</p>" +
      '<p class="subtitle">' +
      escapeHtml(countryLabel) +
      "</p>" +
      "</div>" +
      "</div>" +
      '<p class="bio">' +
      escapeHtml(bio) +
      "</p>" +
      '<div class="presets" aria-hidden="true">' +
      buildPresetMarkup(config.tip_presets) +
      "</div>" +
      '<div class="cta">' +
      escapeHtml(buttonLabel) +
      "</div>" +
      '<p class="footer">' +
      escapeHtml(paymentHint) +
      "</p>";

    card.addEventListener("click", function () {
      openDestination(config);
    });

    var wrap = document.createElement("div");
    wrap.className = "wrap";
    wrap.appendChild(card);
    shadow.appendChild(style);
    shadow.appendChild(wrap);

    document.body.appendChild(host);
  }

  function boot() {
    loadConfig(render);

    window.setInterval(function () {
      loadConfig(render, { silent: true });
    }, REFRESH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
