```javascript
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const tg = window.Telegram?.WebApp;

    if (tg) {
        tg.ready();
        tg.expand();
    }

    const connectButton = document.getElementById("connectButton");
    const plansButton = document.getElementById("plansButton");
    const devicesButton = document.getElementById("devicesButton");
    const referralsButton = document.getElementById("referralsButton");
    const promoButton = document.getElementById("promoButton");

    const profileButton = document.getElementById("profileButton");
    const plansNavButton = document.getElementById("plansNavButton");
    const profileNavButton = document.getElementById("profileNavButton");

    const serverSelect = document.getElementById("serverSelect");

    const statusCircle = document.getElementById("statusCircle");
    const statusTitle = document.getElementById("statusTitle");
    const statusSubtitle = document.getElementById("statusSubtitle");
    const statusSmall = document.getElementById("statusSmall");
    const statusDot = document.getElementById("statusDot");

    let connected = false;

    function showMessage(message) {
        if (tg && typeof tg.showAlert === "function") {
            tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    // VPN
    connectButton?.addEventListener("click", () => {

        connected = !connected;

        if (connected) {

            statusCircle?.classList.add("connected");
            connectButton.classList.add("connected");

            connectButton.textContent = "ОТКЛЮЧИТЬ";
            statusTitle.textContent = "VPN подключён";
            statusSubtitle.textContent = "Соединение защищено";
            statusSmall.textContent = "Подключено";

            statusDot.style.background = "#35d07f";

        } else {

            statusCircle?.classList.remove("connected");
            connectButton.classList.remove("connected");

            connectButton.textContent = "ПОДКЛЮЧИТЬ";
            statusTitle.textContent = "VPN отключён";
            statusSubtitle.textContent = "Твой интернет не защищён";
            statusSmall.textContent = "Не подключено";

            statusDot.style.background = "#657080";
        }
    });

    // Подписка
    function openPlans() {
        showMessage(
            "💳 ТАРИФЫ\n\n" +
            "7 дней — 199 ₽\n" +
            "30 дней — 499 ₽\n" +
            "90 дней — 1199 ₽"
        );
    }

    // Профиль
    function openProfile() {

        const user = tg?.initDataUnsafe?.user;

        if (!user) {
            showMessage(
                "👤 ПРОФИЛЬ\n\n" +
                "Данные Telegram пока недоступны."
            );
            return;
        }

        showMessage(
            "👤 ПРОФИЛЬ\n\n" +
            "Имя: " +
            (user.first_name || "—") +
            "\n\nUsername: " +
            (user.username ? "@" + user.username : "—") +
            "\n\nID: " +
            user.id
        );
    }

    // Устройства
    function openDevices() {
        showMessage(
            "📱 УСТРОЙСТВА\n\n" +
            "Подключено: 0 / 3"
        );
    }

    // Рефералы
    function openReferrals() {
        showMessage(
            "🎁 РЕФЕРАЛЫ\n\n" +
            "Приглашай друзей и получай скидку."
        );
    }

    // Промокод
    function openPromo() {
        showMessage(
            "🎟 ПРОМОКОД\n\n" +
            "Функция промокодов будет добавлена позже."
        );
    }

    // Сервер
    serverSelect?.addEventListener("change", () => {

        const serverName =
            document.getElementById("serverName");

        const serverPing =
            document.getElementById("serverPing");

        if (!serverName || !serverPing) return;

        if (serverSelect.value === "germany") {
            serverName.textContent = "🇩🇪 Германия";
            serverPing.textContent = "38 ms";
        }

        if (serverSelect.value === "netherlands") {
            serverName.textContent = "🇳🇱 Нидерланды";
            serverPing.textContent = "42 ms";
        }

        if (serverSelect.value === "finland") {
            serverName.textContent = "🇫🇮 Финляндия";
            serverPing.textContent = "51 ms";
        }
    });

    // Кнопки
    plansButton?.addEventListener("click", openPlans);
    devicesButton?.addEventListener("click", openDevices);
    referralsButton?.addEventListener("click", openReferrals);
    promoButton?.addEventListener("click", openPromo);

    profileButton?.addEventListener("click", openProfile);
    plansNavButton?.addEventListener("click", openPlans);
    profileNavButton?.addEventListener("click", openProfile);

    console.log("VPN Mini App запущен");
});
```
