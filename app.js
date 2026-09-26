alert("НОВЫЙ APP.JS ЗАГРУЖЕН");
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const API_BASE = "https://filters-jesse-occupied-potato.trycloudflare.com";


async function api(url, options = {}) {

    try {

        const response = await fetch(API_BASE + url, {

            ...options,

            headers: {
                "Content-Type": "application/json",
                "X-Telegram-Init-Data": tg.initData,
                ...(options.headers || {})
            }

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Ошибка сервера");
        }

        return data;

    } catch (error) {

        console.error("API ERROR:", error);

        tg.showAlert(
            "❌ Не удалось подключиться к серверу.\n\n" +
            "Попробуй ещё раз."
        );

        return null;
    }
}


/* =========================
   АВТОРИЗАЦИЯ
========================= */

async function login() {

    const result = await api("/api/auth", {
        method: "POST"
    });

    if (!result || !result.success) {
        console.log("Авторизация не выполнена");
        return null;
    }

    console.log("✅ Авторизация успешна");

    return result;
}


/* =========================
   ПРОФИЛЬ
========================= */

async function loadProfile() {

    const result = await api("/api/profile");

    if (!result || !result.success) {
        return null;
    }

    console.log("Профиль:", result);

    return result;
}


/* =========================
   VPN
========================= */

let vpnConnected = false;


async function connectVPN() {

    const button = document.querySelector(".connect-button");

    if (button) {
        button.disabled = true;
        button.textContent = "ЗАГРУЗКА...";
    }

    const profile = await loadProfile();

    if (!profile) {

        if (button) {
            button.disabled = false;
            button.textContent = "ПОДКЛЮЧИТЬ";
        }

        return;
    }

    vpnConnected = !vpnConnected;

    updateVPNStatus();

    if (button) {
        button.disabled = false;
    }
}


function updateVPNStatus() {

    const circle = document.getElementById("statusCircle");
    const title = document.getElementById("statusTitle");
    const subtitle = document.getElementById("statusSubtitle");
    const button = document.querySelector(".connect-button");

    if (vpnConnected) {

        if (circle) {
            circle.classList.add("connected");
        }

        if (title) {
            title.textContent = "VPN подключён";
        }

        if (subtitle) {
            subtitle.textContent = "Соединение защищено";
        }

        if (button) {
            button.textContent = "ОТКЛЮЧИТЬ";
        }

    } else {

        if (circle) {
            circle.classList.remove("connected");
        }

        if (title) {
            title.textContent = "VPN отключён";
        }

        if (subtitle) {
            subtitle.textContent = "Нажми, чтобы подключиться";
        }

        if (button) {
            button.textContent = "ПОДКЛЮЧИТЬ";
        }
    }
}


/* =========================
   СЕРВЕР
========================= */

function changeServer() {

    const select = document.getElementById("serverSelect");

    const serverName = document.getElementById("serverName");

    const serverPing = document.getElementById("serverPing");

    if (!select) {
        return;
    }

    const server = select.value;


    if (server === "germany") {

        if (serverName) {
            serverName.textContent = "🇩🇪 Германия";
        }

        if (serverPing) {
            serverPing.textContent = "38 ms";
        }

    }


    if (server === "netherlands") {

        if (serverName) {
            serverName.textContent = "🇳🇱 Нидерланды";
        }

        if (serverPing) {
            serverPing.textContent = "42 ms";
        }

    }


    if (server === "finland") {

        if (serverName) {
            serverName.textContent = "🇫🇮 Финляндия";
        }

        if (serverPing) {
            serverPing.textContent = "45 ms";
        }

    }
}


/* =========================
   ПОДПИСКА
========================= */

async function openPlans() {

    const result = await api("/api/plans");

    if (!result || !result.success) {
        return;
    }

    const plans = result.plans;

    let text = "💳 Тарифы VPN\n\n";

    if (plans.week) {

        text +=
            `7 дней — ${plans.week.price} ₽\n`;
    }

    if (plans.month) {

        text +=
            `30 дней — ${plans.month.price} ₽\n`;
    }

    if (plans.three_months) {

        text +=
            `90 дней — ${plans.three_months.price} ₽\n`;
    }

    text += "\nВыбери тариф для покупки.";

    tg.showPopup({
        title: "💳 Подписка",
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
                id: "close",
                type: "cancel",
                text: "Закрыть"
            }
        ]
    }, async function (buttonId) {

        if (buttonId === "close") {
            return;
        }

        await createPayment(buttonId);
    });
}


/* =========================
   СОЗДАНИЕ ПЛАТЕЖА
========================= */

async function createPayment(plan) {

    const result = await api("/api/payment/create", {

        method: "POST",

        body: JSON.stringify({
            plan: plan
        })

    });


    if (!result) {
        return;
    }


    if (!result.success) {

        tg.showAlert(
            result.message || "Не удалось создать платёж."
        );

        return;
    }


    tg.showAlert(
        "💳 Платёж создан.\n\n" +
        "Система оплаты будет подключена следующим этапом."
    );
}


/* =========================
   РЕФЕРАЛЫ
========================= */

async function openReferrals() {

    const result = await api("/api/referrals");

    if (!result || !result.success) {
        return;
    }

    let text =
        "🎁 Реферальная система\n\n" +
        `Приглашено: ${result.referrals || 0}\n` +
        `Скидка: ${result.discount || 0}%`;

    tg.showAlert(text);
}


/* =========================
   ПРОФИЛЬ
========================= */

async function openProfile() {

    const result = await api("/api/profile");

    if (!result || !result.success) {
        return;
    }

    const user = result.user || result;

    const name =
        user.first_name ||
        user.username ||
        "Пользователь";

    const username =
        user.username
            ? "@" + user.username
            : "нет";

    const balance =
        user.balance !== undefined
            ? user.balance + " ₽"
            : "0 ₽";

    tg.showAlert(

        "👤 Профиль\n\n" +

        `Имя: ${name}\n` +

        `Username: ${username}\n` +

        `Баланс: ${balance}`

    );
}


/* =========================
   УСТРОЙСТВА
========================= */

function openDevices() {

    tg.showAlert(
        "📱 Устройства\n\n" +
        "Максимальное количество устройств: 3."
    );
}


/* =========================
   ПРОМОКОД
========================= */

function openPromo() {

    tg.showPopup({

        title: "🎟 Промокод",

        message: "Введи промокод.",

        buttons: [
            {
                id: "close",
                type: "cancel",
                text: "Закрыть"
            }
        ]

    });
}


/* =========================
   ЗАПУСК
========================= */

async function startApp() {

    console.log("🚀 Mini App запускается...");

    console.log(
        "Telegram initData:",
        tg.initData ? "получен" : "отсутствует"
    );

    const result = await login();

    if (result) {

        await loadProfile();

    }

    updateVPNStatus();

    console.log("✅ Mini App готов");
}


startApp();
