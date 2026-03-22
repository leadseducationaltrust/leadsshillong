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
            primary: "#059669",
            secondary: "#1E3A8A",
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
    theme: {
        activeTheme: "Universal",
        description: "Balanced and modern theme suitable for school websites.",
        themes: [
            {
                name: "Universal",
                active: true,
                description: "Balanced and modern theme suitable for school websites.",
                tokens: {
                    primary: "#059669",
                    primaryLight: "#34D399",
                    primaryDark: "#047857",
                    secondary: "#1E3A8A",
                    secondaryLight: "#3B82F6",
                    secondaryDark: "#1E40AF",
                    accent: "#D97706",
                    accentLight: "#F59E0B",
                    accentDark: "#B45309",
                    background: "#FFFFFF",
                    surface: "#F8FAFC",
                    text: "#0F172A",
                    mutedText: "#475569"
                }
            },
            {
                name: "Ocean Blue",
                active: false,
                description: "Clean blue palette with a professional institutional look.",
                tokens: {
                    primary: "#0EA5E9",
                    primaryLight: "#BAE6FD",
                    primaryDark: "#0369A1",
                    secondary: "#3B82F6",
                    secondaryLight: "#BFDBFE",
                    secondaryDark: "#1D4ED8",
                    accent: "#38BDF8",
                    accentLight: "#E0F2FE",
                    accentDark: "#0284C7",
                    background: "#F8FBFF",
                    surface: "#F0F7FF",
                    text: "#0F172A",
                    mutedText: "#475569"
                }
            },
            {
                name: "Forest Green",
                active: false,
                description: "Nature-inspired green tones for a calm and growth-centric identity.",
                tokens: {
                    primary: "#22C55E",
                    primaryLight: "#BBF7D0",
                    primaryDark: "#15803D",
                    secondary: "#10B981",
                    secondaryLight: "#A7F3D0",
                    secondaryDark: "#047857",
                    accent: "#84CC16",
                    accentLight: "#ECFCCB",
                    accentDark: "#65A30D",
                    background: "#F7FFF8",
                    surface: "#ECFDF3",
                    text: "#14532D",
                    mutedText: "#3F6212"
                }
            },
            {
                name: "Royal Purple",
                active: false,
                description: "Premium purple-blue styling for a distinctive academic brand.",
                tokens: {
                    primary: "#A78BFA",
                    primaryLight: "#E9D5FF",
                    primaryDark: "#7C3AED",
                    secondary: "#818CF8",
                    secondaryLight: "#C7D2FE",
                    secondaryDark: "#4F46E5",
                    accent: "#F472B6",
                    accentLight: "#FCE7F3",
                    accentDark: "#DB2777",
                    background: "#FCFAFF",
                    surface: "#F5F3FF",
                    text: "#3B0764",
                    mutedText: "#5B4B8A"
                }
            },
            {
                name: "Sunset Warm",
                active: false,
                description: "Energetic orange-red palette ideal for a vibrant school presence.",
                tokens: {
                    primary: "#FB923C",
                    primaryLight: "#FED7AA",
                    primaryDark: "#EA580C",
                    secondary: "#F59E0B",
                    secondaryLight: "#FDE68A",
                    secondaryDark: "#D97706",
                    accent: "#F87171",
                    accentLight: "#FEE2E2",
                    accentDark: "#EF4444",
                    background: "#FFFBF7",
                    surface: "#FFF1E8",
                    text: "#431407",
                    mutedText: "#9A3412"
                }
            },
            {
                name: "Pastel Light",
                active: false,
                description: "Soft pastel palette with gentle contrast for a light, airy visual style.",
                tokens: {
                    primary: "#7DD3FC",
                    primaryLight: "#E0F2FE",
                    primaryDark: "#38BDF8",
                    secondary: "#A5B4FC",
                    secondaryLight: "#E0E7FF",
                    secondaryDark: "#818CF8",
                    accent: "#F9A8D4",
                    accentLight: "#FCE7F3",
                    accentDark: "#F472B6",
                    background: "#FFFCFF",
                    surface: "#F8FAFF",
                    text: "#334155",
                    mutedText: "#64748B"
                }
            }
        ]
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
    integrations: {
        googleAnalyticsEnabled: false,
        googleAnalyticsMeasurementId: "",
        googleAnalyticsDebug: false,
        googleAnalyticsDedupeMs: 300,
        cusdisEnabled: false,
        cusdisAppId: "",
        cusdisHost: "https://cusdis.com"
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

function isUnsafeMergeKey(key) {
    return key === "__proto__" || key === "prototype" || key === "constructor";
}

function deepMerge(base, override) {
    if (!isPlainObject(base) || !isPlainObject(override)) {
        return override === undefined ? base : override;
    }

    const merged = { ...base };
    Object.keys(override).forEach((key) => {
        if (isUnsafeMergeKey(key)) {
            return;
        }

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

function normalizeThemeName(value) {
    return String(value || "").trim().toLowerCase();
}

function getDefaultThemeTokens(config) {
    const colors = (config && config.designTokens && config.designTokens.colors) || {};
    return {
        primary: colors.primary || "#059669",
        primaryLight: colors.primary || "#34D399",
        primaryDark: colors.primary || "#047857",
        secondary: colors.secondary || "#1E3A8A",
        secondaryLight: colors.secondary || "#3B82F6",
        secondaryDark: colors.secondary || "#1E40AF",
        accent: colors.accent || "#D97706",
        accentLight: colors.accent || "#F59E0B",
        accentDark: colors.accent || "#B45309",
        background: colors.background || "#FFFFFF",
        surface: colors.surface || "#F8FAFC",
        text: colors.text || "#0F172A",
        mutedText: "#475569"
    };
}

function resolveActiveTheme(config) {
    const fallbackTokens = getDefaultThemeTokens(config);
    const fallbackTheme = {
        name: "Universal",
        active: true,
        description: "Balanced and modern theme suitable for school websites.",
        tokens: fallbackTokens
    };

    if (!config || !isPlainObject(config.theme)) {
        return {
            ...fallbackTheme,
            normalizedThemes: [fallbackTheme]
        };
    }

    const themeConfig = config.theme;
    const availableThemes = Array.isArray(themeConfig.themes)
        ? themeConfig.themes.filter((item) => isPlainObject(item))
        : [];

    const normalizedActiveTheme = normalizeThemeName(themeConfig.activeTheme);
    const normalizedDefaultTheme = normalizeThemeName(themeConfig.defaultTheme || "Universal");
    const explicitlyActiveThemes = availableThemes.filter((theme) => theme.active === true);

    if (explicitlyActiveThemes.length > 1) {
        console.warn("Multiple themes are marked active. Keeping one active theme automatically.");
    }

    let selectedTheme = null;
    if (explicitlyActiveThemes.length === 1) {
        selectedTheme = explicitlyActiveThemes[0];
    }

    if (!selectedTheme && explicitlyActiveThemes.length > 1 && normalizedActiveTheme) {
        selectedTheme = explicitlyActiveThemes.find((theme) => normalizeThemeName(theme.name) === normalizedActiveTheme);
    }

    if (!selectedTheme && explicitlyActiveThemes.length > 0) {
        selectedTheme = explicitlyActiveThemes[0];
    }

    if (!selectedTheme && normalizedActiveTheme) {
        selectedTheme = availableThemes.find((theme) => normalizeThemeName(theme.name) === normalizedActiveTheme);
    }
    if (!selectedTheme && normalizedDefaultTheme) {
        selectedTheme = availableThemes.find((theme) => normalizeThemeName(theme.name) === normalizedDefaultTheme);
    }
    if (!selectedTheme) {
        selectedTheme = availableThemes.find((theme) => normalizeThemeName(theme.name) === "universal") || availableThemes[0];
    }

    if (!selectedTheme) {
        return {
            ...fallbackTheme,
            normalizedThemes: [fallbackTheme]
        };
    }

    const selectedThemeName = normalizeThemeName(selectedTheme.name || "Universal");
    const normalizedThemes = availableThemes.map((theme) => ({
        ...theme,
        active: normalizeThemeName(theme.name) === selectedThemeName
    }));

    return {
        name: selectedTheme.name || "Universal",
        active: true,
        description: selectedTheme.description || themeConfig.description || fallbackTheme.description,
        tokens: deepMerge(fallbackTokens, selectedTheme.tokens || {}),
        normalizedThemes
    };
}

function applyActiveTheme(theme) {
    if (!theme || !theme.tokens || typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;
    const styleId = "global-theme-overrides";
    let styleTag = document.getElementById(styleId);
    const isUniversalTheme = normalizeThemeName(theme.name) === "universal";

    if (isUniversalTheme) {
        root.setAttribute("data-theme", "Universal");
        if (styleTag) {
            styleTag.textContent = "";
        }
        return;
    }

    const { tokens } = theme;
    const cssVariables = {
        "--theme-primary": tokens.primary,
        "--theme-primary-light": tokens.primaryLight,
        "--theme-primary-dark": tokens.primaryDark,
        "--theme-secondary": tokens.secondary,
        "--theme-secondary-light": tokens.secondaryLight,
        "--theme-secondary-dark": tokens.secondaryDark,
        "--theme-accent": tokens.accent,
        "--theme-accent-light": tokens.accentLight,
        "--theme-accent-dark": tokens.accentDark,
        "--theme-background": tokens.background,
        "--theme-surface": tokens.surface,
        "--theme-text": tokens.text,
        "--theme-muted": tokens.mutedText
    };

    Object.entries(cssVariables).forEach(([name, value]) => {
        if (value) {
            root.style.setProperty(name, value);
        }
    });

    root.setAttribute("data-theme", theme.name);

    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
        body { background-color: var(--theme-background); color: var(--theme-text); }
        .text-emerald-50, .text-emerald-100, .text-emerald-200 { color: var(--theme-primary-light) !important; }
        .text-emerald-300, .text-emerald-400, .text-emerald-500, .text-emerald-600, .text-emerald-700, .text-emerald-900,
        .text-teal-600, .text-indigo-600, .text-indigo-700, .text-purple-600, .text-pink-600 { color: var(--theme-primary) !important; }
        .text-blue-600, .text-blue-700, .text-blue-800, .text-blue-900,
        .text-slate-700, .text-slate-800, .text-slate-900 { color: var(--theme-secondary-dark) !important; }
        .text-amber-600, .text-amber-700, .text-amber-800, .text-yellow-600, .text-orange-500 { color: var(--theme-accent) !important; }
        .bg-blue-600 .text-emerald-300, .bg-blue-600 .text-emerald-400,
        .bg-blue-700 .text-emerald-300, .bg-blue-700 .text-emerald-400,
        .bg-blue-800 .text-emerald-300, .bg-blue-800 .text-emerald-400,
        .bg-blue-900 .text-emerald-300, .bg-blue-900 .text-emerald-400,
        .bg-slate-900 .text-emerald-300, .bg-slate-900 .text-emerald-400,
        [class*="from-blue-"] .text-emerald-300, [class*="from-blue-"] .text-emerald-400,
        [class*="to-blue-"] .text-emerald-300, [class*="to-blue-"] .text-emerald-400 { color: var(--theme-primary-light) !important; }
        .bg-blue-600 .text-amber-600, .bg-blue-600 .text-amber-700, .bg-blue-600 .text-amber-800, .bg-blue-600 .text-yellow-600, .bg-blue-600 .text-orange-500,
        .bg-blue-700 .text-amber-600, .bg-blue-700 .text-amber-700, .bg-blue-700 .text-amber-800, .bg-blue-700 .text-yellow-600, .bg-blue-700 .text-orange-500,
        .bg-blue-800 .text-amber-600, .bg-blue-800 .text-amber-700, .bg-blue-800 .text-amber-800, .bg-blue-800 .text-yellow-600, .bg-blue-800 .text-orange-500,
        .bg-blue-900 .text-amber-600, .bg-blue-900 .text-amber-700, .bg-blue-900 .text-amber-800, .bg-blue-900 .text-yellow-600, .bg-blue-900 .text-orange-500,
        .bg-slate-900 .text-amber-600, .bg-slate-900 .text-amber-700, .bg-slate-900 .text-amber-800, .bg-slate-900 .text-yellow-600, .bg-slate-900 .text-orange-500,
        [class*="from-blue-"] .text-amber-600, [class*="from-blue-"] .text-amber-700, [class*="from-blue-"] .text-amber-800, [class*="from-blue-"] .text-yellow-600, [class*="from-blue-"] .text-orange-500,
        [class*="to-blue-"] .text-amber-600, [class*="to-blue-"] .text-amber-700, [class*="to-blue-"] .text-amber-800, [class*="to-blue-"] .text-yellow-600, [class*="to-blue-"] .text-orange-500 { color: var(--theme-accent-light) !important; }
        .bg-blue-600 .text-gray-300, .bg-blue-600 .text-gray-400, .bg-blue-600 .text-gray-500, .bg-blue-600 .text-slate-400,
        .bg-blue-700 .text-gray-300, .bg-blue-700 .text-gray-400, .bg-blue-700 .text-gray-500, .bg-blue-700 .text-slate-400,
        .bg-blue-800 .text-gray-300, .bg-blue-800 .text-gray-400, .bg-blue-800 .text-gray-500, .bg-blue-800 .text-slate-400,
        .bg-blue-900 .text-gray-300, .bg-blue-900 .text-gray-400, .bg-blue-900 .text-gray-500, .bg-blue-900 .text-slate-400,
        .bg-slate-900 .text-gray-300, .bg-slate-900 .text-gray-400, .bg-slate-900 .text-gray-500, .bg-slate-900 .text-slate-400,
        [class*="from-blue-"] .text-gray-300, [class*="from-blue-"] .text-gray-400, [class*="from-blue-"] .text-gray-500, [class*="from-blue-"] .text-slate-400,
        [class*="to-blue-"] .text-gray-300, [class*="to-blue-"] .text-gray-400, [class*="to-blue-"] .text-gray-500, [class*="to-blue-"] .text-slate-400 { color: var(--theme-secondary-light) !important; }

        .bg-emerald-50, .bg-emerald-100, .bg-emerald-200,
        .bg-teal-50, .bg-teal-100, .bg-indigo-50, .bg-indigo-100, .bg-purple-50, .bg-purple-100, .bg-pink-50, .bg-pink-100,
        .bg-blue-50, .bg-blue-100, .bg-gray-50, .bg-gray-100, .bg-slate-50, .bg-slate-100 { background-color: var(--theme-surface) !important; }
        .bg-emerald-500, .bg-emerald-600, .bg-emerald-700,
        .bg-blue-600, .bg-blue-900,
        .bg-slate-900 { background-color: var(--theme-secondary) !important; }
        .bg-amber-50, .bg-amber-100, .bg-yellow-50 { background-color: var(--theme-accent-light) !important; }

        .border-emerald-50, .border-emerald-100, .border-emerald-200, .border-emerald-300, .border-emerald-400,
        .border-gray-50, .border-gray-100, .border-gray-200, .border-slate-100, .border-slate-200 { border-color: var(--theme-primary-light) !important; }
        .border-emerald-500, .border-emerald-600,
        .border-teal-500, .border-indigo-500, .border-purple-500, .border-pink-500 { border-color: var(--theme-primary) !important; }
        .border-blue-200, .border-blue-300 { border-color: var(--theme-secondary-light) !important; }
        .border-blue-500, .border-blue-900 { border-color: var(--theme-secondary) !important; }
        .border-amber-200, .border-amber-300, .border-amber-500, .border-yellow-200 { border-color: var(--theme-accent) !important; }

        .from-emerald-600, .hover\\:from-emerald-700:hover { --tw-gradient-from: var(--theme-primary) var(--tw-gradient-from-position) !important; }
        .from-pink-100, .from-blue-50, .from-blue-100, .from-amber-50 { --tw-gradient-from: var(--theme-surface) var(--tw-gradient-from-position) !important; }
        .to-emerald-50, .to-emerald-600, .to-emerald-700, .hover\\:to-emerald-800:hover, .to-cyan-100, .to-orange-100 { --tw-gradient-to: var(--theme-primary-light) var(--tw-gradient-to-position) !important; }
        .from-blue-600, .from-blue-900, .hover\\:from-blue-700:hover { --tw-gradient-from: var(--theme-secondary) var(--tw-gradient-from-position) !important; }
        .to-blue-100, .to-blue-700, .hover\\:to-blue-800:hover { --tw-gradient-to: var(--theme-secondary-light) var(--tw-gradient-to-position) !important; }

        .hover\\:bg-emerald-500:hover, .hover\\:bg-emerald-600:hover, .hover\\:bg-emerald-700:hover,
        .hover\\:bg-teal-600:hover, .hover\\:bg-indigo-600:hover, .hover\\:bg-purple-600:hover, .hover\\:bg-pink-600:hover { background-color: var(--theme-primary-dark) !important; }
        .hover\\:bg-blue-700:hover, .hover\\:bg-blue-800:hover, .hover\\:bg-blue-900:hover { background-color: var(--theme-secondary-dark) !important; }
        .hover\\:bg-amber-600:hover { background-color: var(--theme-accent-dark) !important; }

        .hover\\:text-emerald-200:hover, .hover\\:text-emerald-400:hover, .hover\\:text-emerald-600:hover, .hover\\:text-emerald-700:hover,
        .hover\\:text-blue-900:hover { color: var(--theme-secondary-light) !important; }
        .ring-emerald-200, .ring-emerald-500 { --tw-ring-color: var(--theme-primary) !important; }
    `;
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
    const activeTheme = resolveActiveTheme(config);
    const mergedDesignTokens = deepMerge(config.designTokens || {}, {
        colors: {
            primary: activeTheme.tokens.primary,
            secondary: activeTheme.tokens.secondary,
            accent: activeTheme.tokens.accent,
            background: activeTheme.tokens.background,
            surface: activeTheme.tokens.surface,
            text: activeTheme.tokens.text
        }
    });

    window.schoolConfig = {
        ...config,
        designTokens: mergedDesignTokens,
        theme: {
            ...(config.theme || {}),
            activeTheme: activeTheme.name,
            description: activeTheme.description,
            themes: activeTheme.normalizedThemes || (config.theme && config.theme.themes) || [],
            resolvedTheme: activeTheme
        },
        contact: {
            ...config.contact,
            phone1: config.contact.primaryPhone
        }
    };

    applyActiveTheme(activeTheme);
    return window.schoolConfig;
});

document.addEventListener("DOMContentLoaded", async () => {
    const schoolData = await window.schoolConfigReady;
    const featureToggles = schoolData.featureToggles || {};
    const hasExplicitScheme = (value) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);

    const bindGlobalMobileMenu = () => {
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');

        if (!menuBtn || !mobileMenu || menuBtn.dataset.mobileMenuBound === 'true') {
            return;
        }

        menuBtn.dataset.mobileMenuBound = 'true';

        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            if (menuIcon) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        };

        const toggleMenu = (event) => {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
                if (typeof event.stopImmediatePropagation === 'function') {
                    event.stopImmediatePropagation();
                }
            }

            const shouldOpen = !mobileMenu.classList.contains('active');
            if (shouldOpen) {
                mobileMenu.classList.add('active');
                if (menuIcon) {
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-times');
                }
            } else {
                closeMenu();
            }
        };

        // Capture-phase binding ensures one consistent handler even if page scripts also attach listeners.
        menuBtn.addEventListener('click', toggleMenu, true);

        document.addEventListener('click', (event) => {
            if (!mobileMenu.classList.contains('active')) {
                return;
            }

            if (!mobileMenu.contains(event.target) && !menuBtn.contains(event.target)) {
                closeMenu();
            }
        }, true);

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                closeMenu();
            }
        });
    };

    bindGlobalMobileMenu();

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

    // Tawk maintenance notes live in docs/tawk-chat-maintenance.md.
    // Review that file before changing CSP requirements, widget IDs, or fallback behavior.
    if (schoolData.featureToggles.showChatWidget) {
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();
        const tawkDirectChatUrl = "https://tawk.to/chat/5e9d854435bcbb0c9ab2de75/1ji2d8ea8";

        const openTawkDirectChat = () => {
            // Avoid dead/blocked popup windows: same-tab navigation is the most reliable fallback.
            window.location.assign(tawkDirectChatUrl);
        };

        const getFallbackChatButton = () => document.getElementById("global-chat-fallback-button");

        const ensureFallbackChatButton = () => {
            let button = getFallbackChatButton();
            if (button) {
                return button;
            }

            button = document.createElement("button");
            button.id = "global-chat-fallback-button";
            button.type = "button";
            button.textContent = "Chat with us";
            button.setAttribute("aria-label", "Open chat support");
            button.style.position = "fixed";
            button.style.right = "20px";
            button.style.bottom = "20px";
            button.style.padding = "12px 16px";
            button.style.border = "0";
            button.style.borderRadius = "9999px";
            button.style.background = "#047857";
            button.style.color = "#ffffff";
            button.style.fontSize = "14px";
            button.style.fontWeight = "700";
            button.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.25)";
            button.style.zIndex = "2147483001";
            button.style.cursor = "pointer";
            button.style.display = "none";
            button.addEventListener("click", () => {
                ensureChatWidgetVisible();

                // Prefer embedded widget. If API is unavailable, use direct hosted chat.
                if (window.Tawk_API && typeof window.Tawk_API.popup === "function") {
                    window.Tawk_API.popup();
                    return;
                }

                if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
                    window.Tawk_API.maximize();
                    return;
                }

                if (window.Tawk_API && typeof window.Tawk_API.toggle === "function") {
                    window.Tawk_API.toggle();
                    return;
                }

                openTawkDirectChat();
            });

            document.body.appendChild(button);
            return button;
        };

        const isTawkLauncherVisible = () => {
            const nodes = document.querySelectorAll("iframe[src*='tawk.to'], iframe[id*='tawk'], div[id*='tawk']");
            for (const node of nodes) {
                if (!(node instanceof HTMLElement)) {
                    continue;
                }
                const style = window.getComputedStyle(node);
                const rect = node.getBoundingClientRect();
                const hasArea = rect.width > 0 && rect.height > 0;
                const visible = style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
                if (hasArea && visible) {
                    return true;
                }
            }
            return false;
        };

        const syncFallbackChatButton = () => {
            const button = ensureFallbackChatButton();
            button.style.display = isTawkLauncherVisible() ? "none" : "block";
        };

        const applyTawkPlacementStyles = (node) => {
            if (!(node instanceof HTMLElement)) {
                return;
            }

            const rect = node.getBoundingClientRect();
            const isMobileViewport = window.innerWidth < 768;
            const bottomOffset = isMobileViewport ? "16px" : "24px";
            const sideOffset = isMobileViewport ? "16px" : "24px";
            const isExpandedPanel = rect.width >= 140 || rect.height >= 140;

            node.style.zIndex = isExpandedPanel ? "1200" : "1100";
            node.style.bottom = bottomOffset;
            node.style.right = sideOffset;
            node.style.left = "auto";

            if (isExpandedPanel) {
                node.style.maxHeight = isMobileViewport ? "calc(100vh - 32px)" : "calc(100vh - 48px)";
                node.style.maxWidth = isMobileViewport ? "calc(100vw - 32px)" : "min(380px, calc(100vw - 48px))";
                node.style.borderRadius = "16px";
            }
        };

        const ensureChatWidgetVisible = () => {
            if (!window.Tawk_API) {
                return;
            }

            if (typeof window.Tawk_API.showWidget === "function") {
                window.Tawk_API.showWidget();
            }

            // Some browsers/extensions can leave the launcher iframe hidden after load.
            // If Tawk has rendered into DOM, force it to be visible without opening chat.
            const tawkCandidates = document.querySelectorAll("iframe[src*='tawk.to'], iframe[id*='tawk'], div[id*='tawk']");
            tawkCandidates.forEach((node) => {
                if (!(node instanceof HTMLElement)) {
                    return;
                }
                node.style.display = "";
                node.style.visibility = "visible";
                node.style.opacity = "1";
                node.style.pointerEvents = "auto";
                applyTawkPlacementStyles(node);
            });

            syncFallbackChatButton();
        };

        const syncChatWidgetForConnectivity = () => {
            if (navigator.onLine || !window.Tawk_API) {
                return;
            }

            if (typeof window.Tawk_API.showWidget === "function") {
                window.Tawk_API.showWidget();
            }

            if (typeof window.Tawk_API.minimize === "function") {
                window.Tawk_API.minimize();
            }
        };

        const previousOnLoad = window.Tawk_API.onLoad;
        window.Tawk_API.onLoad = function () {
            if (typeof previousOnLoad === "function") {
                previousOnLoad();
            }
            ensureChatWidgetVisible();
            syncChatWidgetForConnectivity();

            // Retry a few times because Tawk DOM nodes can be created slightly after onLoad.
            [300, 1000, 2500].forEach((delayMs) => {
                window.setTimeout(ensureChatWidgetVisible, delayMs);
            });
            [300, 1000, 2500, 5000].forEach((delayMs) => {
                window.setTimeout(syncFallbackChatButton, delayMs);
            });
        };

        window.addEventListener("offline", syncChatWidgetForConnectivity);
        window.addEventListener("online", ensureChatWidgetVisible);
        window.addEventListener("resize", syncFallbackChatButton);

        // Show fallback quickly in case launcher never paints.
        window.setTimeout(syncFallbackChatButton, 1500);
        window.setTimeout(syncFallbackChatButton, 5000);

        (function () {
            var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = "https://embed.tawk.to/5e9d854435bcbb0c9ab2de75/1ji2d8ea8";
            s1.charset = "UTF-8";
            s1.setAttribute("crossorigin", "*");
            s0.parentNode.insertBefore(s1, s0);
        })();
    }
});