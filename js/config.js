// ==========================================
// GLOBAL SCHOOL METADATA
// Single Source of Truth for the Website
// ==========================================

const schoolData = {
    // 1. Basic Information
    identity: {
        fullName: "LEADS Higher Secondary School",
        shortName: "LEADS",
        tagline: "Empowering Minds, Shaping Futures",
        establishedYear: 2010,
        logoPath: "/images/school-logo.jpg" // Adjust path based on where this is used
    },

    // 2. Contact Information
    contact: {
        primaryPhone: "+91 94854 34534",
        secondaryPhone: "+91 94854 34534", // Update if you have a second number
        website: "https://www.leadsshillong.com", // NEW: Official Website URL
        emailGeneral: "support@leadsschool.com",
        emailAdmissions: "support@leadsschool.com",
        workingDays: "Monday - Friday",    // NEW: Global Working Days
        workingHours: "9:00 AM - 3:00 PM"  // NEW: Global Working Hours
    },

    // 3. Location & Address
    location: {
        street: "Langkerding, Nongmensong",
        city: "Shillong",
        state: "Meghalaya",
        pinCode: "793019",
        // The clickable Share link for new tabs (<a> tags)
        googleMapsLink: "https://maps.app.goo.gl/Df9prKuJYtpbhnHg6",
        // The Embed link for showing the map directly on the page (<iframe> tags)
        googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.419033678317!2d91.9067664!3d25.590988499999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37507fd0a24eb3dd%3A0x9d32cb52d67507b9!2sLeads%20Higher%20Secondary%20School!5e0!3m2!1sen!2sin!4v1770129373388!5m2!1sen!2sin" // Replace with your actual iframe SRC link
    },

    // 4. Social Media Links
    socials: {
        facebook: "https://facebook.com/leadsshillong",
        instagram: "https://instagram.com/leadsschool",
        youtube: "https://youtube.com/leadsschool",
        twitter: "https://twitter.com/leadsschool"
    },

    // 5. Academics & Admissions
    academics: {
        currentSession: "2026-2027",
        admissionStatus: "Open", // Can be "Open" or "Closed"
        admissionFormLink: "admissions.html" 
    },

    // 6. Payment Portal Links
    payments: {
        regularFee: "https://rzp.io/l/Ze17MQO3sa",      // Standard Monthly/Term Fees
        admissionFee: "https://rzp.io/l/admission_link", // New Admission Fees
        eventsFee: "https://rzp.io/l/events_link",       // Excursions, Annual Day, etc.
        uniformsBooks: "https://rzp.io/l/uniforms_link"  // Optional: Book & Uniform purchases
    }
};

// ==========================================
// AUTOMATIC DATA INJECTION FUNCTION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
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
});