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

// Авторизация
async function login() {
    const result = await api("/api/auth", {
        method: "POST"
    });

    console.log("AUTH:", result);

    if (!result.success) {
        tg.showAlert("Ошибка авторизации: " + result.error);
        return;
    }

    tg.showAlert(
        "✅ Авторизация успешна!\n\n" +
        "ID: " + result.user.id + "\n" +
        "Имя: " + result.user.first_name
    );
}

// Запуск
login();
