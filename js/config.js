const fallbackSchoolData = {
    site: {
        templateName: "School Website Template",
        version: "1.0.0",
        technology: {
            frontend: "HTML",
            styling: "Tailwind CSS",
            scripting: "JavaScript"
        },
        hosting: {
            provider: "GitHub Pages",
            repository: "your-org/your-school-website"
        }
    },
    designTokens: {
        colors: {
            primary: "#1D4ED8",
            secondary: "#0F766E",
            accent: "#F59E0B",
            background: "#FFFFFF",
            surface: "#F8FAFC",
            text: "#0F172A"
        },
        borderRadius: {
            small: "0.375rem",
            medium: "0.5rem",
            large: "0.75rem",
            pill: "9999px"
        },
        fontFamily: {
            heading: "Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
            body: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
            mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        }
    },
    seo: {
        metadata: {
            title: "LEADS Higher Secondary School | Empowering Minds, Shaping Futures",
            description: "A reusable school website template powered by HTML, Tailwind CSS, JavaScript, and JSON-driven content.",
            keywords: ["school", "education", "higher secondary", "admissions", "academic excellence", "school website template"],
            author: "LEADS Higher Secondary School",
            robots: "index, follow"
        },
        openGraph: {
            title: "LEADS Higher Secondary School",
            description: "Discover our academic programs, admissions, faculty, and student life.",
            type: "website",
            url: "https://www.leadsshillong.com",
            image: "/school-logo.jpg",
            siteName: "LEADS Higher Secondary School",
            locale: "en_IN"
        },
        twitter: {
            card: "summary_large_image",
            title: "LEADS Higher Secondary School",
            description: "Empowering Minds, Shaping Futures",
            image: "/school-logo.jpg"
        }
    },
    identity: {
        fullName: "LEADS Higher Secondary School",
        shortName: "LEADS",
        tagline: "Empowering Minds, Shaping Futures",
        establishedYear: 2010,
        logoPath: "/school-logo.jpg"
    },
    contact: {
        primaryPhone: "+91 88372 48004",
        secondaryPhone: "+91 94854 34534",
        website: "https://www.leadsshillong.com",
        emailGeneral: "support@leadsschool.com",
        emailAdmissions: "support@leadsschool.com",
        workingDays: "Monday - Friday",
        workingHours: "9:00 AM - 3:00 PM"
    },
    location: {
        street: "Langkerding, Nongmensong",
        city: "Shillong",
        state: "Meghalaya",
        pinCode: "793019",
        googleMapsLink: "https://maps.app.goo.gl/Df9prKuJYtpbhnHg6",
        googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.419033678317!2d91.9067664!3d25.590988499999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37507fd0a24eb3dd%3A0x9d32cb52d67507b9!2sLeads%20Higher%20Secondary%20School!5e0!3m2!1sen!2sin!4v1770129373388!5m2!1sen!2sin"
    },
    socials: {
        facebook: "https://facebook.com/leadsshillong",
        instagram: "https://instagram.com/leadsshillong",
        youtube: "https://www.youtube.com/@leadsshillong",
        twitter: "https://twitter.com/leadsshillong"
    },
    academics: {
        currentSession: "2026-2027",
        admissionStatus: "Open",
        admissionFormLink: "admissions.html"
    },
    academicStructure: {
        classesOffered: [
            "Play School", "Nursery", "LKG", "UKG", "Class I", "Class II", "Class III", "Class IV",
            "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X", "Class XI", "Class XII"
        ],
        subjects: {
            primary: ["English", "Mathematics", "Environmental Studies", "General Science", "Social Studies", "Computer Basics"],
            middle: ["English", "Mathematics", "Science", "Social Science", "Computer Science", "Second Language"],
            secondary: ["English", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "Economics", "Computer Applications"],
            higherSecondary: {
                science: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science"],
                arts: ["History", "Political Science", "Economics", "Sociology", "Education"]
            }
        },
        houseSystem: {
            enabled: true,
            houses: [
                { name: "Red House", motto: "Courage and Commitment", color: "#DC2626" },
                { name: "Blue House", motto: "Discipline and Determination", color: "#2563EB" },
                { name: "Green House", motto: "Growth and Gratitude", color: "#16A34A" },
                { name: "Yellow House", motto: "Excellence and Enthusiasm", color: "#EAB308" }
            ]
        }
    },
    leadership: {
        principal: {
            name: "Principal Name",
            designation: "Principal",
            photo: "/media/principal.jpg",
            message: "Welcome message from the Principal goes here. This can be edited from Decap CMS.",
            signatureName: "Principal Name"
        },
        chairperson: {
            name: "Chairperson Name",
            message: "Message from the Chairperson goes here.",
            photo: "/media/chairperson.jpg"
        }
    },
    featureToggles: {
        showAdmissions: true,
        showGallery: true,
        showResults: true,
        showNews: true,
        showPrograms: true,
        showFaculty: true,
        showDownloads: true,
        showCalendar: true,
        showThoughtOfTheDay: true,
        showContactForm: true,
        showOnlinePayments: true,
        showChatWidget: true
    },
    payments: {
        regularFee: "https://rzp.io/l/Ze17MQO3sa",
        admissionFee: "https://rzp.io/l/admission_link",
        eventsFee: "https://rzp.io/l/events_link",
        uniformsBooks: "https://rzp.io/l/uniforms_link"
    }
};

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, override) {
    if (!isPlainObject(base) || !isPlainObject(override)) {
        return override === undefined ? base : override;
    }

    const merged = { ...base };
    Object.keys(override).forEach((key) => {
        const baseValue = base[key];
        const overrideValue = override[key];

        if (Array.isArray(baseValue) && Array.isArray(overrideValue)) {
            merged[key] = overrideValue;
            return;
        }

        if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
            merged[key] = deepMerge(baseValue, overrideValue);
            return;
        }

        merged[key] = overrideValue;
    });

    return merged;
}

async function loadSchoolConfig() {
    try {
        const response = await fetch("/admin/config.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Failed to load admin/config.json: ${response.status}`);
        }

        const data = await response.json();
        return deepMerge(fallbackSchoolData, data);
    } catch (error) {
        console.warn("Using fallback school metadata:", error);
        return fallbackSchoolData;
    }
}

window.loadSchoolConfig = loadSchoolConfig;
window.schoolConfigReady = loadSchoolConfig().then((config) => {
    window.schoolConfig = {
        ...config,
        contact: {
            ...config.contact,
            phone1: config.contact.primaryPhone
        }
    };
    return window.schoolConfig;
});

document.addEventListener("DOMContentLoaded", async () => {
    const schoolData = await window.schoolConfigReady;
    const featureToggles = schoolData.featureToggles || {};
    const hasExplicitScheme = (value) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);

    const normalizeSafeUrl = (value, options = {}) => {
        if (value === undefined || value === null) {
            return null;
        }

        const {
            allowRelative = true,
            allowedProtocols = ["http:", "https:", "mailto:", "tel:"]
        } = options;

        const text = String(value).trim();
        if (!text) {
            return null;
        }

        if (!hasExplicitScheme(text)) {
            return allowRelative ? text : null;
        }

        try {
            const parsed = new URL(text);
            return allowedProtocols.includes(parsed.protocol) ? text : null;
        } catch {
            return null;
        }
    };

    const hardenExternalTargets = () => {
        document.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
            const currentRel = (anchor.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
            const relValues = new Set(currentRel);
            relValues.add("noopener");
            relValues.add("noreferrer");
            anchor.setAttribute("rel", Array.from(relValues).join(" "));
        });
    };

    const injectText = (ids, text) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        idArray.forEach((id) => {
            const element = document.getElementById(id);
            if (element && text !== undefined && text !== null) {
                element.innerText = text;
            }
        });
    };

    injectText(["global-school-name", "global-school-name-footer"], schoolData.identity.fullName);
    injectText(["global-school-shortname", "global-school-shortname-footer"], schoolData.identity.shortName);
    injectText("global-tagline", schoolData.identity.tagline);
    injectText(["global-phone-1", "global-phone-1-footer", "contact-card-phone"], schoolData.contact.primaryPhone);
    injectText("global-phone-2", schoolData.contact.secondaryPhone);
    injectText(["global-email-general", "global-email-general-footer"], schoolData.contact.emailGeneral);
    injectText("global-email-admissions", schoolData.contact.emailAdmissions);
    injectText("global-working-days", schoolData.contact.workingDays);
    injectText("global-working-hours", schoolData.contact.workingHours);

    const displayWebsite = (schoolData.contact.website || "").replace(/^https?:\/\//, "");
    injectText("global-website-text", displayWebsite);

    injectText(["global-address-street", "global-address-street-footer", "contact-card-street"], schoolData.location.street);
    injectText(["global-address-city", "contact-card-city"], `${schoolData.location.city} ${schoolData.location.state} - ${schoolData.location.pinCode}`);
    injectText("global-session", schoolData.academics.currentSession);

    const currentYear = new Date().getFullYear();
    injectText("global-copyright", `© ${currentYear} ${schoolData.identity.fullName}. All Rights Reserved.`);

    const injectLink = (ids, url, options = {}) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        const safeUrl = normalizeSafeUrl(url, options);
        idArray.forEach((id) => {
            const element = document.getElementById(id);
            if (element && safeUrl) {
                element.href = safeUrl;
            }
        });
    };

    injectLink("global-link-website", schoolData.contact.website);
    injectLink("global-link-fb", schoolData.socials.facebook);
    injectLink("global-link-ig", schoolData.socials.instagram);
    injectLink("global-link-yt", schoolData.socials.youtube);
    injectLink("global-link-maps", schoolData.location.googleMapsLink);
    injectLink(["global-link-phone-1", "global-link-phone-footer", "contact-card-phone-link"], `tel:${(schoolData.contact.primaryPhone || "").replace(/\s+/g, "")}`);
    injectLink(["global-link-email-general", "global-link-email-footer"], `mailto:${schoolData.contact.emailGeneral}`);
    injectLink(["global-link-admissions", "global-link-admissions-nav", "global-link-admissions-footer", "global-link-admissions-hero"], schoolData.academics.admissionFormLink);
    injectLink("global-payment-regular", schoolData.payments.regularFee);
    injectLink("global-payment-admission", schoolData.payments.admissionFee);
    injectLink("global-payment-events", schoolData.payments.eventsFee);
    injectLink("global-payment-uniforms", schoolData.payments.uniformsBooks);

    const injectSrc = (ids, url, options = {}) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        const safeUrl = normalizeSafeUrl(url, {
            allowRelative: true,
            allowedProtocols: ["http:", "https:"],
            ...options
        });
        idArray.forEach((id) => {
            const element = document.getElementById(id);
            if (element && safeUrl) {
                element.src = safeUrl;
            }
        });
    };

    injectSrc("global-map-iframe", schoolData.location.googleMapsEmbed, {
        allowRelative: false,
        allowedProtocols: ["https:"]
    });
    hardenExternalTargets();

    const hideElement = (element) => {
        if (!element) {
            return;
        }
        element.style.display = "none";
        element.setAttribute("aria-hidden", "true");
    };

    const hideBySelector = (selector, options = {}) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
            if (options.closest) {
                hideElement(element.closest(options.closest) || element);
                return;
            }
            hideElement(element);
        });
    };

    const applyFeatureToggles = () => {
        const toggleRules = {
            showAdmissions: [
                { selector: "a[href$='admissions.html']", closest: "li" },
                { selector: "#global-link-admissions-hero" },
                { selector: "[data-feature='admissions']" }
            ],
            showGallery: [
                { selector: "a[href$='gallery.html']", closest: "li" },
                { selector: "[data-feature='gallery']" }
            ],
            showResults: [
                { selector: "a[href*='result']", closest: "li" },
                { selector: "[data-feature='results']" }
            ],
            showNews: [
                { selector: "a[href$='news.html']", closest: "li" },
                { selector: "#news-alerts-modal" },
                { selector: "[data-feature='news']" }
            ],
            showPrograms: [
                { selector: "a[href$='programs.html']", closest: "li" },
                { selector: ".academic-programmes" },
                { selector: "[data-feature='programs']" }
            ],
            showFaculty: [
                { selector: "a[href$='faculty.html']", closest: "li" },
                { selector: "[data-feature='faculty']" }
            ],
            showDownloads: [
                { selector: "a[href$='downloads.html']", closest: "li" },
                { selector: "[data-feature='downloads']" }
            ],
            showCalendar: [
                { selector: "#calendar-grid", closest: "aside" },
                { selector: "[data-feature='calendar']" }
            ],
            showThoughtOfTheDay: [
                { selector: "#thought-panel" },
                { selector: "[data-feature='thought']" }
            ],
            showContactForm: [
                { selector: "#contact-form" },
                { selector: "[data-feature='contact-form']" }
            ],
            showOnlinePayments: [
                { selector: "#global-payment-regular" },
                { selector: "#global-payment-admission" },
                { selector: "#global-payment-events" },
                { selector: "#global-payment-uniforms" },
                { selector: "[data-feature='online-payments']" }
            ]
        };

        Object.entries(toggleRules).forEach(([toggleKey, rules]) => {
            if (featureToggles[toggleKey] !== false) {
                return;
            }
            rules.forEach((rule) => hideBySelector(rule.selector, { closest: rule.closest }));
        });

        if (featureToggles.showNews === false) {
            const newsMarquee = document.getElementById("news-marquee");
            hideElement(newsMarquee ? newsMarquee.closest("div.cursor-pointer") : null);
        }
    };

    applyFeatureToggles();

    if (schoolData.featureToggles.showChatWidget) {
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        (function () {
            var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = "https://embed.tawk.to/5e9d854435bcbb0c9ab2de75/default";
            s1.charset = "UTF-8";
            s1.setAttribute("crossorigin", "*");
            s0.parentNode.insertBefore(s1, s0);
        })();
    }
});