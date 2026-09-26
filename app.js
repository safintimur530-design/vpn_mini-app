```javascript
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const tg = window.Telegram?.WebApp || null;

    if (tg) {
        tg.ready();
        tg.expand();
    }


    function showMessage(text) {

        if (tg && typeof tg.showAlert === "function") {
            tg.showAlert(text);
        } else {
            alert(text);
        }

    }


    // =========================
    // ELEMENTS
    // =========================

    const connectButton =
        document.getElementById("connectButton");

    const plansButton =
        document.getElementById("plansButton");

    const devicesButton =
        document.getElementById("devicesButton");

    const referralsButton =
        document.getElementById("referralsButton");

    const promoButton =
        document.getElementById("promoButton");

    const profileButton =
        document.getElementById("profileButton");

    const plansNavButton =
        document.getElementById("plansNavButton");

    const profileNavButton =
        document.getElementById("profileNavButton");

    const homeButton =
        document.getElementById("homeButton");

    const serverSelect =
        document.getElementById("serverSelect");


    // =========================
    // VPN
    // =========================

    let connected = false;


    connectButton?.addEventListener("click", function () {

        connected = !connected;


        const statusCircle =
            document.getElementById("statusCircle");

        const statusTitle =
            document.getElementById("statusTitle");

        const statusSubtitle =
            document.getElementById("statusSubtitle");

        const statusSmall =
            document.getElementById("statusSmall");

        const statusDot =
            document.getElementById("statusDot");


        if (connected) {

            statusCircle?.classList.add("connected");

            connectButton.classList.add("connected");

            connectButton.textContent =
                "ОТКЛЮЧИТЬ";

            statusTitle.textContent =
                "VPN подключён";

            statusSubtitle.textContent =
                "Соединение защищено";

            statusSmall.textContent =
                "Подключено";

            statusDot.style.background =
                "#35d07f";

        } else {

            statusCircle?.classList.remove("connected");

            connectButton.classList.remove("connected");

            connectButton.textContent =
                "ПОДКЛЮЧИТЬ";

            statusTitle.textContent =
                "VPN отключён";

            statusSubtitle.textContent =
                "Твой интернет не защищён";

            statusSmall.textContent =
                "Не подключено";

            statusDot.style.background =
                "#657080";

        }

    });


    // =========================
    // PLANS
    // =========================

    plansButton?.addEventListener("click", function () {

        showMessage(
            "💳 ТАРИФЫ\n\n" +
            "7 дней — 99 ₽\n" +
            "30 дней — 299 ₽\n" +
            "90 дней — 799 ₽"
        );

    });


    plansNavButton?.addEventListener("click", function () {

        showMessage(
            "💳 ТАРИФЫ\n\n" +
            "7 дней — 99 ₽\n" +
            "30 дней — 299 ₽\n" +
            "90 дней — 799 ₽"
        );

    });


    // =========================
    // DEVICES
    // =========================

    devicesButton?.addEventListener("click", function () {

        showMessage(
            "📱 УСТРОЙСТВА\n\n" +
            "Подключено: 0 / 3"
        );

    });


    // =========================
    // REFERRALS
    // =========================

    referralsButton?.addEventListener("click", function () {

        showMessage(
            "🎁 РЕФЕРАЛЫ\n\n" +
            "Приглашай друзей и получай скидку."
        );

    });


    // =========================
    // PROMO
    // =========================

    promoButton?.addEventListener("click", function () {

        showMessage(
            "🎟 ПРОМОКОД\n\n" +
            "Функция промокодов будет добавлена позже."
        );

    });


    // =========================
    // PROFILE
    // =========================

    function openProfile() {

        const user =
            tg?.initDataUnsafe?.user;


        if (!user) {

            showMessage(
                "👤 ПРОФИЛЬ\n\n" +
                "Данные Telegram недоступны."
            );

            return;
        }


        const name =
            user.first_name || "Пользователь";


        const username =
            user.username
                ? "@" + user.username
                : "—";


        showMessage(
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


    profileButton?.addEventListener(
        "click",
        openProfile
    );


    profileNavButton?.addEventListener(
        "click",
        openProfile
    );


    // =========================
    // HOME
    // =========================

    homeButton?.addEventListener("click", function () {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


    // =========================
    // SERVERS
    // =========================

    serverSelect?.addEventListener("change", function () {

        const serverName =
            document.getElementById("serverName");

        const serverPing =
            document.getElementById("serverPing");


        if (!serverName || !serverPing) {
            return;
        }


        if (serverSelect.value === "germany") {

            serverName.textContent =
                "🇩🇪 Германия";

            serverPing.textContent =
                "38 ms";

        }


        if (serverSelect.value === "netherlands") {

            serverName.textContent =
                "🇳🇱 Нидерланды";

            serverPing.textContent =
                "42 ms";

        }


        if (serverSelect.value === "finland") {

            serverName.textContent =
                "🇫🇮 Финляндия";

            serverPing.textContent =
                "51 ms";

        }

    });


    console.log("Mountain VPN: APP READY");

});
```
