(async function initGoogleAnalytics() {
    const isValidMeasurementId = (value) => /^(G|GT)-[A-Z0-9]+$/i.test(value || "");
    const recentEventTimestamps = new Map();

    const shouldSuppressDuplicate = (eventName, params = {}) => {
        const now = Date.now();
        const signature = `${eventName}|${JSON.stringify(params)}`;
        const lastTimestamp = recentEventTimestamps.get(signature) || 0;

        if (now - lastTimestamp < dedupeWindowMs) {
            return true;
        }

        recentEventTimestamps.set(signature, now);

        if (recentEventTimestamps.size > 100) {
            for (const [key, timestamp] of recentEventTimestamps.entries()) {
                if (now - timestamp > dedupeWindowMs * 2) {
                    recentEventTimestamps.delete(key);
                }
            }
        }

        return false;
    };

    const loadAnalyticsScript = () => new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-ga-loader="true"]');
        if (existingScript) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(window.__gaMeasurementId)}`;
        script.dataset.gaLoader = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Analytics script."));
        document.head.appendChild(script);
    });

    try {
        const schoolConfig = window.schoolConfigReady ? await window.schoolConfigReady : null;
        const integrations = schoolConfig && schoolConfig.integrations ? schoolConfig.integrations : {};

        const enabled = integrations.googleAnalyticsEnabled === true;
        const measurementId = String(integrations.googleAnalyticsMeasurementId || "").trim().toUpperCase();
        const debugByConfig = integrations.googleAnalyticsDebug === true;
        const debugByHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
        const isDebugMode = debugByConfig || debugByHost;
        const configuredDedupeMs = Number(integrations.googleAnalyticsDedupeMs);
        const dedupeWindowMs = Number.isFinite(configuredDedupeMs)
            ? Math.min(2000, Math.max(0, configuredDedupeMs))
            : 300;

        const debugLog = (message, payload = null) => {
            if (!isDebugMode) {
                return;
            }
            if (payload === null) {
                console.info(`[GA Debug] ${message}`);
                return;
            }
            console.info(`[GA Debug] ${message}`, payload);
        };

        if (!enabled || !isValidMeasurementId(measurementId)) {
            debugLog("Analytics skipped", {
                enabled,
                measurementIdValid: isValidMeasurementId(measurementId)
            });
            return;
        }

        if (window.__gaInitialized) {
            return;
        }

        window.__gaMeasurementId = measurementId;
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function gtag() {
            window.dataLayer.push(arguments);
        };

        window.gtag("js", new Date());
        window.gtag("config", measurementId, {
            anonymize_ip: true,
            transport_type: "beacon"
        });

        await loadAnalyticsScript();

        window.trackEvent = function trackEvent(eventName, params = {}) {
            if (!window.gtag) {
                return;
            }

            if (shouldSuppressDuplicate(eventName, params)) {
                debugLog(`Suppressed duplicate event: ${eventName}`, params);
                return;
            }

            window.gtag("event", eventName, params);
            debugLog(`Event: ${eventName}`, params);
        };

        debugLog("Analytics initialized", {
            measurementId,
            debugByConfig,
            debugByHost
        });

        const paymentTargetMap = {
            "global-payment-regular": "regular_fee",
            "global-payment-admission": "admission_fee",
            "global-payment-events": "events_fee",
            "global-payment-uniforms": "uniforms_books"
        };

        const admissionsTargetIds = new Set([
            "global-link-admissions",
            "global-link-admissions-nav",
            "global-link-admissions-footer",
            "global-link-admissions-hero"
        ]);

        const getAnchor = (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return null;
            }
            return target.closest("a, button");
        };

        document.addEventListener("click", (event) => {
            const element = getAnchor(event);
            if (!element) {
                return;
            }

            const id = element.id || "";
            const href = element instanceof HTMLAnchorElement ? (element.getAttribute("href") || "") : "";
            const normalizedHref = href.trim().toLowerCase();
            const label = (element.textContent || "").trim().slice(0, 80);

            if (paymentTargetMap[id]) {
                window.trackEvent("payment_click", {
                    payment_type: paymentTargetMap[id],
                    link_text: label
                });
                return;
            }

            if (admissionsTargetIds.has(id) || normalizedHref.endsWith("admissions.html")) {
                window.trackEvent("admissions_click", {
                    link_text: label,
                    link_url: href || ""
                });
                return;
            }

            if (normalizedHref.startsWith("tel:")) {
                window.trackEvent("contact_click", {
                    contact_type: "phone",
                    link_text: label
                });
                return;
            }

            if (normalizedHref.startsWith("mailto:")) {
                window.trackEvent("contact_click", {
                    contact_type: "email",
                    link_text: label
                });
                return;
            }

            if (normalizedHref.includes("maps.app.goo.gl") || normalizedHref.includes("google.com/maps")) {
                window.trackEvent("contact_click", {
                    contact_type: "maps",
                    link_text: label
                });
                return;
            }

            const socialHostMatchers = [
                { name: "facebook", pattern: /(^|\.)facebook\.com$/i },
                { name: "instagram", pattern: /(^|\.)instagram\.com$/i },
                { name: "youtube", pattern: /(^|\.)youtube\.com$/i },
                { name: "youtube", pattern: /(^|\.)youtu\.be$/i },
                { name: "twitter", pattern: /(^|\.)twitter\.com$/i },
                { name: "x", pattern: /(^|\.)x\.com$/i }
            ];

            const resolveSocialPlatform = (urlText) => {
                if (!urlText || !/^https?:/i.test(urlText)) {
                    return null;
                }
                try {
                    const hostname = new URL(urlText).hostname;
                    const matched = socialHostMatchers.find((item) => item.pattern.test(hostname));
                    return matched ? matched.name : null;
                } catch {
                    return null;
                }
            };

            const socialPlatform = resolveSocialPlatform(href || "");
            if (socialPlatform) {
                window.trackEvent("social_click", {
                    platform: socialPlatform,
                    link_url: href || "",
                    link_text: label
                });
                return;
            }

            if (element instanceof HTMLAnchorElement && (element.hasAttribute("download") || normalizedHref.endsWith(".pdf"))) {
                window.trackEvent("download_click", {
                    file_url: href || "",
                    link_text: label
                });
            }
        }, { passive: true });

        window.__gaInitialized = true;
    } catch (error) {
        console.warn("Google Analytics initialization skipped:", error);
    }
})();
