```javascript
"use strict";


// ========================================
// TELEGRAM
// ========================================

const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


// ========================================
// API
// ========================================

const API_BASE =
    "https://filters-jesse-occupied-potato.trycloudflare.com";

const initData =
    tg.initData || "";


// ========================================
// ДАННЫЕ
// ========================================

let connected = false;
let userData = null;


// ========================================
// API REQUEST
// ========================================

async function apiRequest(endpoint, options = {}) {

    const requestOptions = {

        method: options.method || "GET",

        headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData
        }

    };


    if (options.body) {

        requestOptions.body =
            JSON.stringify(options.body);
    }


    const response =
        await fetch(
            API_BASE + endpoint,
            requestOptions
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error ||
            data.message ||
            `Ошибка ${response.status}`
        );
    }


    return data;
}


// ========================================
// VPN
// ========================================

function updateVPN() {

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
            "none";
    }
}


function connectVPN() {

    if (connected) {

        connected = false;

        updateVPN();

        return;
    }


    tg.showConfirm(
        "Подключить VPN?",
        function (confirmed) {

            if (!confirmed) return;

            connected = true;

            updateVPN();
        }
    );
}


// ========================================
// ТАРИФЫ
// ========================================

async function openPlans() {

    try {

        const result =
            await apiRequest("/api/plans");


        if (!result.success) {

            throw new Error(
                "Не удалось загрузить тарифы"
            );
        }


        const plans =
            result.plans;


        let message =
            "💳 ТАРИФЫ\n\n";


        if (plans.week) {

            message +=
                `7 дней — ${plans.week.price} ₽\n`;
        }


        if (plans.month) {

            message +=
                `30 дней — ${plans.month.price} ₽\n`;
        }


        if (plans.three_months) {

            message +=
                `90 дней — ${plans.three_months.price} ₽\n`;
        }


        tg.showAlert(message);

    } catch (error) {

        console.error(error);

        tg.showAlert(
            "❌ Не удалось загрузить тарифы.\n\n" +
            error.message
        );
    }
}


// ========================================
// ПРОФИЛЬ
// ========================================

async function loadProfile() {

    try {

        const result =
            await apiRequest("/api/profile");


        if (
            result &&
            result.success
        ) {

            userData =
                result.user;


            updateProfileUI();
        }

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );
    }
}


function updateProfileUI() {

    if (!userData) return;


    const subscription =
        document.getElementById(
            "subscriptionStatus"
        );


    const discount =
        document.getElementById(
            "discountStatus"
        );


    const referralDiscount =
        document.getElementById(
            "referralDiscount"
        );


    if (subscription) {

        subscription.textContent =
            userData.subscription
                ? "Активна"
                : "Не активна";
    }


    const discountValue =
        userData.referral_discount || 0;


    if (discount) {

        discount.textContent =
            discountValue + "%";
    }


    if (referralDiscount) {

        referralDiscount.textContent =
            discountValue + "%";
    }
}


function openProfile() {

    if (!userData) {

        tg.showAlert(
            "👤 Профиль загружается..."
        );

        loadProfile();

        return;
    }


    const name =
        userData.first_name ||
        "Пользователь";


    const username =
        userData.username
            ? "@" + userData.username
            : "—";


    tg.showAlert(

        "👤 ПРОФИЛЬ\n\n" +

        `Имя: ${name}\n` +

        `Username: ${username}\n\n` +

        "Подписка: " +

        (
            userData.subscription
                ? "Активна"
                : "Не активна"
        )
    );
}


// ========================================
// СЕРВЕР
// ========================================

function changeServer() {

    const select =
        document.getElementById(
            "serverSelect"
        );


    const name =
        document.getElementById(
            "serverName"
        );


    const ping =
        document.getElementById(
            "serverPing"
        );


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


// ========================================
// УСТРОЙСТВА
// ========================================

function openDevices() {

    tg.showAlert(
        "📱 Устройства\n\n" +
        "Подключено: 0 / 3\n\n" +
        "Управление устройствами подключим следующим этапом."
    );
}


// ========================================
// РЕФЕРАЛЫ
// ========================================

async function openReferrals() {

    try {

        const result =
            await apiRequest(
                "/api/referrals"
            );


        const referrals =
            result.referrals || 0;


        const discount =
            result.discount || 0;


        tg.showAlert(

            "🎁 РЕФЕРАЛЫ\n\n" +

            `Приглашено: ${referrals}\n` +

            `Скидка: ${discount}%`
        );

    } catch (error) {

        console.error(error);

        tg.showAlert(
            "❌ Не удалось загрузить рефералов."
        );
    }
}


// ========================================
// ПРОМОКОД
// ========================================

function openPromo() {

    tg.showAlert(
        "🎟 ПРОМОКОД\n\n" +
        "Система промокодов будет подключена позже."
    );
}


// ========================================
// КНОПКИ
// ========================================

function setupButtons() {

    const connectButton =
        document.getElementById(
            "connectButton"
        );


    const profileButton =
        document.getElementById(
            "profileButton"
        );


    const plansButton =
        document.getElementById(
            "plansButton"
        );


    const devicesButton =
        document.getElementById(
            "devicesButton"
        );


    const referralsButton =
        document.getElementById(
            "referralsButton"
        );


    const promoButton =
        document.getElementById(
            "promoButton"
        );


    const plansNavButton =
        document.getElementById(
            "plansNavButton"
        );


    const profileNavButton =
        document.getElementById(
            "profileNavButton"
        );


    const serverSelect =
        document.getElementById(
            "serverSelect"
        );


    connectButton.addEventListener(
        "click",
        connectVPN
    );


    profileButton.addEventListener(
        "click",
        openProfile
    );


    plansButton.addEventListener(
        "click",
        openPlans
    );


    devicesButton.addEventListener(
        "click",
        openDevices
    );


    referralsButton.addEventListener(
        "click",
        openReferrals
    );


    promoButton.addEventListener(
        "click",
        openPromo
    );


    plansNavButton.addEventListener(
        "click",
        openPlans
    );


    profileNavButton.addEventListener(
        "click",
        openProfile
    );


    serverSelect.addEventListener(
        "change",
        changeServer
    );
}


// ========================================
// ЗАПУСК
// ========================================

async function init() {

    updateVPN();

    setupButtons();

    await loadProfile();
}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();
}
```
