```javascript
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


// ===============================
// НАСТРОЙКИ
// ===============================

const API_URL = "https://circus-interim-simon-italiano.trycloudflare.com";


// ===============================
// TELEGRAM USER
// ===============================

const user = tg.initDataUnsafe?.user || null;


// ===============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ===============================

function showMessage(text) {
    if (tg.showAlert) {
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

        document.querySelector(".status-dot").style.background =
            "#35e27d";

        document.querySelector(".status-dot").style.boxShadow =
            "0 0 10px rgba(53,226,125,.7)";

        showMessage("🔐 VPN подключён");

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

        document.querySelector(".status-dot").style.background =
            "#ff5364";

        document.querySelector(".status-dot").style.boxShadow =
            "0 0 10px rgba(255,83,100,.6)";

        showMessage("VPN отключён");
    }
}


// ===============================
// ПОДПИСКА
// ===============================

function openPlans() {

    showMessage(
        "💳 ПОДПИСКА\n\n" +
        "1 месяц — 150 ₽\n" +
        "3 месяца — 399 ₽\n" +
        "6 месяцев — 699 ₽\n" +
        "12 месяцев — 1100 ₽\n\n" +
        "Выберите тариф в следующей версии."
    );
}


// ===============================
// РЕФЕРАЛЫ
// ===============================

function openReferrals() {

    const telegramId = user?.id || "не определён";

    showMessage(
        "👥 РЕФЕРАЛЫ\n\n" +
        "Приглашайте друзей и получайте бонусы.\n\n" +
        "Ваш Telegram ID:\n" +
        telegramId
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
        user.username ||
        "Пользователь";

    const username =
        user.username
            ? "@" + user.username
            : "не указан";

    showMessage(
        "👤 ПРОФИЛЬ\n\n" +
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
        "Пока подключённых устройств нет.\n\n" +
        "После подключения WireGuard\n" +
        "здесь появится список устройств."
    );
}


// ===============================
// ПРИ ЗАПУСКЕ
// ===============================

console.log("NEXUS VPN Mini App запущен");

console.log("Telegram user:", user);

console.log("API:", API_URL);
```
