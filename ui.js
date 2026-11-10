// ==========================================
// MONETRA UI LAYER
// Navigation, theme, language, dialogs.
// Works on top of app.js without modifying it.
// ==========================================

(() => {
    "use strict";

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const setText = (el, text) => {
        if (el && el.textContent !== text) el.textContent = text;
    };

    const store = {
        get(key) { try { return localStorage.getItem(key); } catch { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch {} }
    };

    // ------------------------------------------
    // Translations
    // ------------------------------------------

    const I18N = {
        en: {
            navOverview: "Overview", navAccount: "Account",
            language: "Language", themeToggle: "Switch theme", close: "Close",
            signIn: "Sign in", createAccount: "Create account",
            signInTitle: "Welcome back", signInSub: "Sign in to continue to Monetra.",
            registerTitle: "Create your account", registerSub: "Start tracking your expenses in a few seconds.",
            loginLabel: "Username or email", password: "Password", passwordHint: "At least 12 characters",
            username: "Username", email: "Email",
            overviewTitle: "Overview", addCategory: "Add category", addExpense: "Add expense",
            summary: "Summary", period: "Period",
            periodDay: "Today", periodWeek: "This week", periodMonth: "This month",
            periodYear: "This year", periodCustom: "Custom period",
            from: "From", to: "To", apply: "Apply",
            totalExpenses: "Total expenses", transactions: "Transactions", averageExpense: "Average expense",
            byCategory: "By category", categories: "Categories", history: "Expenses history",
            filter: "Filter", clear: "Clear", previous: "Previous", next: "Next", page: "Page",
            amountUah: "Amount, UAH", category: "Category", description: "Description", date: "Date",
            name: "Name", cancel: "Cancel", createCategory: "Create category",
            color: "Color", edit: "Edit", editCategory: "Edit category", saveCategory: "Save changes",
            editCatNamePrompt: "Enter new category name:", editCatColorPrompt: "Enter new HEX color (e.g. #3498DB):",
            descPlaceholder: "e.g. Groceries", catPlaceholder: "e.g. Subscriptions",
            accountTitle: "Account", profile: "Profile", preferences: "Preferences",
            theme: "Theme", themeLight: "Light", themeDark: "Dark",
            session: "Session", sessionText: "You will need to sign in again to access your data.",
            signOut: "Sign out", signedInAs: "Signed in as {name}", notLoggedIn: "Not logged in",
            memberSince: "Member since",
            delete: "Delete", noDescription: "No description",
            noExpenses: "No expenses found.", noStats: "No expenses for this period.",
            other: "Other",
            mCreated: "Account created successfully!", mLogin: "Login successful!", mLogout: "Logged out",
            mCatCreated: "Category created!", mCatUpdated: "Category updated!", mCatDeleted: "Category deleted",
            mExpAdded: "Expense added!", mExpDeleted: "Expense deleted",
            mInvalidAmount: "Invalid amount", mInvalidRange: "Select a valid date range",
            mInvalidApi: "Invalid API response", mFailed: "Request failed",
            cCategory: "Delete this category? Its expenses will move to Other.",
            cExpense: "Delete this expense?"
        },
        uk: {
            navOverview: "Огляд", navAccount: "Акаунт",
            language: "Мова", themeToggle: "Змінити тему", close: "Закрити",
            signIn: "Увійти", createAccount: "Створити акаунт",
            signInTitle: "З поверненням", signInSub: "Увійдіть, щоб продовжити роботу з Monetra.",
            registerTitle: "Створіть акаунт", registerSub: "Почніть вести облік витрат за кілька секунд.",
            loginLabel: "Ім’я користувача або email", password: "Пароль", passwordHint: "Щонайменше 12 символів",
            username: "Ім’я користувача", email: "Електронна пошта",
            overviewTitle: "Огляд", addCategory: "Додати категорію", addExpense: "Додати витрату",
            summary: "Підсумок", period: "Період",
            periodDay: "Сьогодні", periodWeek: "Цього тижня", periodMonth: "Цього місяця",
            periodYear: "Цього року", periodCustom: "Довільний період",
            from: "Від", to: "До", apply: "Застосувати",
            totalExpenses: "Загальні витрати", transactions: "Транзакції", averageExpense: "Середня витрата",
            byCategory: "За категоріями", categories: "Категорії", history: "Історія витрат",
            filter: "Фільтрувати", clear: "Скинути", previous: "Назад", next: "Далі", page: "Сторінка",
            amountUah: "Сума, UAH", category: "Категорія", description: "Опис", date: "Дата",
            name: "Назва", cancel: "Скасувати", createCategory: "Створити категорію",
            color: "Колір", edit: "Редагувати", editCategory: "Редагувати категорію", saveCategory: "Зберегти зміни",
            editCatNamePrompt: "Введіть нову назву категорії:", editCatColorPrompt: "Введіть новий HEX колір (наприклад, #3498DB):",
            descPlaceholder: "Напр., продукти", catPlaceholder: "Напр., підписки",
            accountTitle: "Акаунт", profile: "Профіль", preferences: "Налаштування",
            theme: "Тема", themeLight: "Світла", themeDark: "Темна",
            session: "Сесія", sessionText: "Після виходу потрібно буде увійти знову, щоб отримати доступ до своїх даних.",
            signOut: "Вийти", signedInAs: "Ви увійшли як {name}", notLoggedIn: "Ви не авторизовані",
            memberSince: "З нами з",
            delete: "Видалити", noDescription: "Без опису",
            noExpenses: "Витрат не знайдено.", noStats: "Немає витрат за цей період.",
            other: "Інше",
            mCreated: "Акаунт успішно створено!", mLogin: "Вхід виконано", mLogout: "Ви вийшли з акаунту",
            mCatCreated: "Категорію створено", mCatUpdated: "Категорію оновлено", mCatDeleted: "Категорію видалено",
            mExpAdded: "Витрату додано", mExpDeleted: "Витрату видалено",
            mInvalidAmount: "Некоректна сума", mInvalidRange: "Оберіть коректний діапазон дат",
            mInvalidApi: "Некоректна відповідь сервера", mFailed: "Помилка запиту",
            cCategory: "Видалити цю категорію? Її витрати буде переміщено до «Інше».",
            cExpense: "Видалити цю витрату?"
        }
    };

    // English & Ukrainian strings produced by app.js -> translation keys
    const MESSAGES = {
        "Account created successfully!": "mCreated",
        "Реєстрація успішна!": "mCreated",
        "Login successful!": "mLogin",
        "Вхід виконано успішно!": "mLogin",
        "Logged out": "mLogout",
        "Ви вийшли з системи.": "mLogout",
        "Category created!": "mCatCreated",
        "Категорію успішно створено!": "mCatCreated",
        "Category updated!": "mCatUpdated",
        "Категорію оновлено!": "mCatUpdated",
        "Category deleted": "mCatDeleted",
        "Категорію видалено.": "mCatDeleted",
        "Expense added!": "mExpAdded",
        "Витрату додано!": "mExpAdded",
        "Expense deleted": "mExpDeleted",
        "Витрату видалено.": "mExpDeleted",
        "Invalid amount": "mInvalidAmount",
        "Некоректна сума": "mInvalidAmount",
        "Select a valid date range": "mInvalidRange",
        "Оберіть коректний діапазон дат": "mInvalidRange",
        "Invalid API response": "mInvalidApi",
        "Request failed": "mFailed"
    };

    const CONFIRMS = {
        "Delete this category? Its expenses will move to Other.": "cCategory",
        "Ви впевнені? Всі витрати з цієї категорії будуть перенесені в 'Other'.": "cCategory",
        "Delete this expense?": "cExpense"
    };

    let lang = document.documentElement.lang === "en" ? "en" : "uk";
    let theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";

    const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    const locale = () => (lang === "uk" ? "uk-UA" : "en-US");

    // ------------------------------------------
    // Icons
    // ------------------------------------------

    const SVG_NS = "http://www.w3.org/2000/svg";

    function icon(name) {
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("class", "icon");
        svg.setAttribute("aria-hidden", "true");

        const use = document.createElementNS(SVG_NS, "use");
        use.setAttribute("href", "#i-" + name);

        svg.appendChild(use);
        return svg;
    }

    function makeIconButton(button, iconName, labelKey) {
        button.type = "button";
        button.className = "icon-btn danger";
        button.replaceChildren(icon(iconName));
        button.setAttribute("data-i18n-aria", labelKey);
    }

    // ------------------------------------------
    // Static translation
    // ------------------------------------------

    function applyStatic(root = document) {
        $$("[data-i18n]", root).forEach((el) => setText(el, t(el.dataset.i18n)));

        $$("[data-i18n-placeholder]", root).forEach((el) => {
            el.placeholder = t(el.dataset.i18nPlaceholder);
        });

        $$("[data-i18n-aria]", root).forEach((el) => {
            const label = t(el.dataset.i18nAria);
            el.setAttribute("aria-label", label);
            el.title = label;
        });
    }

    function flagOther(el) {
        if (el && el.textContent === "Other") el.dataset.i18n = "other";
    }

    // ------------------------------------------
    // Dynamic formatting (money, dates, pages)
    // ------------------------------------------

    const MONEY_RE = /^[\d\s\u00a0\u202f.,]+ UAH$/;

    function fmtMoney(value) {
        return new Intl.NumberFormat(locale(), {
            style: "currency",
            currency: "UAH"
        }).format(value);
    }

    function localizeMoney(el) {
        if (!el) return;

        const text = el.textContent.trim();

        if (MONEY_RE.test(text)) {
            const value = parseInt(text.replace(/\D/g, ""), 10) / 100;
            if (Number.isFinite(value)) el.dataset.amt = String(value);
        }

        if (el.dataset.amt === undefined) return;

        setText(el, fmtMoney(Number(el.dataset.amt)));
    }

    function localizeDate(el) {
        if (!el) return;

        if (!el.dataset.date) {
            const match = /^\d{4}-\d{2}-\d{2}/.exec(el.textContent.trim());
            if (!match) return;
            el.dataset.date = match[0];
        }

        const [y, m, d] = el.dataset.date.split("-").map(Number);

        setText(
            el,
            new Intl.DateTimeFormat(locale(), {
                day: "numeric",
                month: "short",
                year: "numeric"
            }).format(new Date(y, m - 1, d))
        );
    }

    function localizePageInfo() {
        const el = $("#page-info");
        const match = /^Page (\d+) \/ (\d+)$/.exec(el.textContent.trim());

        if (match) {
            el.dataset.p = match[1];
            el.dataset.n = match[2];
        }

        if (el.dataset.p) {
            setText(el, `${t("page")} ${el.dataset.p} / ${el.dataset.n}`);
        }
    }

    function localizeUser() {
        const el = $("#user-info");
        const text = el.textContent.trim();
        const match = /^Logged in as: (.+)$/.exec(text);

        if (match) el.dataset.name = match[1];
        else if (text === "Not logged in") delete el.dataset.name;

        const name = el.dataset.name;

        setText(el, name ? t("signedInAs").replace("{name}", name) : t("notLoggedIn"));
        setText($("#account-name"), name || "—");
        setText($("#account-username"), name || "—");
        setText($("#account-avatar"), name ? name.charAt(0) : "?");
    }

    // ------------------------------------------
    // Enhance lists rendered by app.js
    // ------------------------------------------

    function enhanceExpenses() {
        $$("#expenses-list .expense-item:not([data-done])").forEach((item) => {
            item.dataset.done = "1";

            const details = $(".expense-details", item);
            if (details) {
                const [category, description, date] = details.children;

                if (category) flagOther(category);

                if (description && (description.textContent === "No description" || description.textContent === "Без опису")) {
                    description.dataset.i18n = "noDescription";
                    description.classList.add("muted");
                }

                if (date) localizeDate(date);
            } else {
                const category = $(".expense-category-badge", item);
                if (category) flagOther(category);

                const desc = $(".expense-desc", item);
                if (desc && (desc.textContent === "No description" || desc.textContent === "Без опису")) {
                    desc.dataset.i18n = "noDescription";
                    desc.classList.add("muted");
                }

                const date = $(".expense-date", item);
                if (date) localizeDate(date);
            }

            localizeMoney($(".expense-amount", item));

            const delBtn = $(".btn-delete-expense", item) || $("button", item);
            if (delBtn) makeIconButton(delBtn, "trash", "delete");
        });

        $$("#expenses-list > p:not([data-done])").forEach((p) => {
            p.dataset.done = "1";
            p.className = "empty";
            p.dataset.i18n = "noExpenses";
        });

        applyStatic($("#expenses-list"));
    }

    function enhanceCategories() {
        $$("#categories-list .category-item:not([data-done])").forEach((item) => {
            item.dataset.done = "1";

            const nameSpan = $(".category-name", item) || $("span:not(.category-color-badge)", item);
            if (nameSpan) flagOther(nameSpan);

            const editBtn = $(".btn-edit", item);
            if (editBtn) {
                editBtn.type = "button";
                editBtn.className = "icon-btn";
                editBtn.replaceChildren(icon("edit"));
                editBtn.setAttribute("data-i18n-aria", "edit");
            }

            const deleteBtn = $(".btn-delete", item) || $("button:not(.btn-edit)", item);
            if (deleteBtn) {
                makeIconButton(deleteBtn, "trash", "delete");
            }
        });

        applyStatic($("#categories-list"));
    }

    function enhanceStats() {
        $$("#category-stats .category-stat:not([data-done])").forEach((item) => {
            item.dataset.done = "1";

            const label = item.firstElementChild;
            const match = /^(.*): ([\d\s\u00a0\u202f.,]+) UAH \((.+)%\)$/s.exec(label.textContent);

            if (!match) return;

            const name = document.createElement("span");
            name.className = "stat-name";
            name.textContent = match[1];
            flagOther(name);

            const amount = document.createElement("span");
            amount.className = "stat-amount";
            amount.textContent = match[2] + " UAH";
            localizeMoney(amount);

            const percent = document.createElement("span");
            percent.className = "stat-pct";
            percent.textContent = match[3] + "%";

            const values = document.createElement("span");
            values.className = "stat-values";
            values.append(amount, percent);

            label.className = "stat-label";
            label.replaceChildren(name, values);

            const catName = match[1].trim();
            const cache = window.categoriesCache || [];
            const cat = cache.find((c) => c.name && c.name.toLowerCase() === catName.toLowerCase());
            if (cat && cat.color) {
                const dot = document.createElement("span");
                dot.className = "category-color-badge sm";
                dot.style.backgroundColor = cat.color;
                name.prepend(dot);

                const bar = $(".progress-bar", item);
                if (bar) bar.style.backgroundColor = cat.color;
            }
        });

        $$("#category-stats > p:not([data-done])").forEach((p) => {
            p.dataset.done = "1";
            p.className = "empty";
            p.dataset.i18n = "noStats";
        });

        applyStatic($("#category-stats"));
    }

    function enhanceCategorySelect() {
        const select = $("#expense-category");

        $$("option", select).forEach(flagOther);
        applyStatic(select);
    }

    // ------------------------------------------
    // Toast
    // ------------------------------------------

    const toast = $("#message");

    function isPopoverOpen(el) {
        try { return el.matches(":popover-open"); } catch { return false; }
    }

    function syncMessage() {
        const key = MESSAGES[toast.textContent];
        if (key) setText(toast, t(key));

        const hasText = toast.textContent.trim() !== "";

        if (typeof toast.showPopover === "function") {
            try {
                if (hasText) {
                    // Re-open so the toast always sits above any open dialog
                    if (isPopoverOpen(toast)) toast.hidePopover();
                    toast.showPopover();
                } else if (isPopoverOpen(toast)) {
                    toast.hidePopover();
                }
            } catch {}
        }

        if (hasText && toast.classList.contains("success")) closeDialogs();
    }

    // ------------------------------------------
    // Dialogs
    // ------------------------------------------

    function closeDialogs() {
        $$("dialog[open]").forEach((dialog) => dialog.close());
    }

    // ------------------------------------------
    // Theme and language
    // ------------------------------------------

    function syncPressed() {
        $$("[data-set-lang]").forEach((btn) => {
            btn.setAttribute("aria-pressed", String(btn.dataset.setLang === lang));
        });

        $$("[data-set-theme]").forEach((btn) => {
            btn.setAttribute("aria-pressed", String(btn.dataset.setTheme === theme));
        });
    }

    function applyTheme(next) {
        theme = next === "dark" ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        store.set("monetra-theme", theme);
        syncPressed();
    }

    function applyLang(next) {
        lang = next === "en" ? "en" : "uk";
        document.documentElement.lang = lang;
        store.set("monetra-lang", lang);

        applyStatic();

        $$("[data-amt]").forEach(localizeMoney);
        $$("[data-date]").forEach(localizeDate);

        localizePageInfo();
        localizeUser();
        syncPressed();
    }

    // Native confirm() dialogs from app.js, translated
    const nativeConfirm = window.confirm.bind(window);

    window.confirm = (message) => {
        const key = CONFIRMS[message];
        return nativeConfirm(key ? t(key) : message);
    };

    // Native prompt() dialogs from app.js, translated
    const nativePrompt = window.prompt.bind(window);
    const PROMPTS = {
        "Введіть нову назву категорії:": "editCatNamePrompt",
        "Enter new category name:": "editCatNamePrompt",
        "Введіть новий HEX колір (наприклад, #3498DB):": "editCatColorPrompt",
        "Enter new HEX color (e.g. #3498DB):": "editCatColorPrompt"
    };

    window.prompt = (message, defaultValue) => {
        const key = PROMPTS[message];
        return nativePrompt(key ? t(key) : message, defaultValue);
    };

    // ------------------------------------------
    // Routing between pages
    // ------------------------------------------

    const PAGES = ["overview", "account"];

    function currentPage() {
        const page = location.hash.replace(/^#\/?/, "");
        return PAGES.includes(page) ? page : "overview";
    }

    function showPage(page) {
        PAGES.forEach((name) => {
            $("#page-" + name).hidden = name !== page;
        });

        $$("[data-page]").forEach((btn) => {
            if (btn.dataset.page === page) btn.setAttribute("aria-current", "page");
            else btn.removeAttribute("aria-current");
        });
    }

    window.addEventListener("hashchange", () => {
        if ($("#app-section").hidden) return;

        showPage(currentPage());
        window.scrollTo(0, 0);
    });

    // ------------------------------------------
    // Account page data
    // ------------------------------------------

    async function loadProfile() {
        try {
            const response = await fetch("/api/auth/me", { credentials: "include" });
            if (!response.ok) return;

            const data = await response.json();
            const user = data.user || {};

            setText($("#account-email"), user.email || "—");

            const created = user.created_at ? String(user.created_at).slice(0, 10) : "";

            if (/^\d{4}-\d{2}-\d{2}$/.test(created)) {
                const el = $("#account-since");
                el.dataset.date = created;
                localizeDate(el);
                $("#since-row").hidden = false;
            }
        } catch {}
    }

    // ------------------------------------------
    // Auth tabs
    // ------------------------------------------

    function setAuthTab(name) {
        $$("[data-auth-tab]").forEach((btn) => {
            btn.setAttribute("aria-selected", String(btn.dataset.authTab === name));
        });

        $("#login-panel").hidden = name !== "login";
        $("#register-panel").hidden = name !== "register";
    }

    // ------------------------------------------
    // App visibility (set by app.js)
    // ------------------------------------------

    function syncApp() {
        const visible = !$("#app-section").hidden;

        $("#main-nav").hidden = !visible;
        document.body.classList.toggle("has-nav", visible);

        if (visible) {
            showPage(currentPage());
            loadProfile();
        } else {
            closeDialogs();
            setAuthTab("login");
        }
    }

    // ------------------------------------------
    // Events
    // ------------------------------------------

    document.addEventListener("click", (event) => {
        const target = event.target;

        const langBtn = target.closest("[data-set-lang]");
        if (langBtn) return applyLang(langBtn.dataset.setLang);

        const themeBtn = target.closest("[data-set-theme]");
        if (themeBtn) return applyTheme(themeBtn.dataset.setTheme);

        if (target.closest("[data-theme-toggle]")) {
            return applyTheme(theme === "dark" ? "light" : "dark");
        }

        const pageBtn = target.closest("[data-page]");
        if (pageBtn) {
            const hash = "#/" + pageBtn.dataset.page;

            if (location.hash === hash) window.scrollTo(0, 0);
            else location.hash = hash;
            return;
        }

        const tab = target.closest("[data-auth-tab]");
        if (tab) return setAuthTab(tab.dataset.authTab);

        const opener = target.closest("[data-open]");
        if (opener) {
            document.getElementById(opener.dataset.open).showModal();
            return;
        }

        const closer = target.closest("[data-close]");
        if (closer) closer.closest("dialog").close();
    });

    // Click on the backdrop closes the dialog
    $$("dialog").forEach((dialog) => {
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) dialog.close();
        });
    });

    // ------------------------------------------
    // Observers (react to DOM updates from app.js)
    // ------------------------------------------

    const watch = (selector, callback, options = { childList: true }) => {
        const el = $(selector);
        new MutationObserver(callback).observe(el, options);
    };

    watch("#expenses-list", enhanceExpenses);
    watch("#categories-list", enhanceCategories);
    watch("#category-stats", enhanceStats);
    watch("#expense-category", enhanceCategorySelect);
    watch("#total-expenses", () => localizeMoney($("#total-expenses")));
    watch("#average-expense", () => localizeMoney($("#average-expense")));
    watch("#page-info", localizePageInfo);
    watch("#user-info", localizeUser);
    watch("#message", syncMessage, { childList: true, attributes: true, attributeFilter: ["class"] });
    watch("#app-section", syncApp, { attributes: true, attributeFilter: ["hidden"] });

    // ------------------------------------------
    // Color pickers and category dialogs
    // ------------------------------------------

    function initColorPickers(root = document) {
        $$(".color-swatches", root).forEach((container) => {
            const targetId = container.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;

            const valDisplay = input.parentElement ? $(".color-value", input.parentElement) : null;

            const sync = (hex) => {
                const upper = (hex || "").toUpperCase();
                if (valDisplay) setText(valDisplay, upper);
                $$(".color-swatch", container).forEach((swatch) => {
                    const match = (swatch.dataset.color || "").toUpperCase() === upper;
                    swatch.classList.toggle("active", match);
                });
            };

            input.addEventListener("input", () => sync(input.value));
            input.addEventListener("change", () => sync(input.value));

            container.addEventListener("click", (e) => {
                const swatch = e.target.closest(".color-swatch");
                if (!swatch) return;
                const color = swatch.dataset.color;
                if (!color) return;
                input.value = color;
                sync(color);
                input.dispatchEvent(new Event("change", { bubbles: true }));
            });

            sync(input.value);
        });
    }

    function setupEditCategoryDialog() {
        const dialog = $("#edit-category-dialog");
        const form = $("#edit-category-form");
        if (!dialog || !form) return;

        window.openEditCategoryModal = (cat) => {
            $("#edit-category-id").value = cat.id;
            $("#edit-category-name-input").value = cat.name;
            const color = cat.color || "#64748B";
            const colorInput = $("#edit-category-color-input");
            if (colorInput) {
                colorInput.value = color;
                colorInput.dispatchEvent(new Event("input", { bubbles: true }));
            }
            dialog.showModal();
        };

        if (!form.dataset.bound) {
            form.dataset.bound = "1";
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                const id = $("#edit-category-id").value;
                const nameInput = $("#edit-category-name-input");
                const colorInput = $("#edit-category-color-input");

                if (!nameInput) return;

                try {
                    if (typeof window.api === "function") {
                        await window.api(`/api/categories/${id}`, {
                            method: "PATCH",
                            body: JSON.stringify({
                                name: nameInput.value.trim(),
                                color: colorInput ? colorInput.value.trim() : "#64748B"
                            })
                        });
                    }

                    if (typeof window.loadCategories === "function") window.loadCategories();
                    if (typeof window.loadExpenses === "function") window.loadExpenses();
                    if (typeof window.loadStatistics === "function") window.loadStatistics();

                    if (typeof window.showMessage === "function") {
                        window.showMessage("Категорію оновлено!");
                    }
                    dialog.close();
                } catch (err) {
                    if (typeof window.showMessage === "function") {
                        window.showMessage(err.message, "error");
                    }
                }
            });
        }
    }

    const createCategoryFormEl = $("#create-category-form");
    if (createCategoryFormEl) {
        createCategoryFormEl.addEventListener("reset", () => {
            setTimeout(() => {
                const colorInput = $("#category-color-input");
                if (colorInput) {
                    colorInput.value = "#64748B";
                    colorInput.dispatchEvent(new Event("input", { bubbles: true }));
                }
            }, 0);
        });
        createCategoryFormEl.addEventListener("submit", () => {
            setTimeout(() => {
                const colorInput = $("#category-color-input");
                if (colorInput) {
                    colorInput.dispatchEvent(new Event("input", { bubbles: true }));
                }
            }, 100);
        });
    }

    // ------------------------------------------
    // Init
    // ------------------------------------------

    applyTheme(theme);
    applyLang(lang);

    localizeMoney($("#total-expenses"));
    localizeMoney($("#average-expense"));

    initColorPickers();
    setupEditCategoryDialog();
    window.addEventListener("DOMContentLoaded", setupEditCategoryDialog);

    syncApp();
})();