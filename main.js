"use strict";
const scrollLoadingMessages = document.querySelector(".container-scroll");
const token = getTokenFromCookie();
const socket = new WebSocket(`wss://edu.strada.one/websockets?${token}`);
const form = document.getElementById("input-form");
const formInput = document.querySelector(".message-textarea");
const messagesContainer = document.querySelector(".messenger");
console.log("f");
//fetching
async function fetchingDataMessages() {
    const token = getTokenFromCookie() ?? (popupEmail.style.display = "block");
    let messagesArrays = [];
    try {
        const response = await fetch("https://edu.strada.one/api/messages/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Ошибка при загрузке последних сообщений");
        }
        else {
            const data = await response.json();
            messagesArrays = data.messages;
            console.log(`История сообщений загружена в проект:`);
            return messagesArrays;
        }
    }
    catch (error) {
        console.log(error.message);
    }
}
async function getHistory() {
    const array = await fetchingDataMessages();
    console.log(array);
    mapDataArray(array);
    loadMessages();
    bottomMessageScroll("smooth");
}
//socket
function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ text: message }));
    }
    else if (socket.readyState != WebSocket.OPEN) {
        console.log("Соединение закрыто, пытаемся восстановить...");
        connectWebSocket();
        // socket.onopen = function () {
        //   socket.send(JSON.stringify({ text: message }));
        // };
    }
}
function connectWebSocket() {
    socket.onopen = function () {
        console.warn("Соединение установлено");
    };
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log("в вебсокет отработало событие onmessage:");
        try {
            const { name, email } = data.user;
            const text = data.text;
            const time = getTimeNow();
            const emailUserStorage = getEmailFromStorage();
            if (email === emailUserStorage) {
                createHTMLUser(text);
                console.log("сообщение от сокета:", text);
                bottomMessageScroll("smooth");
            }
            else if (email != emailUserStorage) {
                createHTMLBot(text, name, time);
                bottomMessageScroll("smooth");
            }
        }
        catch (error) {
            console.error("Ошибка при разборе JSON:", error, "Данные:", event.data);
        }
    };
    socket.onclose = function (event) {
        console.log("Соединение закрыто, код: " + event.code);
    };
    socket.onerror = function (error) {
        console.error("Ошибка WebSocket: " + error.message);
    };
}
//history
const chatHistoryArray = [];
const messagesPerLoad = 10;
const loadingMessage = document.getElementById("loading");
const endMessage = document.getElementById("endMessage");
const dateContainer = document.querySelector(".date-div");
let currentIndex;
let repeatCount = 10;
function mapDataArray(array) {
    const results = array
        .reverse()
        .map((item) => ({
        name: item.user.name,
        text: item.text,
        time: getTimeThen(item.createdAt),
        date: item.createdAt,
        email: item.user.email,
    }))
        .forEach((item) => {
        chatHistoryArray.push(item);
    });
    return results;
}
function loadMessages() {
    currentIndex = currentIndex ?? chatHistoryArray.length - 1;
    // loadingMessage.innerHTML = "block";
    if (currentIndex >= 0) {
        loadingMessage.style.display = "block";
        dateContainer.style.display = "none";
        const messagesToLoad = chatHistoryArray
            .slice(Math.max(0, currentIndex - messagesPerLoad + 1), currentIndex + 1)
            .reverse();
        console.log(`${repeatCount} последних сообщений прорисованы в интерфейсе`, messagesToLoad);
        messagesToLoad.forEach((msg) => {
            createHTMLBot(msg.text, msg.name, msg.time, msg.date);
        });
        if (currentIndex < 0) {
            endMessage.style.display = "block";
        }
        else {
            loadingMessage.style.display = "none";
            dateContainer.style.display = "block";
        }
    }
    repeatCount += 10;
    return (currentIndex -= messagesPerLoad);
}
function setDataDynamic() {
    const plates = document.querySelectorAll(".plate");
    const dataPlate = document.querySelector(".date-hidden");
    plates.forEach((message) => {
        const messageRect = message.getBoundingClientRect();
        const containerRect = scrollLoadingMessages.getBoundingClientRect();
        const messageTop = messageRect.top - containerRect.top;
        const messageBottom = messageTop + messageRect.height;
        if (messageTop <= 10 && messageBottom >= 10) {
            const date = message.lastElementChild.innerHTML;
            dataPlate.textContent = getDateThen(date);
        }
    });
}
//scroll
function bottomMessageScroll(b) {
    const plates = document.querySelectorAll(".plate");
    const firstChild = plates[plates.length - 1];
    if (!firstChild)
        return;
    firstChild.scrollIntoView({
        behavior: b || "auto",
        block: "end",
    });
}
//utilits
function saveTokenCookie(token) {
    document.cookie = `Authorization=${token}; path=/;`;
}
function getTokenFromCookie() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; Authorization=`);
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
    return null;
}
function setEmailFromStorage(email) {
    localStorage.setItem("email", email);
}
function getEmailFromStorage() {
    let email = localStorage.getItem("email");
    return email;
}
function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}
function getTimeNow() {
    const date = new Date();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const time = `${hours}:${minutes}`;
    return time;
}
function getTimeThen(date) {
    const dateTime = new Date(date);
    const hours = String(dateTime.getUTCHours()).padStart(2, "0");
    const minutes = String(dateTime.getUTCMinutes()).padStart(2, "0");
    const time = `${hours}:${minutes}`;
    return time;
}
function getDateThen(date) {
    const dateNow = new Date();
    const yearNow = dateNow.getFullYear();
    const dateFull = new Date(date);
    const year = dateFull.getFullYear();
    const month = dateFull.getMonth();
    const monthArray = [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
    ];
    const monthName = monthArray[month];
    const day = dateFull.getDate();
    const dayOfWeek = dateFull.getDay();
    const daysOfWeek = [
        "воскресенье",
        "понедельник",
        "вторник",
        "среда",
        "четверг",
        "пятница",
        "суббота",
    ];
    const dayName = daysOfWeek[dayOfWeek];
    if (year === yearNow) {
        return `${day} ${monthName}, ${dayName}`;
    }
    else {
        return `${day} ${monthName}, ${year}`;
    }
}
//createHTML
const colors = [
    "#011a4b",
    "#618f98",
    "#ad473f",
    "#ad473f",
    "#0084b9",
    "#423227",
    "#e78f08",
];
const templateUser = document.getElementById("message-user");
const templateBot = document.getElementById("message-bot");
function createHTMLUser(text) {
    const template = templateUser.content.cloneNode(true);
    const sender = template.getElementById("user-name");
    const messageElement = template.getElementById("textTemplateUser");
    const timeDiv = template.getElementById("timeTemplate");
    sender.textContent = "Вы";
    messageElement.textContent = text;
    timeDiv.textContent = getTimeNow();
    sender.classList.add("name-user");
    timeDiv.classList.add("time");
    messagesContainer.appendChild(template);
}
function createHTMLBot(text, name, time, date) {
    const template = templateBot.content.cloneNode(true);
    const sender = template.getElementById("bot-name");
    const messageElement = template.getElementById("textTemplateBot");
    const timeDiv = template.getElementById("timeTemplate");
    const dateHidden = template.querySelector(".date-hidden");
    sender.textContent = `${name}`;
    sender.style.color = getRandomColor();
    messageElement.textContent = text;
    timeDiv.textContent = time;
    dateHidden.textContent = date;
    sender.classList.add("name-bot");
    timeDiv.classList.add("time");
    messagesContainer.prepend(template);
}
function createHTMLDate(date) {
    const datePlate = document.createElement("p");
    datePlate.setAttribute("class", "date-plate");
    datePlate.textContent = getDateThen(date);
    dateContainer.appendChild(datePlate);
}
//popup-name
const popup = document.getElementById("popup-name");
const openPopupButton = document.querySelector(".setting-button");
const closePopupButton = document.getElementById("close-popup-name");
const nameInput = document.querySelector("#name-input");
const sendButton = document.querySelector("#name-popup-button");
openPopupButton.onclick = function () {
    popup.style.display = "block";
};
closePopupButton.onclick = function () {
    popup.style.display = "none";
};
sendButton.onclick = function () {
    let newName = nameInput.value;
    updateUserName(newName);
    popup.style.display = "none";
};
async function updateUserName(newName) {
    const token = getTokenFromCookie();
    if (!token) {
        console.error("Нет токена авторизации");
        return;
    }
    const response = await fetch("https://edu.strada.one/api/user", {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
    });
    if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Ошибка при обновлении имени:", errorMessage);
    }
    else {
        console.log("Имя успешно обновлено");
    }
}
//popup-email
const popupEmail = document.getElementById("popup-email");
const closePopupButtonEmail = document.getElementById("close-popup-email");
const codePopup = document.getElementById("popup-code");
const getCodeButton = document.querySelector("#get-code-button");
closePopupButtonEmail.onclick = function () {
    popupEmail.style.display = "none";
};
window.onclick = function (event) {
    if (event.target == popup ||
        event.target == popupEmail ||
        event.target == codePopup) {
        popup.style.display = "none";
        popupEmail.style.display = "none";
        codePopup.style.display = "none";
    }
};
getCodeButton.addEventListener("click", async () => {
    const email = document.querySelector("#email-input").value;
    const endpoint = "https://edu.strada.one/api/user";
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
        });
        if (!response.ok) {
            throw new Error("Ошибка при отправке email");
        }
        else {
            console.log("Код отправлен");
            setEmailFromStorage(email);
            popupEmail.style.display = "none";
            codePopup.style.display = "block";
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
const openPopupButtonCode = document.querySelector(".button");
const closeCodeButton = document.getElementById("close-popup-code");
const popupCode = document.getElementById("popup-code");
const sendCodeButton = document.querySelector("#send-code-button");
openPopupButtonCode.onclick = function () {
    popupCode.style.display = "block";
};
closeCodeButton.onclick = function () {
    popupCode.style.display = "none";
};
sendCodeButton.addEventListener("click", () => {
    const token = document.querySelector("#code-input").value;
    saveTokenCookie(token);
    getHistory();
    popupCode.style.display = "none";
    popupEmail.style.display = "none";
});
//onload
window.onload = function () {
    if (!document.cookie
        .split(";")
        .some((c) => c.trim().startsWith("Authorization" + "="))) {
        popupEmail.style.display = "block";
    }
    getHistory();
    connectWebSocket();
};
let hasScrolled = false;
let hasScrolledToTop = false;
scrollLoadingMessages.addEventListener("scroll", function () {
    // dateContainer.style.display = "none";
    // loadingMessage.style.display = "block";
    setDataDynamic();
    setTimeout(() => {
        if (!hasScrolledToTop && scrollLoadingMessages.scrollTop === 0) {
            hasScrolledToTop = true;
            loadMessages();
        }
    }, 1000);
    if (scrollLoadingMessages.scrollTop <= 0) {
        hasScrolledToTop = false;
    }
    // loadingMessage.style.display = "none";
    // dateContainer.style.display = "block";
});
form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (formInput.value === "")
        return;
    const message = formInput.value.trim();
    sendMessage(message);
    formInput.value = "";
});
formInput.addEventListener("blur", () => {
    if (formInput.value.trim() === "") {
        formInput.classList.add("empty");
    }
    else {
        formInput.classList.remove("empty");
    }
});
//# sourceMappingURL=main.js.map