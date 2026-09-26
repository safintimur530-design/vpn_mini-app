```javascript
"use strict";

const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const API_BASE =
    "https://filters-jesse-occupied-potato.trycloudflare.com";

let connected = false;


// ==============================
// VPN
// ==============================

function connectVPN() {

    if (connected) {

        connected = false;

        document
            .getElementById("statusCircle")
            .classList.remove("connected");

        document
            .getElementById("connectButton")
            .classList.remove("connected");

        document
            .getElementById("connectButton")
            .textContent = "ПОДКЛЮЧИТЬ";

        document
            .getElementById("statusTitle")
            .textContent = "VPN отключён";

        document
            .getElementById("statusSubtitle")
            .textContent = "Твой интернет не защищён";

        document
            .getElementById("statusSmall")
            .textContent = "Не подключено";

        document
            .getElementById("statusDot")
            .style.background = "#657080";

        return;
    }


    connected = true;

    document
        .getElementById("statusCircle")
        .classList.add("connected");

    document
        .getElementById("connectButton")
        .classList.add("connected");

    document
        .getElementById("connectButton")
        .textContent = "ОТКЛЮЧИТЬ";

    document
        .getElementById("statusTitle")
        .textContent = "VPN подключён";

    document
        .getElementById("statusSubtitle")
        .textContent = "Соединение защищено";

    document
        .getElementById("statusSmall")
        .textContent = "Подключено";

    document
        .getElementById("statusDot")
        .style.background = "#35d07f";
}


// ==============================
// ТАРИФЫ
// ==============================

async function openPlans() {

    try {

        const response = await fetch(
            API_BASE + "/api/plans"
        );

        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                "Ошибка сервера: " +
                response.status
            );
        }


        const plans = data.plans;


        let text =
            "💳 ТАРИФЫ\n\n";


        if (plans.week) {

            text +=
                "7 дней — " +
                plans.week.price +
                " ₽\n";
        }


        if (plans.month) {

            text +=
                "30 дней — " +
                plans.month.price +
                " ₽\n";
        }


        if (plans.three_months) {

            text +=
                "90 дней — " +
                plans.three_months.price +
                " ₽\n";
        }


        tg.showAlert(text);

    } catch (error) {

        console.error(error);

        tg.showAlert(
            "❌ Ошибка загрузки тарифов\n\n" +
            error.message
        );
    }
}


// ==============================
// ПРОФИЛЬ
// ==============================

function openProfile() {

    const user =
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user;


    if (!user) {

        tg.showAlert(
            "👤 Профиль\n\n" +
            "Не удалось получить данные Telegram."
        );

        return;
    }


    const name =
        user.first_name || "Пользователь";


    const username =
        user.username
            ? "@" + user.username
            : "—";


    tg.showAlert(

        "👤 ПРОФИЛЬ\n\n" +

        "Имя: " +
        name +
        "\n\n" +

        "Username: " +
        username +
        "\n\n" +

        "ID: " +
        user.id
    );
}


// ==============================
// УСТРОЙСТВА
// ==============================

function openDevices() {

    tg.showAlert(
        "📱 Устройства\n\n" +
        "Подключено: 0 / 3"
    );
}


// ==============================
// РЕФЕРАЛЫ
// ==============================

function openReferrals() {

    tg.showAlert(
        "🎁 Рефералы\n\n" +
        "Реферальная система подключается."
    );
}


// ==============================
// ПРОМОКОД
// ==============================

function openPromo() {

    tg.showAlert(
        "🎟 Промокод\n\n" +
        "Введи промокод на следующем этапе."
    );
}


// ==============================
// СЕРВЕР
// ==============================

function changeServer() {

    const select =
        document.getElementById("serverSelect");

    const serverName =
        document.getElementById("serverName");

    const serverPing =
        document.getElementById("serverPing");


    if (select.value === "germany") {

        serverName.textContent =
            "🇩🇪 Германия";

        serverPing.textContent =
            "38 ms";

    } else if (
        select.value === "netherlands"
    ) {

        serverName.textContent =
            "🇳🇱 Нидерланды";

        serverPing.textContent =
            "42 ms";

    } else if (
        select.value === "finland"
    ) {

        serverName.textContent =
            "🇫🇮 Финляндия";

        serverPing.textContent =
            "51 ms";
    }
}


// ==============================
// ПОДКЛЮЧЕНИЕ КНОПОК
// ==============================

document
    .getElementById("connectButton")
    .addEventListener(
        "click",
        connectVPN
    );


document
    .getElementById("plansButton")
    .addEventListener(
        "click",
        openPlans
    );


document
    .getElementById("devicesButton")
    .addEventListener(
        "click",
        openDevices
    );


document
    .getElementById("referralsButton")
    .addEventListener(
        "click",
        openReferrals
    );


document
    .getElementById("promoButton")
    .addEventListener(
        "click",
        openPromo
    );


document
    .getElementById("profileButton")
    .addEventListener(
        "click",
        openProfile
    );


document
    .getElementById("plansNavButton")
    .addEventListener(
        "click",
        openPlans
    );


document
    .getElementById("profileNavButton")
    .addEventListener(
        "click",
        openProfile
    );


document
    .getElementById("serverSelect")
    .addEventListener(
        "change",
        changeServer
    );


// ==============================
// ГОТОВО
// ==============================

console.log(
    "VPN APP ЗАПУЩЕН"
);
```
