require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("database.db");

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);

// ================================
// ПРОВЕРКА НАСТРОЕК
// ================================

if (!BOT_TOKEN) {
    console.error("❌ BOT_TOKEN не указан в .env");
    process.exit(1);
}

if (!ADMIN_ID) {
    console.error("❌ ADMIN_ID не указан в .env");
    process.exit(1);
}

// ================================
// БАЗА ДАННЫХ
// ================================

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    referrer_id INTEGER,
    balance INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_login INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_id INTEGER NOT NULL,
    referred_id INTEGER UNIQUE NOT NULL,
    reward INTEGER DEFAULT 0,
    paid INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at INTEGER NOT NULL
);
`);

// ================================
// TELEGRAM AUTH
// ================================

function verifyTelegram(initData) {

    if (!initData) {
        throw new Error("Нет Telegram initData");
    }

    const params = new URLSearchParams(initData);

    const receivedHash = params.get("hash");

    if (!receivedHash) {
        throw new Error("Нет hash");
    }

    params.delete("hash");

    const dataCheckString = [...params.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    const secretKey = crypto
        .createHmac("sha256", "WebAppData")
        .update(BOT_TOKEN)
        .digest();

    const calculatedHash = crypto
        .createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

    if (receivedHash.length !== calculatedHash.length) {
        throw new Error("Неверная подпись");
    }

    if (
        !crypto.timingSafeEqual(
            Buffer.from(receivedHash, "hex"),
            Buffer.from(calculatedHash, "hex")
        )
    ) {
        throw new Error("Неверная подпись Telegram");
    }

    const authDate = Number(params.get("auth_date"));

    if (!authDate) {
        throw new Error("Нет auth_date");
    }

    // initData действителен максимум 24 часа
    if (Math.floor(Date.now() / 1000) - authDate > 86400) {
        throw new Error("Telegram-сессия устарела");
    }

    const userData = params.get("user");

    if (!userData) {
        throw new Error("Пользователь не найден");
    }

    return {
        user: JSON.parse(userData),
        startParam: params.get("start_param")
    };
}

// ================================
// AUTH MIDDLEWARE
// ================================

function auth(req, res, next) {

    try {

        const initData =
            req.headers["x-telegram-init-data"];

        const data = verifyTelegram(initData);

        req.telegramUser = data.user;
        req.startParam = data.startParam;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            error: error.message
        });
    }
}

// ================================
// ADMIN MIDDLEWARE
// ================================

function admin(req, res, next) {

    if (!req.telegramUser) {
        return res.status(401).json({
            success: false,
            error: "Не авторизован"
        });
    }

    if (Number(req.telegramUser.id) !== ADMIN_ID) {

        return res.status(403).json({
            success: false,
            error: "Доступ запрещён"
        });
    }

    next();
}

// ================================
// СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ
// ================================

function createUser(user, startParam) {

    const now = Math.floor(Date.now() / 1000);

    let existing = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(user.id);

    if (existing) {

        db.prepare(`
            UPDATE users
            SET username = ?,
                first_name = ?,
                last_login = ?
            WHERE id = ?
        `).run(
            user.username || null,
            user.first_name || "",
            now,
            user.id
        );

        return existing;
    }

    let referrerId = null;

    // ================================
    // РЕФЕРАЛ
    // ================================

    if (
        startParam &&
        startParam.startsWith("ref_")
    ) {

        const id = Number(
            startParam.substring(4)
        );

        if (
            Number.isInteger(id) &&
            id !== Number(user.id)
        ) {

            const referrer = db
                .prepare(
                    "SELECT id FROM users WHERE id = ?"
                )
                .get(id);

            if (referrer) {
                referrerId = id;
            }
        }
    }

    db.prepare(`
        INSERT INTO users (
            id,
            username,
            first_name,
            referrer_id,
            balance,
            created_at,
            last_login
        )
        VALUES (?, ?, ?, ?, 0, ?, ?)
    `).run(
        user.id,
        user.username || null,
        user.first_name || "",
        referrerId,
        now,
        now
    );

    // ================================
    // СОЗДАЁМ РЕФЕРАЛЬНУЮ ЗАПИСЬ
    // ================================

    if (referrerId) {

        db.prepare(`
            INSERT OR IGNORE INTO referrals (
                referrer_id,
                referred_id,
                reward,
                paid,
                created_at
            )
            VALUES (?, ?, 0, 0, ?)
        `).run(
            referrerId,
            user.id,
            now
        );
    }

    return db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(user.id);
}

// ================================
// LOGIN
// ================================

app.post("/api/auth", auth, (req, res) => {

    try {

        const user = createUser(
            req.telegramUser,
            req.startParam
        );

        res.json({
            success: true,

            user: {
                id: user.id,
                username: user.username,
                first_name: user.first_name
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: "Ошибка создания пользователя"
        });
    }
});

// ================================
// ПРОФИЛЬ
// ================================

app.get("/api/profile", auth, (req, res) => {

    const user = db
        .prepare(
            "SELECT * FROM users WHERE id = ?"
        )
        .get(req.telegramUser.id);

    const now = Math.floor(Date.now() / 1000);

    const subscription = db
        .prepare(`
            SELECT *
            FROM subscriptions
            WHERE user_id = ?
            AND status = 'active'
            AND expires_at > ?
            ORDER BY expires_at DESC
            LIMIT 1
        `)
        .get(
            req.telegramUser.id,
            now
        );

    res.json({
        success: true,

        user: {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            balance: user.balance
        },

        subscription: subscription || null
    });
});

// ================================
// РЕФЕРАЛЫ
// ================================

app.get("/api/referrals", auth, (req, res) => {

    const userId = req.telegramUser.id;

    const referrals = db
        .prepare(`
            SELECT
                r.referred_id,
                r.reward,
                r.paid,
                r.created_at,
                u.username,
                u.first_name
            FROM referrals r
            JOIN users u
            ON u.id = r.referred_id
            WHERE r.referrer_id = ?
            ORDER BY r.created_at DESC
        `)
        .all(userId);

    const totalReward = referrals.reduce(
        (sum, item) => sum + item.reward,
        0
    );

    const BOT_USERNAME =
        process.env.BOT_USERNAME || "YOUR_BOT_USERNAME";

    const referralLink =
        `https://t.me/${BOT_USERNAME}?start=ref_${userId}`;

    res.json({

        success: true,

        referralLink,

        count: referrals.length,

        totalReward,

        referrals
    });
});

// ================================
// ТАРИФЫ
// ================================

const PLANS = {

    week: {
        name: "7 дней",
        price: 199,
        days: 7
    },

    month: {
        name: "30 дней",
        price: 499,
        days: 30
    },

    three_months: {
        name: "90 дней",
        price: 1199,
        days: 90
    }
};

// ================================
// ПОЛУЧИТЬ ТАРИФЫ
// ================================

app.get("/api/plans", (req, res) => {

    res.json({
        success: true,
        plans: PLANS
    });
});

// ================================
// СОЗДАНИЕ ПЛАТЕЖА
// ================================

app.post(
    "/api/payment/create",
    auth,
    (req, res) => {

        const { plan } = req.body;

        if (!PLANS[plan]) {

            return res.status(400).json({
                success: false,
                error: "Тариф не найден"
            });
        }

        const payment = db
            .prepare(`
                INSERT INTO payments (
                    user_id,
                    plan,
                    amount,
                    status,
                    created_at
                )
                VALUES (?, ?, ?, 'pending', ?)
            `)
            .run(
                req.telegramUser.id,
                plan,
                PLANS[plan].price,
                Math.floor(Date.now() / 1000)
            );

        res.json({

            success: true,

            paymentId:
                payment.lastInsertRowid,

            plan,

            amount:
                PLANS[plan].price
        });
    }
);

// ================================
// ПОДПИСКА
// ================================

app.get(
    "/api/subscription",
    auth,
    (req, res) => {

        const now =
            Math.floor(Date.now() / 1000);

        const subscription = db
            .prepare(`
                SELECT *
                FROM subscriptions
                WHERE user_id = ?
                AND status = 'active'
                AND expires_at > ?
                ORDER BY expires_at DESC
                LIMIT 1
            `)
            .get(
                req.telegramUser.id,
                now
            );

        res.json({
            success: true,
            subscription:
                subscription || null
        });
    }
);

// ================================
// АДМИН: СТАТИСТИКА
// ================================

app.get(
    "/api/admin/stats",
    auth,
    admin,
    (req, res) => {

        const now =
            Math.floor(Date.now() / 1000);

        const users = db
            .prepare(
                "SELECT COUNT(*) AS count FROM users"
            )
            .get().count;

        const activeSubscriptions = db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM subscriptions
                WHERE status = 'active'
                AND expires_at > ?
            `)
            .get(now).count;

        const payments = db
            .prepare(`
                SELECT
                    COUNT(*) AS count,
                    COALESCE(SUM(amount), 0) AS revenue
                FROM payments
                WHERE status = 'paid'
            `)
            .get();

        const referrals = db
            .prepare(
                "SELECT COUNT(*) AS count FROM referrals"
            )
            .get().count;

        res.json({

            success: true,

            users,

            activeSubscriptions,

            referrals,

            payments: payments.count,

            revenue: payments.revenue
        });
    }
);

// ================================
// АДМИН: ПОЛЬЗОВАТЕЛИ
// ================================

app.get(
    "/api/admin/users",
    auth,
    admin,
    (req, res) => {

        const users = db
            .prepare(`
                SELECT
                    id,
                    username,
                    first_name,
                    balance,
                    referrer_id,
                    created_at,
                    last_login
                FROM users
                ORDER BY created_at DESC
                LIMIT 200
            `)
            .all();

        res.json({
            success: true,
            users
        });
    }
);

// ================================
// АДМИН: ВЫДАТЬ ПОДПИСКУ
// ================================

app.post(
    "/api/admin/give-subscription",
    auth,
    admin,
    (req, res) => {

        const userId =
            Number(req.body.userId);

        const days =
            Number(req.body.days);

        if (
            !Number.isInteger(userId) ||
            !Number.isInteger(days) ||
            days <= 0 ||
            days > 3650
        ) {

            return res.status(400).json({
                success: false,
                error: "Некорректные данные"
            });
        }

        const user = db
            .prepare(
                "SELECT id FROM users WHERE id = ?"
            )
            .get(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                error: "Пользователь не найден"
            });
        }

        const now =
            Math.floor(Date.now() / 1000);

        const current = db
            .prepare(`
                SELECT expires_at
                FROM subscriptions
                WHERE user_id = ?
                AND status = 'active'
                AND expires_at > ?
                ORDER BY expires_at DESC
                LIMIT 1
            `)
            .get(userId, now);

        const start =
            current
                ? current.expires_at
                : now;

        const expires =
            start + days * 86400;

        db.prepare(`
            INSERT INTO subscriptions (
                user_id,
                plan,
                expires_at,
                status,
                created_at
            )
            VALUES (?, 'admin', ?, 'active', ?)
        `).run(
            userId,
            expires,
            now
        );

        res.json({
            success: true,
            expires_at: expires
        });
    }
);

// ================================
// АДМИН: ИЗМЕНИТЬ БАЛАНС
// ================================

app.post(
    "/api/admin/balance",
    auth,
    admin,
    (req, res) => {

        const userId =
            Number(req.body.userId);

        const amount =
            Number(req.body.amount);

        if (
            !Number.isInteger(userId) ||
            !Number.isInteger(amount)
        ) {

            return res.status(400).json({
                success: false,
                error: "Некорректные данные"
            });
        }

        const user = db
            .prepare(
                "SELECT id FROM users WHERE id = ?"
            )
            .get(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                error: "Пользователь не найден"
            });
        }

        db.prepare(`
            UPDATE users
            SET balance = balance + ?
            WHERE id = ?
        `).run(
            amount,
            userId
        );

        res.json({
            success: true
        });
    }
);

// ================================
// АДМИН: ПОЛУЧИТЬ ПЛАТЕЖИ
// ================================

app.get(
    "/api/admin/payments",
    auth,
    admin,
    (req, res) => {

        const payments = db
            .prepare(`
                SELECT *
                FROM payments
                ORDER BY created_at DESC
                LIMIT 200
            `)
            .all();

        res.json({
            success: true,
            payments
        });
    }
);

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        status: "online",
        time: Date.now()
    });
});

// ================================
// ЗАПУСК
// ================================

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("       VPN SERVER ONLINE");
    console.log("================================");
    console.log("");
    console.log(`Порт: ${PORT}`);
    console.log("Telegram Auth: OK");
    console.log("Referrals: OK");
    console.log("Subscriptions: OK");
    console.log("Admin: OK");
    console.log("");
});
