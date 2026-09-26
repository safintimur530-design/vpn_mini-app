```javascript
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


// =========================
// НАСТРОЙКИ
// =========================

const API_BASE =
    "https://filters-jesse-occupied-potato.trycloudflare.com";

let userData = null;
let connected = false;


// =========================
// TELEGRAM INIT DATA
// =========================

const initData = tg.initData || "";


// =========================
// API
// =========================

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            API_BASE + endpoint,
            {
                method: options.method || "GET",

                headers: {
                    "Content-Type": "application/json",
                    "X-Telegram-Init-Data": initData
                },

                body: options.body
                    ? JSON.stringify(options.body)
                    : undefined
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `Ошибка сервера: ${response.status}`
            );
        }

        return data;

    } catch (error) {

        console.error("API ERROR:", error);

        throw error;
    }
}


// =========================
// ЗАГРУЗКА ПРОФИЛЯ
// =========================

async function loadProfile() {

    try {

        const result =
            await apiRequest("/api/profile");

        if (result.success) {

            userData = result.user;

            updateProfileUI();
        }

    } catch (error) {

        console.error(
            "Ошибка загрузки профиля:",
            error
        );
    }
}


// =========================
// ОБНОВЛЕНИЕ ПРОФИЛЯ
// =========================

function updateProfileUI() {

    if (!userData) return;


    if (userData.subscription) {

        document.getElementById(
            "subscriptionStatus"
        ).textContent = "Активна";

    } else {

        document.getElementById(
            "subscriptionStatus"
        ).textContent = "Не активна";
    }


    if (
        userData.referral_discount !== undefined
    ) {

        document.getElementById(
            "discountStatus"
        ).textContent =
            userData.referral_discount + "%";

        document.getElementById(
            "referralDiscount"
        ).textContent =
            userData.referral_discount + "%";
    }
}


// =========================
// VPN
// =========================

function connectVPN() {

    if (connected) {

        connected = false;

        updateVPNStatus();

        return;
    }


    tg.showConfirm(
        "Подключить VPN?",
        function (confirmed) {

            if (!confirmed) return;

            connected = true;

            updateVPNStatus();
        }
    );
}


// =========================
// СТАТУС VPN
// =========================

function updateVPNStatus() {

    const circle =
        document.getElementById("statusCircle");

    const title =
        document.getElementById("statusTitle");

    const subtitle =
        document.getElementById("statusSubtitle");

    const button =
        document.getElementById("connectButton");

    const dot =
        document.getElementById("statusDot");

    const small =
        document.getElementById("statusSmall");


    if (connected) {

        circle.classList.add("connected");

        button.classList.add("connected");

        button.textContent =
            "ОТКЛЮЧИТЬ";

        title.textContent =
            "VPN подключён";

        subtitle.textContent =
            "Соединение защищено";

        small.textContent =
            "Подключено";

        dot.style.background =
            "#35d07f";

        dot.style.boxShadow =
            "0 0 10px rgba(53,208,127,0.7)";

    } else {

        circle.classList.remove("connected");

        button.classList.remove("connected");

        button.textContent =
            "ПОДКЛЮЧИТЬ";

        title.textContent =
            "VPN отключён";

        subtitle.textContent =
            "Твой интернет не защищён";

        small.textContent =
            "Не подключено";

        dot.style.background =
            "#657080";

        dot.style.boxShadow =
            "0 0 8px rgba(101,112,128,0.5)";
    }
}


// =========================
// ТАРИФЫ
// =========================

async function openPlans() {

    try {

        const result =
            await apiRequest("/api/plans");

        if (!result.success) {

            throw new Error(
                "Не удалось загрузить тарифы"
            );
        }


        const plans = result.plans;


        let text =
            "💳 ТАРИФЫ\n\n";


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


        text +=
            "\nОплата будет подключена следующим этапом.";


        tg.showAlert(text);

    } catch (error) {

        tg.showAlert(
            "❌ Не удалось загрузить тарифы.\n\n" +
            error.message
        );
    }
}


// =========================
// СЕРВЕР
// =========================

function changeServer() {

    const select =
        document.getElementById("serverSelect");

    const name =
        document.getElementById("serverName");

    const ping =
        document.getElementById("serverPing");


    const servers = {

        germany: {
            name: "🇩🇪 Германия",
            ping: "38 ms"
        },

        netherlands: {
            name: "🇳🇱 Нидерланды",
            ping: "42 ms"
        },

        finland: {
            name: "🇫🇮 Финляндия",
            ping: "51 ms"
        }

    };


    const server =
        servers[select.value];

    if (!server) return;


    name.textContent =
        server.name;

    ping.textContent =
        server.ping;
}


// =========================
// ПРОФИЛЬ
// =========================

function openProfile() {

    if (!userData) {

        tg.showAlert(
            "👤 Профиль загружается..."
        );

        loadProfile();

        return;
    }


    const user =
        userData;


    const firstName =
        user.first_name ||
        "Пользователь";


    const username =
        user.username
            ? "@" + user.username
            : "—";


    tg.showAlert(

        "👤 ПРОФИЛЬ\n\n" +

        `Имя: ${firstName}\n` +

        `Username: ${username}\n\n` +

        `Подписка: ${
            user.subscription
                ? "Активна"
                : "Не активна"
        }`
    );
}


// =========================
// УСТРОЙСТВА
// =========================

function openDevices() {

    tg.showAlert(
        "📱 Устройства\n\n" +
        "Сейчас подключено: 0 / 3\n\n" +
        "Управление устройствами подключим следующим этапом."
    );
}


// =========================
// РЕФЕРАЛЫ
// =========================

async function openReferrals() {

    try {

        const result =
            await apiRequest(
                "/api/referrals"
            );


        if (!result.success) {

            throw new Error(
                "Не удалось получить рефералы"
            );
        }


        const referrals =
            result.referrals || 0;


        const discount =
            result.discount || 0;


        tg.showAlert(

            "🎁 РЕФЕРАЛЬНАЯ ПРОГРАММА\n\n" +

            `Приглашено: ${referrals}\n` +

            `Твоя скидка: ${discount}%`
        );

    } catch (error) {

        tg.showAlert(
            "❌ Не удалось загрузить реферальную информацию."
        );
    }
}


// =========================
// ПРОМОКОД
// =========================

function openPromo() {

    tg.showAlert(
        "🎟 Промокод\n\n" +
        "Система промокодов будет подключена следующим этапом."
    );
}


// =========================
// ЗАПУСК
// =========================

async function init() {

    updateVPNStatus();

    await loadProfile();
}


// Запускаем приложение

init();
```
