```javascript
"use strict";

window.addEventListener("DOMContentLoaded", function () {

    alert("APP.JS РАБОТАЕТ");

    const plansButton = document.getElementById("plansButton");
    const connectButton = document.getElementById("connectButton");

    if (plansButton) {
        plansButton.addEventListener("click", function () {
            alert("КНОПКА ПОДПИСКА РАБОТАЕТ");
        });
    }

    if (connectButton) {
        connectButton.addEventListener("click", function () {
            alert("КНОПКА VPN РАБОТАЕТ");
        });
    }

});
```

