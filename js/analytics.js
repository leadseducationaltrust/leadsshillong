(async function initGoogleAnalytics() {
    const isValidMeasurementId = (value) => /^(G|GT)-[A-Z0-9]+$/i.test(value || "");

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

        if (!enabled || !isValidMeasurementId(measurementId)) {
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
            window.gtag("event", eventName, params);
        };

        window.__gaInitialized = true;
    } catch (error) {
        console.warn("Google Analytics initialization skipped:", error);
    }
})();
