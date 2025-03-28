import { getTokenFromCookie } from "./main";

const openPopupButton = document.querySelector(".setting-button");
const closePopupButton = document.getElementById("close-popup-name");
export const popup = document.getElementById("popup-name");
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


export async function updateUserName(newName) {
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
  } else {
    console.log("Имя успешно обновлено");
  }
}