const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


// ===============================
// НАСТРОЙКИ
// ===============================

const API_URL =
    "https://wheat-suspension-already-jenny.trycloudflare.com";


// ===============================
// TELEGRAM USER
// ===============================

const user =
    tg?.initDataUnsafe?.user || null;


// ===============================
// УВЕДОМЛЕНИЕ
// ===============================

function showMessage(text) {

    if (tg && typeof tg.showAlert === "function") {
        tg.showAlert(text);
    } else {
        alert(text);
    }
}


// ===============================
// VPN
// ===============================

let vpnConnected = false;


function connectVPN() {

    if (!vpnConnected) {

        vpnConnected = true;

        document.getElementById("statusText").textContent =
            "VPN подключён";

        document.getElementById("connectionTitle").textContent =
            "Соединение защищено";

        document.getElementById("connectionDescription").innerHTML =
            "Ваш интернет защищён<br>соединение активно";

        document.getElementById("connectText").textContent =
            "ОТКЛЮЧИТЬ";

        const dot =
            document.getElementById("statusDot");

        dot.style.background = "#35e27d";
        dot.style.boxShadow =
            "0 0 10px rgba(53,226,125,.7)";

        showMessage("🏔️ Mountain VPN подключён");

    } else {

        vpnConnected = false;

        document.getElementById("statusText").textContent =
            "VPN отключён";

        document.getElementById("connectionTitle").textContent =
            "Защищённое соединение";

        document.getElementById("connectionDescription").innerHTML =
            "Подключитесь к VPN<br>для безопасного доступа в интернет";

        document.getElementById("connectText").textContent =
            "ПОДКЛЮЧИТЬ";

        const dot =
            document.getElementById("statusDot");

        dot.style.background = "#ff5364";
        dot.style.boxShadow =
            "0 0 10px rgba(255,83,100,.6)";

        showMessage("Mountain VPN отключён");
    }
}


// ===============================
// ПОДПИСКА
// ===============================

function openPlans() {

    showMessage(
        "💳 MOUNTAIN VPN\n\n" +
        "Тарифы:\n\n" +
        "1 месяц — 150 ₽\n" +
        "3 месяца — 399 ₽\n" +
        "6 месяцев — 699 ₽\n" +
        "12 месяцев — 1100 ₽"
    );
}


// ===============================
// РЕФЕРАЛЫ
// ===============================

function openReferrals() {

    const id =
        user?.id || "не определён";

    showMessage(
        "👥 РЕФЕРАЛЫ\n\n" +
        "Приглашайте друзей в Mountain VPN.\n\n" +
        "Ваш Telegram ID:\n" +
        id
    );
}


// ===============================
// ПРОФИЛЬ
// ===============================

function openProfile() {

    if (!user) {

        showMessage(
            "👤 ПРОФИЛЬ\n\n" +
            "Telegram-пользователь не определён."
        );

        return;
    }

    const name =
        user.first_name ||
        "Пользователь";

    const username =
        user.username
            ? "@" + user.username
            : "не указан";

    showMessage(
        "👤 MOUNTAIN VPN\n\n" +
        "Имя: " + name + "\n" +
        "Username: " + username + "\n" +
        "ID: " + user.id
    );
}


// ===============================
// УСТРОЙСТВА
// ===============================

function openDevices() {

    showMessage(
        "📱 УСТРОЙСТВА\n\n" +
        "Подключённых устройств пока нет.\n\n" +
        "После подключения WireGuard\n" +
        "здесь появятся ваши устройства."
    );
}


// ===============================
// КНОПКИ
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("connectButton")
        .addEventListener("click", connectVPN);

    document
        .getElementById("plansButton")
        .addEventListener("click", openPlans);

    document
        .getElementById("referralsButton")
        .addEventListener("click", openReferrals);

    document
        .getElementById("devicesButton")
        .addEventListener("click", openDevices);

    document
        .getElementById("profileButton")
        .addEventListener("click", openProfile);

    document
        .getElementById("profileCardButton")
        .addEventListener("click", openProfile);

    console.log("Mountain VPN Mini App loaded");
});
