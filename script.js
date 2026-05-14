const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const rotateHost = document.querySelector("[data-rotate-host]");
const rotateItems = Array.from(document.querySelectorAll("[data-rotate-item]"));
const revealNodes = document.querySelectorAll(".reveal");
const yearNode = document.getElementById("year");
const contactForm = document.getElementById("contact-form");

const config = window.AGENTIUS_CONFIG || {};
const notifyEmail = config.notifyEmail || "fmfg@agentius.ai";
const projectRef = config.projectRef || "awhpvrlzovcexopsejkt";
const functionName = config.functionName || "lead-capture";
const fallbackToMailto = config.fallbackToMailto !== false;
const functionUrl =
    config.functionUrl ||
    `https://${projectRef}.supabase.co/functions/v1/${functionName}`;

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            siteNav.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

if (rotateHost && rotateItems.length > 0) {
    let activeIndex = 0;
    rotateItems[0].classList.add("is-active");

    window.setInterval(() => {
        rotateItems[activeIndex].classList.remove("is-active");
        activeIndex = (activeIndex + 1) % rotateItems.length;
        rotateItems[activeIndex].classList.add("is-active");
    }, 2400);
}

if (revealNodes.length > 0) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.14 }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
}

if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
}

function buildMailtoUrl({ name, company, workflow, email }) {
    const subject = `Agentius intro request - ${company || name || "New inquiry"}`;
    const body = [
        "New Agentius intro request",
        "",
        `Name: ${name}`,
        `Company: ${company}`,
        `Email: ${email}`,
        "",
        "Workflow",
        workflow
    ].join("\n");

    return `mailto:${notifyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function showFormMessage(message, isError = false) {
    if (!contactForm) {
        return;
    }

    const existing = contactForm.parentElement.querySelector(".form-success");
    if (existing) {
        existing.remove();
    }

    const status = document.createElement("div");
    status.className = "form-success";
    status.textContent = message;

    if (isError) {
        status.style.background = "rgba(166, 61, 64, 0.14)";
        status.style.borderColor = "rgba(166, 61, 64, 0.35)";
        status.style.color = "#ffd9cc";
    }

    contactForm.after(status);
}

async function submitLead(payload) {
    const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    let data = null;
    try {
        data = await response.json();
    } catch (_error) {
        data = null;
    }

    if (!response.ok) {
        const message =
            (data && data.error) ||
            `Lead submission failed with status ${response.status}.`;
        throw new Error(message);
    }

    return data;
}

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const payload = {
            name: String(formData.get("name") || "").trim(),
            company: String(formData.get("company") || "").trim(),
            workflow: String(formData.get("workflow") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            source: "agentius-landing"
        };

        try {
            showFormMessage("Submitting your request...");
            await submitLead(payload);
            contactForm.reset();
            showFormMessage(
                "Request received. It has been queued for review and delivery."
            );
        } catch (error) {
            if (fallbackToMailto) {
                showFormMessage(
                    "Direct delivery is not active yet. Opening an email draft as fallback.",
                    true
                );
                window.location.href = buildMailtoUrl(payload);
                return;
            }

            showFormMessage(
                error instanceof Error ? error.message : "Submission failed.",
                true
            );
        }
    });
}
