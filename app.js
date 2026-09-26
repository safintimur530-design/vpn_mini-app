const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

let currentUser = null;
let connected = false;


// ================================
// API
// ================================

async function api(url, options = {}) {

    try {

        const response = await fetch(url, {
            ...options,

            headers: {
                "Content-Type": "application/json",
                "X-Telegram-Init-Data": tg.initData,
                ...(options.headers || {})
            }
        });

        return await response.json();

    } catch (error) {

        console.error("API ERROR:", error);

        tg.showAlert(
            "❌ Не удалось подключиться к серверу"
        );

        return {
            success: false
        };
    }
}


// ================================
// AUTH
// ================================

async function login() {

    const result = await api("/api/auth", {
        method: "POST"
    });

    console.log("AUTH:", result);

    if (!result.success) {

        tg.showAlert(
            "❌ Ошибка авторизации\n\n" +
            result.error
        );

        return;
    }

    currentUser = result.user;

    await loadProfile();

    console.log("✅ Пользователь авторизован");
}


// ================================
// PROFILE
// ================================

async function loadProfile() {

    const result = await api("/api/profile");

    if (!result.success) {
        return;
    }

    currentUser = result.user;

    console.log("PROFILE:", result);

    const subscription = result.subscription;

    const subscriptionElement =
        document.querySelector(".info-item strong");

    if (subscriptionElement) {

        if (subscription) {

            const date = new Date(
                subscription.expires_at * 1000
            );

            subscriptionElement.textContent =
                "Активна до " +
                date.toLocaleDateString("ru-RU");

        } else {

            subscriptionElement.textContent =
                "Не активна";
        }
    }
}


// ================================
// VPN
// ================================

function connectVPN() {

    if (!currentUser) {

        tg.showAlert(
            "⏳ Загружаем профиль..."
        );

        return;
    }

    if (connected) {

        connected = false;

        updateVPNStatus(false);

        return;
    }

    tg.showConfirm(
        "🔐 Подключить VPN?\n\n" +
        "Сейчас будет создано VPN-соединение.",
        function (confirmed) {

            if (!confirmed) {
                return;
            }

            /*
             * Пока здесь демонстрационное подключение.
             *
             * Настоящий WireGuard подключим
             * на следующем этапе.
             */

            connected = true;

            updateVPNStatus(true);
        }
    );
}


// ================================
// VPN STATUS
// ================================

function updateVPNStatus(isConnected) {

    const title =
        document.getElementById("statusTitle");

    const subtitle =
        document.getElementById("statusSubtitle");

    const button =
        document.querySelector(".connect-button");

    const circle =
        document.getElementById("statusCircle");


    if (isConnected) {

        if (title) {
            title.textContent = "VPN подключён";
        }

        if (subtitle) {
            subtitle.textContent =
                "Ваше соединение защищено";
        }

        if (button) {
            button.textContent = "ОТКЛЮЧИТЬ";
        }

        if (circle) {
            circle.classList.add("connected");
        }

    } else {

        if (title) {
            title.textContent = "VPN отключён";
        }

        if (subtitle) {
            subtitle.textContent =
                "Нажми, чтобы подключиться";
        }

        if (button) {
            button.textContent = "ПОДКЛЮЧИТЬ";
        }

        if (circle) {
            circle.classList.remove("connected");
        }
    }
}


// ================================
// SERVERS
// ================================

function changeServer() {

    const select =
        document.getElementById("serverSelect");

    const serverName =
        document.getElementById("serverName");

    const serverPing =
        document.getElementById("serverPing");


    if (!select) {
        return;
    }


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


    if (!server) {
        return;
    }


    if (serverName) {
        serverName.textContent =
            server.name;
    }

    if (serverPing) {
        serverPing.textContent =
            server.ping;
    }
}


// ================================
// PLANS
// ================================

async function openPlans() {

    const result =
        await api("/api/plans");

    if (!result.success) {
        return;
    }


    const plans = result.plans;


    let text =
        "💳 ТАРИФЫ\n\n";


    text +=
        `7 дней — ${plans.week.price} ₽\n`;

    text +=
        `30 дней — ${plans.month.price} ₽\n`;

    text +=
        `90 дней — ${plans.three_months.price} ₽\n\n`;

    text +=
        "Выбери тариф для покупки.";


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
                type: "cancel"
            }
        ]

    }, function (buttonId) {

        if (!buttonId) {
            return;
        }

        createPayment(buttonId);
    });
}


// ================================
// PAYMENT
// ================================

async function createPayment(plan) {

    const result =
        await api("/api/payment/create", {

            method: "POST",

            body: JSON.stringify({
                plan
            })
        });


    if (!result.success) {

        tg.showAlert(
            "❌ Не удалось создать оплату"
        );

        return;
    }


    tg.showAlert(

        "💳 Заказ создан!\n\n" +

        "Тариф: " +
        result.plan +
        "\n\n" +

        "Сумма: " +
        result.amount +
        " ₽\n\n" +

        "ID платежа: " +
        result.paymentId
    );
}


// ================================
// REFERRALS
// ================================

async function openReferrals() {

    const result =
        await api("/api/referrals");


    if (!result.success) {
        return;
    }


    tg.showPopup({

        title: "🎁 Реферальная программа",

        message:

            "Приглашай друзей и получай бонусы.\n\n" +

            "👥 Приглашено: " +
            result.count +
            "\n\n" +

            "💰 Заработано: " +
            result.totalReward +
            " ₽\n\n" +

            "🔗 Твоя ссылка:\n" +
            result.referralLink,

        buttons: [

            {
                id: "copy",
                type: "default",
                text: "Скопировать"
            },

            {
                type: "close"
            }
        ]

    }, function (buttonId) {

        if (buttonId === "copy") {

            navigator.clipboard
                .writeText(result.referralLink)
                .then(() => {

                    tg.showAlert(
                        "✅ Ссылка скопирована!"
                    );

                })
                .catch(() => {

                    tg.showAlert(
                        result.referralLink
                    );
                });
        }
    });
}


// ================================
// PROFILE WINDOW
// ================================

async function openProfile() {

    const result =
        await api("/api/profile");


    if (!result.success) {
        return;
    }


    const user =
        result.user;


    let text =
        "👤 ПРОФИЛЬ\n\n";


    text +=
        "Имя: " +
        (user.first_name || "—") +
        "\n";


    text +=
        "ID: " +
        user.id +
        "\n";


    text +=
        "Баланс: " +
        user.balance +
        " ₽\n\n";


    if (result.subscription) {

        const date =
            new Date(
                result.subscription.expires_at * 1000
            );

        text +=
            "💎 Подписка: активна\n";

        text +=
            "До: " +
            date.toLocaleDateString("ru-RU");

    } else {

        text +=
            "💎 Подписка: не активна";
    }


    tg.showAlert(text);
}


// ================================
// DEVICES
// ================================

function openDevices() {

    tg.showAlert(

        "📱 Устройства\n\n" +

        "Подключено: 0 / 3\n\n" +

        "Управление устройствами\n" +
        "подключим после WireGuard."
    );
}


// ================================
// PROMO
// ================================

function openPromo() {

    tg.showPopup({

        title: "🎟 Промокод",

        message: "Введи промокод:",

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

    }, function (buttonId) {

        if (buttonId === "enter") {

            tg.showAlert(
                "🎟 Система промокодов будет подключена следующим этапом."
            );
        }
    });
}


// ================================
// START
// ================================

async function startApp() {

    console.log("🚀 VPN Mini App");

    await login();

    console.log(
        "✅ Mini App готов"
    );
}


startApp();
console.log("🔥 НОВАЯ ВЕРСИЯ APP.JS ЗАГРУЖЕНА");
