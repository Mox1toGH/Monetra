// ==========================================
// MONETRA FRONTEND
// ==========================================

const API_URL = "https://monetra-api.ai-email-it-turik-001.workers.dev/";

let currentPage = 1;
let totalPages = 1;

const $ = (selector) => document.querySelector(selector);

const today = new Date().toLocaleDateString("en-CA");

$("#expense-date").value = today;

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
    $("#auth-section").hidden = true;
    $("#app-section").hidden = false;
    $("#logout-btn").hidden = false;

    $("#user-info").textContent = "Logged in as: " + user.username;

    loadCategories();
    loadExpenses();
    loadStatistics();
}

function showAuth() {
    $("#auth-section").hidden = false;
    $("#app-section").hidden = true;
    $("#logout-btn").hidden = true;

    $("#user-info").textContent = "Not logged in";
}

$("#register-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = new FormData(event.target);

    try {
        const result = await api("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                username: form.get("username"),
                email: form.get("email"),
                password: form.get("password")
            })
        });

        showApp(result.user);
        showMessage("Account created successfully!");

        event.target.reset();

    } catch (error) {
        showMessage(error.message, "error");
    }
});

$("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = new FormData(event.target);

    try {
        const result = await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                login: form.get("login"),
                password: form.get("password")
            })
        });

        showApp(result.user);
        showMessage("Login successful!");

        event.target.reset();

    } catch (error) {
        showMessage(error.message, "error");
    }
});

$("#logout-btn").addEventListener("click", async () => {
    try {
        await api("/api/auth/logout", {
            method: "POST"
        });

        showAuth();
        showMessage("Logged out");

    } catch (error) {
        showMessage(error.message, "error");
    }
});

// ==========================================
// CATEGORIES
// ==========================================

async function loadCategories() {
    try {
        const result = await api("/api/categories");

        const select = $("#expense-category");
        const list = $("#categories-list");

        select.replaceChildren();
        list.replaceChildren();

        result.categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            if (category.name.toLowerCase() === "other") {
                option.selected = true;
            }

            select.appendChild(option);

            const item = createElement("div", "category-item");

            item.appendChild(
                createElement("span", "", category.name)
            );

            if (category.name.toLowerCase() !== "other") {
                const button = createElement("button", "", "Delete");

                button.addEventListener("click", () => {
                    deleteCategory(category.id);
                });

                item.appendChild(button);
            }

            list.appendChild(item);
        });

    } catch (error) {
        showMessage(error.message, "error");
    }
}

$("#category-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = new FormData(event.target);

    try {
        await api("/api/categories", {
            method: "POST",
            body: JSON.stringify({
                name: form.get("name")
            })
        });

        event.target.reset();

        await loadCategories();

        showMessage("Category created!");

    } catch (error) {
        showMessage(error.message, "error");
    }
});

async function deleteCategory(id) {
    if (!confirm("Delete this category? Its expenses will move to Other.")) {
        return;
    }

    try {
        await api("/api/categories/" + encodeURIComponent(id), {
            method: "DELETE"
        });

        await loadCategories();
        await loadExpenses();
        await loadStatistics();

        showMessage("Category deleted");

    } catch (error) {
        showMessage(error.message, "error");
    }
}

// ==========================================
// EXPENSES
// ==========================================

$("#expense-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = new FormData(event.target);

    const amount = Number(form.get("amount"));

    if (!Number.isFinite(amount) || amount <= 0) {
        showMessage("Invalid amount", "error");
        return;
    }

    try {
        await api("/api/expenses", {
            method: "POST",
            body: JSON.stringify({
                amount: Math.round(amount * 100),
                category_id: form.get("category_id"),
                description: form.get("description"),
                expense_date: form.get("expense_date")
            })
        });

        event.target.reset();
        $("#expense-date").value = today;

        currentPage = 1;

        await loadExpenses();
        await loadStatistics();

        showMessage("Expense added!");

    } catch (error) {
        showMessage(error.message, "error");
    }
});

async function loadExpenses() {
    try {
        const params = new URLSearchParams();

        params.set("page", currentPage);
        params.set("limit", 10);
        params.set("sort", "date_desc");

        const start = $("#filter-start").value;
        const end = $("#filter-end").value;

        if (start) params.set("start", start);
        if (end) params.set("end", end);

        const result = await api(
            "/api/expenses?" + params.toString()
        );

        const list = $("#expenses-list");

        list.replaceChildren();

        totalPages = result.pagination.pages;

        $("#page-info").textContent =
            `Page ${currentPage} / ${totalPages}`;

        $("#prev-page").disabled = currentPage <= 1;
        $("#next-page").disabled = currentPage >= totalPages;

        if (result.expenses.length === 0) {
            list.appendChild(
                createElement("p", "", "No expenses found.")
            );
            return;
        }

        result.expenses.forEach(expense => {
            const item = createElement("div", "expense-item");

            const details = createElement("div", "expense-details");

            details.appendChild(
                createElement("strong", "", expense.category_name)
            );

            details.appendChild(
                createElement("span", "", expense.description || "No description")
            );

            details.appendChild(
                createElement("small", "", expense.expense_date)
            );

            const amount = createElement(
                "span",
                "expense-amount",
                formatMoney(expense.amount)
            );

            const button = createElement("button", "", "Delete");

            button.addEventListener("click", () => {
                deleteExpense(expense.id);
            });

            item.append(details, amount, button);

            list.appendChild(item);
        });

    } catch (error) {
        showMessage(error.message, "error");
    }
}

async function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;

    try {
        await api("/api/expenses/" + encodeURIComponent(id), {
            method: "DELETE"
        });

        await loadExpenses();
        await loadStatistics();

        showMessage("Expense deleted");

    } catch (error) {
        showMessage(error.message, "error");
    }
}

$("#filter-expenses").addEventListener("click", () => {
    currentPage = 1;
    loadExpenses();
});

$("#clear-filter").addEventListener("click", () => {
    $("#filter-start").value = "";
    $("#filter-end").value = "";

    currentPage = 1;

    loadExpenses();
});

$("#prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadExpenses();
    }
});

$("#next-page").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadExpenses();
    }
});

// ==========================================
// STATISTICS
// ==========================================

function getStatisticsURL() {
    const period = $("#period").value;

    if (period === "custom") {
        const start = $("#start-date").value;
        const end = $("#end-date").value;

        if (!start || !end || start > end) {
            throw new Error("Select a valid date range");
        }

        return `/api/statistics/summary?start=${start}&end=${end}`;
    }

    return `/api/statistics/summary?period=${period}`;
}

async function loadStatistics() {
    try {
        const result = await api(getStatisticsURL());

        $("#total-expenses").textContent =
            formatMoney(result.summary.total_expenses);

        $("#transaction-count").textContent =
            result.summary.transactions_count;

        $("#average-expense").textContent =
            formatMoney(result.summary.average_expense);

        const container = $("#category-stats");

        container.replaceChildren();

        if (result.categories.length === 0) {
            container.appendChild(
                createElement("p", "", "No expenses for this period.")
            );
            return;
        }

        result.categories.forEach(category => {
            const item = createElement("div", "category-stat");

            const label = createElement(
                "div",
                "",
                `${category.name}: ${formatMoney(category.total)} (${category.percentage}%)`
            );

            const progress = createElement("div", "progress");
            const bar = createElement("div", "progress-bar");

            bar.style.width = category.percentage + "%";

            progress.appendChild(bar);

            item.append(label, progress);

            container.appendChild(item);
        });

    } catch (error) {
        showMessage(error.message, "error");
    }
}

$("#period").addEventListener("change", () => {
    const custom = $("#period").value === "custom";

    $("#custom-dates").hidden = !custom;

    if (!custom) loadStatistics();
});

$("#apply-dates").addEventListener("click", loadStatistics);

// ==========================================
// INITIALIZATION
// ==========================================

async function initialize() {
    try {
        const result = await api("/api/auth/me");

        showApp(result.user);

    } catch {
        showAuth();
    }
}

initialize();