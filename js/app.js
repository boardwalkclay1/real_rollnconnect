/* ---------------------------------------------------
   ROLL ’N CONNECT — GLOBAL APP ENGINE
   Calendar • Events • Spots • Profile Sync
--------------------------------------------------- */

const RCApp = {
  user: null,
  events: [],          // all events created or joined
  spots: [],           // all saved spots
  calendar: {},        // { "2026-02-20": [eventObj, spotSessionObj] }
  selectedDay: null
};

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  registerServiceWorker();
  initMiniCalendars();
  initFullCalendar();
});

/* ---------------------------------------------------
   STORAGE
--------------------------------------------------- */
function loadFromStorage() {
  RCApp.events = JSON.parse(localStorage.getItem("rc_events") || "[]");
  RCApp.spots = JSON.parse(localStorage.getItem("rc_spots") || "[]");
  RCApp.calendar = JSON.parse(localStorage.getItem("rc_calendar") || "{}");
}

function saveToStorage() {
  localStorage.setItem("rc_events", JSON.stringify(RCApp.events));
  localStorage.setItem("rc_spots", JSON.stringify(RCApp.spots));
  localStorage.setItem("rc_calendar", JSON.stringify(RCApp.calendar));
}

/* ---------------------------------------------------
   PWA SERVICE WORKER
--------------------------------------------------- */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }
}

/* ---------------------------------------------------
   ADD TO CALENDAR (GLOBAL)
--------------------------------------------------- */
function addToCalendar(date, item) {
  if (!RCApp.calendar[date]) RCApp.calendar[date] = [];
  RCApp.calendar[date].push(item);
  saveToStorage();
  refreshAllCalendars();
}

/* ---------------------------------------------------
   CALENDAR HELPERS
--------------------------------------------------- */
function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return { first, last };
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

/* ---------------------------------------------------
   MINI CALENDARS (Events + Profile)
--------------------------------------------------- */
function initMiniCalendars() {
  const mini = document.getElementById("calendar-root");
  const profileMini = document.getElementById("profile-calendar");

  if (mini) renderMiniCalendar(mini);
  if (profileMini) renderMiniCalendar(profileMini);
}

function renderMiniCalendar(container) {
  const today = new Date();
  const { first, last } = getMonthDays(today.getFullYear(), today.getMonth());

  let html = `<div class="mini-cal-grid">`;

  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), d);
    const key = formatDate(date);
    const hasEvents = RCApp.calendar[key] && RCApp.calendar[key].length > 0;

    html += `
      <div class="mini-cal-day ${hasEvents ? "has-events" : ""}" data-date="${key}">
        ${d}
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll(".mini-cal-day").forEach(day => {
    day.addEventListener("click", () => {
      RCApp.selectedDay = day.dataset.date;
      openDayDetails(day.dataset.date);
    });
  });
}

/* ---------------------------------------------------
   FULL CALENDAR PAGE
--------------------------------------------------- */
function initFullCalendar() {
  const full = document.getElementById("calendar-full");
  if (!full) return;

  renderFullCalendar(full);
}

function renderFullCalendar(container) {
  const today = new Date();
  const { first, last } = getMonthDays(today.getFullYear(), today.getMonth());

  let html = `
    <div class="full-cal-header">
      <h3>${today.toLocaleString("default", { month: "long" })} ${today.getFullYear()}</h3>
    </div>
    <div class="full-cal-grid">
  `;

  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), d);
    const key = formatDate(date);
    const hasEvents = RCApp.calendar[key] && RCApp.calendar[key].length > 0;

    html += `
      <div class="full-cal-day ${hasEvents ? "has-events" : ""}" data-date="${key}">
        <span class="day-num">${d}</span>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll(".full-cal-day").forEach(day => {
    day.addEventListener("click", () => {
      RCApp.selectedDay = day.dataset.date;
      renderDayEventList(day.dataset.date);
    });
  });
}

/* ---------------------------------------------------
   DAY DETAILS (FULL CALENDAR PAGE)
--------------------------------------------------- */
function renderDayEventList(date) {
  const list = document.getElementById("calendar-events-list");
  if (!list) return;

  const items = RCApp.calendar[date] || [];

  if (items.length === 0) {
    list.innerHTML = `<p class="empty-state">No sessions on this day.</p>`;
    return;
  }

  list.innerHTML = items
    .map(item => {
      return `
        <article class="event-card">
          <h3>${item.title || item.name}</h3>
          <p>${item.time || ""}</p>
          <p>${item.location || ""}</p>
        </article>
      `;
    })
    .join("");
}

/* ---------------------------------------------------
   OPEN DAY DETAILS (MINI CALENDAR)
--------------------------------------------------- */
function openDayDetails(date) {
  alert(`Sessions on ${date}:\n\n${
    (RCApp.calendar[date] || [])
      .map(i => "- " + (i.title || i.name))
      .join("\n") || "None"
  }`);
}

/* ---------------------------------------------------
   REFRESH ALL CALENDARS
--------------------------------------------------- */
function refreshAllCalendars() {
  initMiniCalendars();
  initFullCalendar();
}

/* ---------------------------------------------------
   GLOBAL EXPORTS FOR OTHER JS FILES
--------------------------------------------------- */
window.RCApp = RCApp;
window.addToCalendar = addToCalendar;
window.refreshAllCalendars = refreshAllCalendars;
