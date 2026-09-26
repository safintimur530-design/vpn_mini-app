```javascript
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const API_BASE = "https://filters-jesse-occupied-potato.trycloudflare.com";

alert("НОВЫЙ APP.JS ЗАГРУЖЕН");

async function api(url, options = {}) {
    try {
        const response = await fetch(API_BASE + url, {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Telegram-Init-Data": tg.initData || "",
                ...(options.headers || {})
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Сервер вернул неправильный ответ: " + text.slice(0, 150));
        }

        if (!response.ok) {
            throw new Error(data.message || `Ошибка HTTP ${response.status}`);
        }

        return data;

    } catch (error) {
        console.error("API ERROR:", error);

        tg.showAlert(
            "❌ ОШИБКА API\n\n" +
            error.message
        );

        return null;
    }
}


// =========================
// ПРОФИЛЬ / АВТОРИЗАЦИЯ
// =========================

async function login() {
    const data = await api("/api/auth", {
        method: "POST"
    });

    if (!data) return null;

    return data;
}


async function loadProfile() {
    const data = await api("/api/profile");

    if (!data) return null;

    return data;
}


// =========================
// VPN
// =========================

let vpnConnected = false;

async function connectVPN() {

    tg.showAlert("🔄 Проверяем профиль...");

    const profile = await loadProfile();

    if (!profile) return;

    vpnConnected = !vpnConnected;

    updateVPNStatus();

    if (vpnConnected) {
        tg.showAlert(
            "🟢 VPN подключён!\n\n" +
            "Сервер: " + getSelectedServer()
        );
    } else {
        tg.showAlert("🔴 VPN отключён.");
    }
}


function updateVPNStatus() {

    const button = document.querySelector(".vpn-button");

    if (!button) return;

    if (vpnConnected) {
        button.innerText = "Отключиться";
    } else {
        button.innerText = "Подключиться";
    }
}


// =========================
// СЕРВЕР
// =========================

let selectedServer = "Germany";

function changeServer(server) {

    selectedServer = server;

    tg.showAlert(
        "🌍 Выбран сервер:\n\n" +
        server
    );
}


function getSelectedServer() {
    return selectedServer;
}


// =========================
// ТАРИФЫ
// =========================

async function openPlans() {

    const data = await api("/api/plans");

    if (!data) return;

    const plans = data.plans;

    const text =
        "💳 ТАРИФЫ VPN\n\n" +

        "🇩🇪 7 дней — " +
        plans.week.price +
        " ₽\n\n" +

        "🇩🇪 30 дней — " +
        plans.month.price +
        " ₽\n\n" +

        "🇩🇪 90 дней — " +
        plans.three_months.price +
        " ₽";

    tg.showPopup({
        title: "Тарифы",
        message: text,
        buttons: [
            {
                id: "week",
                type: "default",
                text: "7 дней"
            },
            {
                id: "month",
                type: "default",
                text: "30 дней"
            },
            {
                id: "three_months",
                type: "default",
                text: "90 дней"
            },
            {
                type: "cancel"
            }
        ]
    }, function(buttonId) {

        if (!buttonId) return;

        createPayment(buttonId);
    });
}


// =========================
// ОПЛАТА
// =========================

async function createPayment(plan) {

    const data = await api("/api/payment/create", {
        method: "POST",
        body: {
            plan: plan
        }
    });

    if (!data) return;

    tg.showAlert(
        "💳 Платёж создан.\n\n" +
        "Тариф: " + plan
    );
}


// =========================
// РЕФЕРАЛЫ
// =========================

async function openReferrals() {

    const data = await api("/api/referrals");

    if (!data) return;

    tg.showAlert(
        "👥 РЕФЕРАЛЫ\n\n" +
        "Приглашено: " +
        (data.count || 0)
    );
}


// =========================
// ПРОФИЛЬ
// =========================

async function openProfile() {

    const data = await api("/api/profile");

    if (!data) return;

    const user = data.user || data;

    tg.showPopup({
        title: "👤 Профиль",
        message:
            "ID: " + (user.telegram_id || user.id || "—") +
            "\n\nБаланс: " +
            (user.balance || 0) +
            " ₽",
        buttons: [
            {
                type: "close",
                text: "Закрыть"
            }
        ]
    });
}


// =========================
// УСТРОЙСТВА
// =========================

function openDevices() {

    tg.showAlert(
        "📱 Устройства\n\n" +
        "Раздел пока находится в разработке."
    );
}


// =========================
// ПРОМОКОД
// =========================

function openPromo() {

    tg.showPopup({
        title: "🎁 Промокод",
        message: "Введи промокод",
        buttons: [
            {
                id: "enter",
                type: "default",
                text: "Ввести"
            },
            {
                type: "cancel"
            }
        ]
    }, function(buttonId) {

        if (buttonId === "enter") {

            tg.showAlert(
                "Раздел промокодов пока в разработке."
            );
        }
    });
}


// =========================
// ЗАПУСК
// =========================

async function startApp() {

    console.log("🚀 Mini App запускается");

    const auth = await login();

    if (!auth) {
        console.log("Авторизация не выполнена");
        return;
    }

    console.log("✅ Авторизация успешна");

    await loadProfile();

    console.log("✅ Профиль загружен");
}


startApp();
```
