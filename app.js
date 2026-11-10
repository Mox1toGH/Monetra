// ==========================================
// MONETRA FRONTEND
// ==========================================

const API_URL = "";

let currentPage = 1;
let totalPages = 1;

let categoriesCache = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const today = new Date().toLocaleDateString("en-CA");

if ($("#expense-date")) {
    $("#expense-date").value = today;
}

// ==========================================
// API REQUESTS
// ==========================================

async function api(path, options = {}) {
    const response = await fetch(API_URL + path, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("Invalid API response");
    }

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

function showMessage(message, type = "success") {
    const element = $("#message");
    if (!element) return;

    element.textContent = message;
    element.className = type;

    setTimeout(() => {
        element.textContent = "";
        element.className = "";
    }, 4000);
}

function formatMoney(amount) {
    return (amount / 100).toLocaleString("uk-UA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " UAH";
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

// ==========================================
// AUTHENTICATION
// ==========================================

function showApp(user) {
    if ($("#auth-section")) $("#auth-section").hidden = true;
    if ($("#app-section")) $("#app-section").hidden = false;
    if ($("#logout-btn")) $("#logout-btn").hidden = false;

    if ($("#user-info")) {
        $("#user-info").textContent = "Logged in as: " + user.username;
    }

    loadCategories();
    loadExpenses();
    loadStatistics();
}

function showAuth() {
    if ($("#auth-section")) $("#auth-section").hidden = false;
    if ($("#app-section")) $("#app-section").hidden = true;
    if ($("#logout-btn")) $("#logout-btn").hidden = true;

    if ($("#user-info")) {
        $("#user-info").textContent = "Not logged in";
    }
}

// ==========================================
// CATEGORIES MANAGEMENT (з підтримкою кольорів)
// ==========================================

async function loadCategories() {
    try {
        const data = await api("/api/categories");
        categoriesCache = data.categories || [];
        renderCategoriesList();
        populateCategorySelects();
    } catch (err) {
        console.error("Failed to load categories:", err);
    }
}

function renderCategoriesList() {
    const container = $("#categories-list");
    if (!container) return;

    container.innerHTML = "";

    categoriesCache.forEach(cat => {
        const item = createElement("div", "category-item");
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.justifyContent = "space-between";
        item.style.padding = "8px";
        item.style.marginBottom = "6px";
        item.style.border = "1px solid #e2e8f0";
        item.style.borderRadius = "6px";

        const left = createElement("div", "category-info");
        left.style.display = "flex";
        left.style.alignItems = "center";
        left.style.gap = "10px";

        const colorBadge = createElement("span", "category-color-badge");
        colorBadge.style.width = "16px";
        colorBadge.style.height = "16px";
        colorBadge.style.borderRadius = "50%";
        colorBadge.style.backgroundColor = cat.color;
        colorBadge.style.display = "inline-block";

        const nameSpan = createElement("span", "category-name", cat.name);
        nameSpan.style.fontWeight = "500";

        left.appendChild(colorBadge);
        left.appendChild(nameSpan);
        item.appendChild(left);

        const actions = createElement("div", "category-actions");
        actions.style.display = "flex";
        actions.style.gap = "6px";

        const editBtn = createElement("button", "btn-edit", "Редагувати");
        editBtn.type = "button";
        editBtn.onclick = () => openEditCategoryModal(cat);

        actions.appendChild(editBtn);

        if (cat.name.toLowerCase() !== "other") {
            const deleteBtn = createElement("button", "btn-delete", "Видалити");
            deleteBtn.type = "button";
            deleteBtn.onclick = () => deleteCategory(cat.id);
            actions.appendChild(deleteBtn);
        }

        item.appendChild(actions);
        container.appendChild(item);
    });
}

function populateCategorySelects() {
    const selects = $$("select[name='category_id'], #expense-category, #filter-category");
    
    selects.forEach(select => {
        if (!select) return;
        const currentVal = select.value;
        
        // Зберігаємо першу опцію (якщо це фільтр "Всі категорії" тощо)
        const firstOption = select.options[0] && select.options[0].value === "" ? select.options[0].outerHTML : '<option value="">Виберіть категорію</option>';
        
        select.innerHTML = firstOption;

        categoriesCache.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });

        select.value = currentVal;
    });
}

async function handleCreateCategory(event) {
    event.preventDefault();

    const nameInput = $("#category-name-input");
    const colorInput = $("#category-color-input");

    if (!nameInput) return;

    try {
        await api("/api/categories", {
            method: "POST",
            body: JSON.stringify({
                name: nameInput.value.trim(),
                color: colorInput ? colorInput.value : "#64748B"
            })
        });

        nameInput.value = "";
        if (colorInput) colorInput.value = "#64748B";

        loadCategories();
        showMessage("Категорію успішно створено!");
    } catch (err) {
        showMessage(err.message, "error");
    }
}

async function openEditCategoryModal(cat) {
    const newName = prompt("Введіть нову назву категорії:", cat.name);
    if (newName === null) return;

    const newColor = prompt("Введіть новий HEX колір (наприклад, #3498DB):", cat.color);
    if (newColor === null) return;

    try {
        await api(`/api/categories/${cat.id}`, {
            method: "PATCH",
            body: JSON.stringify({
                name: newName.trim(),
                color: newColor.trim()
            })
        });

        loadCategories();
        loadExpenses();
        loadStatistics();
        showMessage("Категорію оновлено!");
    }	catch (err) {
        showMessage(err.message, "error");
    }
}

async function deleteCategory(id) {
    if (!confirm("Ви впевнені? Всі витрати з цієї категорії будуть перенесені в 'Other'.")) {
        return;
    }

    try {
        await api(`/api/categories/${id}`, {
            method: "DELETE"
        });

        loadCategories();
        loadExpenses();
        loadStatistics();
        showMessage("Категорію видалено.");
    } catch (err) {
        showMessage(err.message, "error");
    }
}

// ==========================================
// EXPENSES MANAGEMENT
// ==========================================

async function loadExpenses() {
    try {
        const params = new URLSearchParams();
        params.set("page", currentPage);
        params.set("limit", 10);
        params.set("sort", "date_desc");

        const start = $("#filter-start")?.value;
        const end = $("#filter-end")?.value;
        const cat = $("#filter-category")?.value;
        if (start) params.set("start", start);
        if (end) params.set("end", end);
        if (cat) params.set("category_id", cat);

        const data = await api(`/api/expenses?${params.toString()}`);
        renderExpensesList(data.expenses || []);
        totalPages = (data.pagination && data.pagination.pages) || 1;
        
        const pageInfo = $("#page-info");
        if (pageInfo) {
            pageInfo.textContent = `Сторінка ${currentPage} з ${totalPages}`;
        }
    } catch (err) {
        console.error("Failed to load expenses:", err);
    }
}

function renderExpensesList(expenses) {
    const container = $("#expenses-list");
    if (!container) return;

    container.innerHTML = "";

    if (expenses.length === 0) {
        container.innerHTML = "<p>Витрат поки немає.</p>";
        return;
    }

    expenses.forEach(exp => {
        const item = createElement("div", "expense-item");

        const left = createElement("div", "expense-item-left");
        
        const catBadge = createElement("span", "expense-category-badge", exp.category_name);
        catBadge.style.backgroundColor = exp.category_color || "#64748B";

        const meta = createElement("div", "expense-meta");
        const desc = createElement("span", "expense-desc", exp.description || "Без опису");
        const dateSpan = createElement("span", "expense-date", exp.expense_date);

        meta.appendChild(desc);
        meta.appendChild(dateSpan);

        left.appendChild(catBadge);
        left.appendChild(meta);
        item.appendChild(left);

        const right = createElement("div", "expense-item-right");
        const amountSpan = createElement("span", "expense-amount", formatMoney(exp.amount));

        const delBtn = createElement("button", "btn-delete-expense", "×");
        delBtn.title = "Видалити витрату";
        delBtn.onclick = () => deleteExpense(exp.id);

        right.appendChild(amountSpan);
        right.appendChild(delBtn);
        item.appendChild(right);

        container.appendChild(item);
    });
}

async function handleCreateExpense(event) {
    event.preventDefault();

    const amountInput = $("#expense-amount");
    const descInput = $("#expense-description");
    const dateInput = $("#expense-date");
    const catSelect = $("#expense-category");

    if (!amountInput || !dateInput) return;

    // Конвертуємо введену суму у гривнях у мінори (копійки)
    const floatAmount = parseFloat(amountInput.value);
    const amountInMinor = Math.round(floatAmount * 100);

    try {
        await api("/api/expenses", {
            method: "POST",
            body: JSON.stringify({
                amount: amountInMinor,
                description: descInput ? descInput.value.trim() : "",
                expense_date: dateInput.value,
                category_id: catSelect ? catSelect.value : undefined,
                currency: "UAH"
            })
        });

        amountInput.value = "";
        if (descInput) descInput.value = "";
        dateInput.value = today;

        loadExpenses();
        loadStatistics();
        showMessage("Витрату додано!");
    } catch (err) {
        showMessage(err.message, "error");
    }
}

async function deleteExpense(id) {
    try {
        await api(`/api/expenses/${id}`, {
            method: "DELETE"
        });

        loadExpenses();
        loadStatistics();
        showMessage("Витрату видалено.");
    } catch (err) {
        showMessage(err.message, "error");
    }
}

// ==========================================
// STATISTICS
// ==========================================

function getStatisticsURL() {
    const periodSelect = $("#period");
    const period = periodSelect ? periodSelect.value : "month";

    if (period === "custom") {
        const start = $("#start-date")?.value;
        const end = $("#end-date")?.value;

        if (start && end && start <= end) {
            return `/api/statistics/summary?start=${start}&end=${end}`;
        }
    }

    return `/api/statistics/summary?period=${period}`;
}

async function loadStatistics() {
    try {
        const url = getStatisticsURL();
        const data = await api(url);
        
        if (data.summary) {
            if ($("#total-expenses")) $("#total-expenses").textContent = formatMoney(data.summary.total_expenses);
            if ($("#transaction-count")) $("#transaction-count").textContent = data.summary.transactions_count;
            if ($("#average-expense")) $("#average-expense").textContent = formatMoney(data.summary.average_expense);
        }

        const container = $("#category-stats");
        if (container) {
            container.innerHTML = "";
            const categories = data.categories || [];
            
            if (categories.length === 0) {
                container.innerHTML = `<p class="empty" data-i18n="noStats">Немає витрат за цей період.</p>`;
            } else {
                categories.forEach(category => {
                    const item = createElement("div", "category-stat");
                    const label = createElement(
                        "div",
                        "stat-label",
                        `${category.name}: ${formatMoney(category.total)} (${category.percentage}%)`
                    );
                    const progress = createElement("div", "progress");
                    const bar = createElement("div", "progress-bar");
                    bar.style.width = category.percentage + "%";
                    if (category.color) bar.style.backgroundColor = category.color;
                    progress.appendChild(bar);
                    item.append(label, progress);
                    container.appendChild(item);
                });
            }

            if (typeof window.renderDonutChart === "function") {
                window.renderDonutChart(categories, data.summary ? data.summary.total_expenses : 0);
            }
        }
    } catch (err) {
        console.error("Failed to load statistics:", err);
    }
}

// ==========================================
// EVENT LISTENERS & INIT
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    // Обробник форми реєстрації
    const registerForm = $("#register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = $("#register-username")?.value.trim();
            const email = $("#register-email")?.value.trim();
            const password = $("#register-password")?.value;

            try {
                const data = await api("/api/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ username, email, password })
                });
                showApp(data.user);
                showMessage("Реєстрація успішна!");
            } catch (err) {
                showMessage(err.message, "error");
            }
        });
    }

    // Обробник форми логіну
    const loginForm = $("#login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const login = $("#login-value")?.value.trim();
            const password = $("#login-password")?.value;

            try {
                const data = await api("/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ login, password })
                });
                showApp(data.user);
                showMessage("Вхід виконано успішно!");
            } catch (err) {
                showMessage(err.message, "error");
            }
        });
    }

    // Кнопка виходу
    const logoutBtn = $("#logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await api("/api/auth/logout", { method: "POST" });
                showAuth();
                showMessage("Ви вийшли з системи.");
            } catch (err) {
                showMessage(err.message, "error");
            }
        });
    }

    // Створення категорії
    const createCategoryForm = $("#create-category-form");
    if (createCategoryForm) {
        createCategoryForm.addEventListener("submit", handleCreateCategory);
    }

    // Створення витрати
    const createExpenseForm = $("#create-expense-form");
    if (createExpenseForm) {
        createExpenseForm.addEventListener("submit", handleCreateExpense);
    }

    // Період та фільтр дат статистики
    const periodSelect = $("#period");
    if (periodSelect) {
        periodSelect.addEventListener("change", () => {
            const custom = periodSelect.value === "custom";
            if ($("#custom-dates")) $("#custom-dates").hidden = !custom;
            if (!custom) loadStatistics();
        });
    }

    const applyDatesBtn = $("#apply-dates");
    if (applyDatesBtn) {
        applyDatesBtn.addEventListener("click", loadStatistics);
    }

    // Фільтр історії витрат
    const filterBtn = $("#filter-expenses");
    if (filterBtn) {
        filterBtn.addEventListener("click", () => {
            currentPage = 1;
            loadExpenses();
        });
    }

    const clearFilterBtn = $("#clear-filter");
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener("click", () => {
            if ($("#filter-start")) $("#filter-start").value = "";
            if ($("#filter-end")) $("#filter-end").value = "";
            if ($("#filter-category")) $("#filter-category").value = "";
            currentPage = 1;
            loadExpenses();
        });
    }

    // Пагінація
    const prevPageBtn = $("#prev-page");
    const nextPageBtn = $("#next-page");

    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadExpenses();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadExpenses();
            }
        });
    }

    // Перевірка поточної сесії при завантаженні сторінки
    try {
        const data = await api("/api/auth/me");
        if (data.success && data.user) {
            showApp(data.user);
        } else {
            showAuth();
        }
    } catch {
        showAuth();
    }
});