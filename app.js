const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

function connectVPN() {
    tg.showAlert(
        "🔐 VPN пока не подключён.\n\nСначала подключим сервер WireGuard."
    );
}

function openPlans() {
    tg.showAlert(
        "💳 Тарифы:\n\n" +
        "1 месяц — 150 ₽\n" +
        "3 месяца — 399 ₽\n" +
        "6 месяцев — 699 ₽\n" +
        "12 месяцев — 1100 ₽"
    );
}

function openProfile() {
    tg.showAlert(
        "👤 Профиль\n\n" +
        "Подписка: не активна\n" +
        "Устройства: 0 / 3\n" +
        "Скидка: 0%"
    );
}

function openDevices() {
    tg.showAlert(
        "📱 Устройства\n\n" +
        "Пока подключённых устройств нет."
    );
}

function openReferrals() {
    tg.showAlert(
        "🎁 Реферальная система\n\n" +
        "За каждого приглашённого пользователя ты получаешь 2% скидки.\n\n" +
        "Твоя скидка: 0%"
    );
}

function openPromo() {
    tg.showAlert(
        "🎟 Промокод\n\n" +
        "Ввод промокода будет доступен после подключения бота."
    );
}
