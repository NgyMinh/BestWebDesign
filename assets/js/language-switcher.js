window.languageSwitcher = {
    currentLang: "vi",

    updateContent: function (lang) {
        if (!lang) {
            lang = this.currentLang;
        }
        this.currentLang = lang;

        document.documentElement.lang = lang;
        localStorage.setItem("language", lang);

        const elementsToTranslate = document.querySelectorAll("[data-lang-key]");
        elementsToTranslate.forEach((element) => {
            const key = element.getAttribute("data-lang-key");
            if (translations[key] && translations[key][lang]) {
                const translation = translations[key][lang];
                if (element.placeholder !== undefined && element.hasAttribute("placeholder")) {
                    element.placeholder = translation;
                } else {
                    element.innerHTML = translation;
                }
            }
        });

        const langVIButton = document.getElementById("lang-vi");
        const langENButton = document.getElementById("lang-en");
        if (langVIButton && langENButton) {
            if (lang === "vi") {
                langVIButton.classList.add("active");
                langENButton.classList.remove("active");
            } else {
                langENButton.classList.add("active");
                langVIButton.classList.remove("active");
            }
        }
        document.dispatchEvent(new Event("languageChanged"));
    },

    init: function () {
        const savedLanguage = localStorage.getItem("language") || "vi";
        const langVIButton = document.getElementById("lang-vi");
        const langENButton = document.getElementById("lang-en");

        if (langVIButton && langENButton) {
            langVIButton.addEventListener("click", () => this.updateContent("vi"));
            langENButton.addEventListener("click", () => this.updateContent("en"));
        }

        this.updateContent(savedLanguage);
    },
};

document.addEventListener("DOMContentLoaded", () => {
    window.languageSwitcher.init();
});