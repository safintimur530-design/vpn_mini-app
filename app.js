const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

const API_URL =
    "https://wheat-suspension-already-jenny.trycloudflare.com";

const user =
    tg?.initDataUnsafe?.user || null;


// =====================================================
// БАЗА
// =====================================================

function haptic() {
    try {
        tg?.HapticFeedback?.impactOccurred("light");
    } catch {}
}


function alertBox(text) {
    if (tg?.showAlert) {
        tg.showAlert(text);
    } else {
        alert(text);
    }
}


async function api(path, options = {}) {

    const headers = {
        "Content-Type": "application/json"
    };

    if (tg?.initData) {
        headers["X-Telegram-Init-Data"] = tg.initData;
    }

    const response = await fetch(
        API_URL + path,
        {
            ...options,
            headers: {
                ...headers,
                ...(options.headers || {})
            }
        }
    );

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("Сервер вернул неправильный ответ");
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Ошибка сервера"
        );
    }

    return data;
}


// =====================================================
// СТИЛИ ЭКРАНОВ
// =====================================================

const screenStyle = document.createElement("style");

screenStyle.textContent = `
.mountain-screen {
    position: fixed;
    inset: 0;
    z-index: 1000;

    background:
        radial-gradient(
            circle at 50% 0%,
            #19355d 0%,
            transparent 38%
        ),
        #070b12;

    color: white;

    padding:
        max(20px, env(safe-area-inset-top))
        18px
        max(20px, env(safe-area-inset-bottom));

    overflow-y: auto;
}

.screen-header {
    display: flex;
    align-items: center;
    gap: 12px;

    margin-bottom: 25px;
}

.back-button {
    width: 43px;
    height: 43px;

    border-radius: 14px;

    border: 1px solid rgba(255,255,255,.08);

    background: rgba(255,255,255,.07);

    color: white;

    font-size: 20px;
}

.screen-title {
    font-size: 23px;
    font-weight: 800;
}

.screen-subtitle {
    color: #7f8da3;
    font-size: 12px;
    margin-top: 3px;
}

.plan-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.plan-card {
    width: 100%;

    padding: 19px;

    border-radius: 21px;

    background:
        linear-gradient(
            145deg,
            rgba(25,40,63,.95),
            rgba(12,18,28,.96)
        );

    border:
        1px solid rgba(255,255,255,.08);

    color: white;

    text-align: left;

    transition: .18s;
}

.plan-card:active {
    transform: scale(.97);
}

.plan-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.plan-name {
    font-size: 17px;
    font-weight: 750;
}

.plan-price {
    font-size: 21px;
    font-weight: 800;
}

.plan-description {
    color: #7f8da3;
    font-size: 12px;
    margin-top: 8px;
}

.profile-box,
.referral-box,
.device-box {
    padding: 20px;

    border-radius: 22px;

    background:
        rgba(17,25,38,.92);

    border:
        1px solid rgba(255,255,255,.07);

    margin-bottom: 12px;
}

.profile-avatar {
    width: 70px;
    height: 70px;

    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 15px;

    background:
        linear-gradient(135deg,#397fff,#234fae);

    font-size: 29px;
}

.profile-name {
    font-size: 20px;
    font-weight: 800;
}

.profile-username {
    color: #718096;
    margin-top: 4px;
}

.info-row {
    display: flex;
    justify-content: space-between;

    padding: 13px 0;

    border-bottom:
        1px solid rgba(255,255,255,.06);

    font-size: 13px;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    color: #718096;
}

.info-value {
    font-weight: 700;
}

.referral-link {
    padding: 13px;

    border-radius: 13px;

    background: rgba(255,255,255,.05);

    color: #9ebcff;

    font-size: 12px;

    word-break: break-all;

    margin-top: 15px;
}

.primary-button {
    width: 100%;
    height: 53px;

    margin-top: 15px;

    border-radius: 16px;

    background:
        linear-gradient(135deg,#397fff,#235bd1);

    color: white;

    font-weight: 800;

    font-size: 13px;
}

.empty-state {
    text-align: center;

    padding: 50px 20px;

    color: #718096;
}

.loading {
    text-align: center;
    color: #718096;
    padding: 40px 0;
}
`;

document.head.appendChild(screenStyle);


// =====================================================
// ЭКРАН
// =====================================================

function createScreen(title, subtitle = "") {

    const screen =
        document.createElement("div");

    screen.className =
        "mountain-screen";

    screen.innerHTML = `
        <div class="screen-header">

            <button class="back-button">
                ‹
            </button>

            <div>
                <div class="screen-title">
                    ${title}
                </div>

                <div class="screen-subtitle">
                    ${subtitle}
                </div>
            </div>

        </div>

        <div class="screen-content"></div>
    `;

    screen
        .querySelector(".back-button")
        .addEventListener("click", () => {
            haptic();
            screen.remove();
        });

    document.body.appendChild(screen);

    return screen
        .querySelector(".screen-content");
}


// =====================================================
// ПОДПИСКА
// =====================================================

function openPlans() {

    haptic();

    const content =
        createScreen(
            "Подписка",
            "Выберите тариф Mountain VPN"
        );

    content.innerHTML = `
        <div class="plan-list">

            <button class="plan-card"
                    data-plan="month">

                <div class="plan-top">
                    <div class="plan-name">
                        1 месяц
                    </div>

                    <div class="plan-price">
                        150 ₽
                    </div>
                </div>

                <div class="plan-description">
                    Полный доступ к Mountain VPN
                </div>

            </button>


            <button class="plan-card"
                    data-plan="three_months">

                <div class="plan-top">
                    <div class="plan-name">
                        3 месяца
                    </div>

                    <div class="plan-price">
                        399 ₽
                    </div>
                </div>

                <div class="plan-description">
                    Полный доступ на 90 дней
                </div>

            </button>


            <button class="plan-card"
                    data-plan="six_months">

                <div class="plan-top">
                    <div class="plan-name">
                        6 месяцев
                    </div>

                    <div class="plan-price">
                        699 ₽
                    </div>
                </div>

                <div class="plan-description">
                    Полный доступ на 180 дней
                </div>

            </button>


            <button class="plan-card"
                    data-plan="year">

                <div class="plan-top">
                    <div class="plan-name">
                        12 месяцев
                    </div>

                    <div class="plan-price">
                        1100 ₽
                    </div>
                </div>

                <div class="plan-description">
                    Полный доступ на 365 дней
                </div>

            </button>

        </div>
    `;

    content
        .querySelectorAll(".plan-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                haptic();

                const plan =
                    card.dataset.plan;

                selectPlan(plan);
            });
        });
}


// =====================================================
// ВЫБОР ТАРИФА
// =====================================================

function selectPlan(plan) {

    const names = {
        month: "1 месяц",
        three_months: "3 месяца",
        six_months: "6 месяцев",
        year: "12 месяцев"
    };

    const prices = {
        month: 150,
        three_months: 399,
        six_months: 699,
        year: 1100
    };

    alertBox(
        "🏔️ Mountain VPN\n\n" +
        "Тариф: " + names[plan] + "\n" +
        "Цена: " + prices[plan] + " ₽\n\n" +
        "Следующим этапом подключим оплату."
    );
}


// =====================================================
// ПРОФИЛЬ
// =====================================================

async function openProfile() {

    haptic();

    const content =
        createScreen(
            "Профиль",
            "Ваш Mountain VPN"
        );

    content.innerHTML =
        `<div class="loading">Загрузка...</div>`;

    const name =
        user?.first_name ||
        "Пользователь";

    const username =
        user?.username
            ? "@" + user.username
            : "Не указан";

    content.innerHTML = `

        <div class="profile-box">

            <div class="profile-avatar">
                👤
            </div>

            <div class="profile-name">
                ${name}
            </div>

            <div class="profile-username">
                ${username}
            </div>

            <div class="info-row"
                 style="margin-top:20px">

                <span class="info-label">
                    Telegram ID
                </span>

                <span class="info-value">
                    ${user?.id || "—"}
                </span>

            </div>

            <div class="info-row">

                <span class="info-label">
                    Подписка
                </span>

                <span class="info-value">
                    Проверяем...
                </span>

            </div>

        </div>
    `;

    // Когда подключим точный backend endpoint,
    // сюда добавим реальное состояние подписки.
}


// =====================================================
// РЕФЕРАЛЫ
// =====================================================

function openReferrals() {

    haptic();

    const content =
        createScreen(
            "Рефералы",
            "Приглашайте друзей"
        );

    const id =
        user?.id || "unknown";

    const botUsername =
        "MountainVPN_bot";

    const link =
        `https://t.me/${botUsername}?start=ref_${id}`;

    content.innerHTML = `

        <div class="referral-box">

            <div style="font-size:32px">
                👥
            </div>

            <h2 style="margin-top:12px">
                Приглашайте друзей
            </h2>

            <p style="
                color:#718096;
                margin-top:8px;
                line-height:1.5;
                font-size:13px;
            ">
                Отправьте свою реферальную ссылку
                друзьям и получайте бонусы.
            </p>

            <div class="info-row"
                 style="margin-top:15px">

                <span class="info-label">
                    Приглашено
                </span>

                <span class="info-value">
                    0
                </span>

            </div>

            <div class="referral-link">
                ${link}
            </div>

            <button class="primary-button"
                    id="copyReferral">
                СКОПИРОВАТЬ ССЫЛКУ
            </button>

        </div>
    `;

    content
        .querySelector("#copyReferral")
        .addEventListener("click", async () => {

            try {

                await navigator.clipboard.writeText(link);

                haptic();

                alertBox(
                    "✅ Реферальная ссылка скопирована"
                );

            } catch {

                alertBox(link);
            }
        });
}


// =====================================================
// УСТРОЙСТВА
// =====================================================

function openDevices() {

    haptic();

    const content =
        createScreen(
            "Устройства",
            "Ваши подключения"
        );

    content.innerHTML = `

        <div class="device-box">

            <div style="font-size:32px">
                📱
            </div>

            <h2 style="margin-top:12px">
                Устройства
            </h2>

            <p style="
                color:#718096;
                margin-top:8px;
                line-height:1.5;
                font-size:13px;
            ">
                Здесь будут отображаться устройства,
                подключённые к Mountain VPN.
            </p>

            <div class="empty-state">
                Пока нет подключённых устройств
            </div>

        </div>
    `;
}


// =====================================================
// VPN
// =====================================================

let vpnConnected = false;

function connectVPN() {

    haptic();

    if (!vpnConnected) {

        vpnConnected = true;

        document.getElementById("statusText")
            .textContent =
            "VPN подключён";

        document.getElementById("connectionTitle")
            .textContent =
            "Соединение защищено";

        document.getElementById("connectionDescription")
            .innerHTML =
            "Mountain VPN активен<br>соединение защищено";

        document.getElementById("connectText")
            .textContent =
            "ОТКЛЮЧИТЬ";

        const dot =
            document.getElementById("statusDot");

        dot.style.background =
            "#35e27d";

        dot.style.boxShadow =
            "0 0 10px rgba(53,226,125,.7)";

        alertBox(
            "🏔️ Mountain VPN подключён"
        );

    } else {

        vpnConnected = false;

        document.getElementById("statusText")
            .textContent =
            "VPN отключён";

        document.getElementById("connectionTitle")
            .textContent =
            "Защищённое соединение";

        document.getElementById("connectionDescription")
            .innerHTML =
            "Подключитесь к VPN<br>" +
            "для безопасного доступа в интернет";

        document.getElementById("connectText")
            .textContent =
            "ПОДКЛЮЧИТЬ";

        const dot =
            document.getElementById("statusDot");

        dot.style.background =
            "#ff5364";

        dot.style.boxShadow =
            "0 0 10px rgba(255,83,100,.6)";

        alertBox(
            "Mountain VPN отключён"
        );
    }
}


// =====================================================
// КНОПКИ
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById("connectButton")
            ?.addEventListener(
                "click",
                connectVPN
            );

        document
            .getElementById("plansButton")
            ?.addEventListener(
                "click",
                openPlans
            );

        document
            .getElementById("referralsButton")
            ?.addEventListener(
                "click",
                openReferrals
            );

        document
            .getElementById("devicesButton")
            ?.addEventListener(
                "click",
                openDevices
            );

        document
            .getElementById("profileButton")
            ?.addEventListener(
                "click",
                openProfile
            );

        document
            .getElementById("profileCardButton")
            ?.addEventListener(
                "click",
                openProfile
            );

        console.log(
            "🏔️ Mountain VPN loaded"
        );
    }
);
