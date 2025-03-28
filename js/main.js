import { popupEmail } from "./popup-email";

const scrollLoadingMessages = document.querySelector(".container-scroll");
const token = getTokenFromCookie();
const socket = new WebSocket(`wss://edu.strada.one/websockets?${token}`);
const form = document.getElementById("input-form");
const formInput = document.querySelector(".message-textarea");
const loadingMessage = document.getElementById("loading");
const endMessage = document.getElementById("endMessage");
const messagesPerLoad = 10;
const colors = [
  "#011a4b",
  "#618f98",
  "#ad473f",
  "#ad473f",
  "#0084b9",
  "#423227",
  "#e78f08",
];
const chatHistoryArray = [];
const templateUser = document.getElementById("message-user");
const templateBot = document.getElementById("message-bot");
const messagesContainer = document.querySelector(".messenger");
const dateContainer = document.querySelector(".date-div");
const plate = document.querySelectorAll(".plate");
const dateMessage = document.querySelector(".date-hidden");


export async function fetchingDataMessages() {
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
    } else {
      const data = await response.json();
      messagesArrays = data.messages;
      return messagesArrays;
    }
  } catch (error) {
    console.log(error.message);
  }
}

export function mapDataArray(array) {
  const results = array.reverse().map((item) => ({
    name: item.user.name,
    text: item.text,
    time: getTimeThen(item.createdAt),
    date: item.createdAt,
    email: item.user.email,
  }));
  results.forEach((item) => {
    chatHistoryArray.push(item);
  });
  return results;
}

export async function getHistory() {
  console.log("getHistory сработал при загрузке страницы");
  const array = await fetchingDataMessages();
  mapDataArray(array);
  loadMessages();
  bottomMessageScroll("smooth");
}

export function loadMessages() {
  let currentIndex = chatHistoryArray.length - 1; 
  loadingMessage.style.display = "block";
  dateContainer.style.display = "none";
  if (currentIndex >= 0) {
    const messagesToLoad = chatHistoryArray.slice(
      Math.max(0, currentIndex - messagesPerLoad + 1), 
      currentIndex + 1 
    );
    messagesToLoad.forEach((msg) => {
      createHTMLBot(msg.text, msg.name, msg.time, msg.date);
    });
    currentIndex -= messagesPerLoad;
    if (currentIndex < 0) {
      endMessage.style.display = "block";
    }
    loadingMessage.style.display = "none";
    dateContainer.style.display = "block";
  }

  plate.forEach((message) => {
    console.log(message);
    const rect = message.getBoundingClientRect();
    const chatRect = messagesContainer.getBoundingClientRect();
    if (rect.top <= chatRect.top && rect.bottom >= chatRect.bottom) {
      createHTMLDate(date);
    }
  });
}

export function topMessageScroll(b) {
  const t = document.querySelector(".scroll-target-top");
  if (!t) return;
  t.scrollIntoView({
    behavior: b || "auto",
    block: "start",
  });
}

export function bottomMessageScroll(b) {
  const e = document.querySelector(".scroll-target-bottom");
  if (!e) return;
  e.scrollIntoView({
    behavior: b || "auto",
    block: "end",
  });
}

export function saveTokenCookie(token) {
  document.cookie = `Authorization=${token}; path=/;`;
}

export function getTokenFromCookie() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; Authorization=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

export function setEmailFromStorage(email) {
  localStorage.setItem("email", email);
}

export function getEmailFromStorage() {
  let email = localStorage.getItem("email");
  return email;
}

export function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

export function getTimeNow() {
  const date = new Date();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;
  return time;
}

export function getTimeThen(date) {
  const dateTime = new Date(date);
  const hours = String(dateTime.getUTCHours()).padStart(2, "0");
  const minutes = String(dateTime.getUTCMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;
  return time;
}

export function getDateThen(date) {
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
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  const dayName = daysOfWeek[dayOfWeek];
  if (year === Number(2025) && month === Number(2)) {
    return `${day}, ${dayName}`;
  }
  return `${day}, ${monthName}, ${year}`;
}

export function createHTMLUser(text) {
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

export function createHTMLBot(text, name, time, date) {
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
  timeDiv.setAttribute('data-date', date)
  messagesContainer.appendChild(template);
}

export function createHTMLDate(date) {
  const datePlate = document.createElement("p");
  datePlate.setAttribute("class", "date-plate");
  datePlate.textContent = getDateThen(date);
  dateContainer.appendChild(datePlate);
}

window.onload = function () {
  if (
    !document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("Authorization" + "="))
  ) {
    popupEmail.style.display = "block";
  }
};

getHistory();

scrollLoadingMessages.addEventListener("scroll", async function () {
  if (scrollLoadingMessages.scrollTop === 0) {
    console.log("работает скролл при ударении о потолок");
    loadingMessage.style.display = "block";
    // dateContainer.style.display = "none";
    loadMessages();
    topMessageScroll("smooth");
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (formInput.value === "") return;
  const message = formInput.value.trim();
  sendMessage(message);
  formInput.value = "";
});

function sendMessage(message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ text: message }));
  } else {
    console.log("Соединение закрыто, пытаемся восстановить...");
    connectWebSocket();
    socket.onopen = function () {
      socket.send(JSON.stringify({ text: message }));
    };
  }
}

function connectWebSocket() {
  socket.onopen = function () {
    console.log("Соединение установлено");
  };
  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log(data);

    try {
      const { name, email } = data.user;
      const text = data.text;
      const time = getTimeNow();
      const emailUserStorage = getEmailFromStorage();

      if (email === emailUserStorage) {
        createHTMLUser(text);
        console.log("сообщение от сокета");
        bottomMessageScroll("smooth");
      } else {
        createHTMLBot(text, name, time);
        bottomMessageScroll("smooth");
      }
    } catch (error) {
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

connectWebSocket();
