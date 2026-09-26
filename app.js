const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

async function api(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": tg.initData,
            ...(options.headers || {})
        }
    });

    return response.json();
}


// ================================
// АВТОРИЗАЦИЯ
// ================================

async function login() {

    const result = await api("/api/auth", {
        method: "POST"
    });

    if (!result.success) {
        tg.showAlert(
            "Ошибка авторизации: " + result.error
        );
        return;
    }

    console.log("Пользователь:", result.user);

    loadProfile();
}


// ================================
// ПРОФИЛЬ
// ================================

async function loadProfile() {

    const result = await api("/api/profile");

    if (!result.success) {
        return;
    }

    console.log("Профиль:", result);

    if (result.subscription) {
        console.log(
            "Подписка до:",
            new Date(
                result.subscription.expires_at * 1000
            )
        );
    }
}


// ================================
// РЕФЕРАЛЫ
// ================================

async function loadReferrals() {

    const result =
        await api("/api/referrals");

    if (!result.success) {
        tg.showAlert(
            "Не удалось загрузить рефералы"
        );
        return;
    }

    console.log("Реферальная ссылка:");
    console.log(result.referralLink);

    console.log(
        "Рефералов:",
        result.count
    );

    console.log(
        "Заработано:",
        result.totalReward
    );

    return result;
}


// ================================
// ПОДПИСКА
// ================================

async function loadSubscription() {

    const result =
        await api("/api/subscription");

    if (!result.success) {
        return;
    }

    if (!result.subscription) {
        console.log("Активной подписки нет");
        return;
    }

    const date = new Date(
        result.subscription.expires_at * 1000
    );

    console.log(
        "Подписка активна до:",
        date.toLocaleString()
    );
}


// ================================
// ТАРИФЫ
// ================================

async function loadPlans() {

    const result =
        await api("/api/plans");

    if (!result.success) {
        return;
    }

    console.log("Тарифы:", result.plans);
}


// ================================
// ЗАПУСК
// ================================

async function startApp() {

    console.log("🚀 Mini App запущен");

    await login();

    await loadReferrals();

    await loadSubscription();

    await loadPlans();
}

startApp();
