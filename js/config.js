const fallbackSchoolData = {
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
    payments: {
        regularFee: "https://rzp.io/l/Ze17MQO3sa",
        admissionFee: "https://rzp.io/l/admission_link",
        eventsFee: "https://rzp.io/l/events_link",
        uniformsBooks: "https://rzp.io/l/uniforms_link"
    }
};

async function loadSchoolData() {
    try {
        const response = await fetch('/admin/config.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to load admin/config.json: ${response.status}`);
        }

        const data = await response.json();
        return {
            ...fallbackSchoolData,
            ...data,
            identity: { ...fallbackSchoolData.identity, ...(data.identity || {}) },
            contact: { ...fallbackSchoolData.contact, ...(data.contact || {}) },
            location: { ...fallbackSchoolData.location, ...(data.location || {}) },
            socials: { ...fallbackSchoolData.socials, ...(data.socials || {}) },
            academics: { ...fallbackSchoolData.academics, ...(data.academics || {}) },
            payments: { ...fallbackSchoolData.payments, ...(data.payments || {}) }
        };
    } catch (error) {
        console.warn('Using fallback school metadata:', error);
        return fallbackSchoolData;
    }
}

// ==========================================
// AUTOMATIC DATA INJECTION FUNCTION
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    const schoolData = await loadSchoolData();
    window.schoolConfig = {
        ...schoolData,
        contact: {
            ...schoolData.contact,
            phone1: schoolData.contact.primaryPhone
        }
    };
    
    // --- Text Injections ---
    const injectText = (ids, text) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        idArray.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.innerText = text;
        });
    };

    // Identity
    injectText(["global-school-name", "global-school-name-footer"], schoolData.identity.fullName);
    injectText(["global-school-shortname", "global-school-shortname-footer"], schoolData.identity.shortName);
    injectText("global-tagline", schoolData.identity.tagline);
    
    // Contact & Office Time
    injectText(["global-phone-1", "global-phone-1-footer", "contact-card-phone"], schoolData.contact.primaryPhone);
    injectText("global-phone-2", schoolData.contact.secondaryPhone);
    injectText(["global-email-general", "global-email-general-footer"], schoolData.contact.emailGeneral);
    injectText("global-email-admissions", schoolData.contact.emailAdmissions);
    injectText("global-working-days", schoolData.contact.workingDays);
    injectText("global-working-hours", schoolData.contact.workingHours);
    
    // Website (Strips 'https://' for cleaner text display)
    const displayWebsite = schoolData.contact.website.replace(/^https?:\/\//, '');
    injectText("global-website-text", displayWebsite); 
    
    // Location
    injectText(["global-address-street", "global-address-street-footer", "contact-card-street"], schoolData.location.street);
    injectText(["global-address-city", "contact-card-city"], `${schoolData.location.city} ${schoolData.location.state} - ${schoolData.location.pinCode}`);
    
    // Academics
    injectText("global-session", schoolData.academics.currentSession);

    // Dynamic Copyright Year
    const currentYear = new Date().getFullYear();
    injectText("global-copyright", `© ${currentYear} ${schoolData.identity.fullName}. All Rights Reserved.`);


    // --- Link/URL Injections ---
    const injectLink = (ids, url) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        idArray.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.href = url;
        });
    };

    // Website & Social Links
    injectLink("global-link-website", schoolData.contact.website);
    injectLink("global-link-fb", schoolData.socials.facebook);
    injectLink("global-link-ig", schoolData.socials.instagram);
    injectLink("global-link-yt", schoolData.socials.youtube);
    injectLink("global-link-maps", schoolData.location.googleMapsLink);
    
    // Actionable Contact Links (tel: and mailto:)
    injectLink(["global-link-phone-1", "global-link-phone-footer", "contact-card-phone-link"], `tel:${schoolData.contact.primaryPhone.replace(/\s+/g, '')}`);
    injectLink(["global-link-email-general", "global-link-email-footer"], `mailto:${schoolData.contact.emailGeneral}`);

    // Admission Links
    injectLink(["global-link-admissions", "global-link-admissions-nav", "global-link-admissions-footer", "global-link-admissions-hero"], schoolData.academics.admissionFormLink);

    // Payment Links
    injectLink("global-payment-regular", schoolData.payments.regularFee);
    injectLink("global-payment-admission", schoolData.payments.admissionFee);
    injectLink("global-payment-events", schoolData.payments.eventsFee);
    injectLink("global-payment-uniforms", schoolData.payments.uniformsBooks);


    // --- Source/Embed Injections (For <iframe>, <img> tags) ---
    const injectSrc = (ids, url) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        idArray.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.src = url;
        });
    };

    // Inject the Map Embed URL into the iframe
    injectSrc("global-map-iframe", schoolData.location.googleMapsEmbed);

    // ==========================================
    // TAWK.TO CHAT WIDGET INITIALIZATION
    // ==========================================
    // Initialize Tawk.to for live chat support
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/5e9d854435bcbb0c9ab2de75/default';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
    })();
});