// js/app.js

// Simple global state placeholder
const RCApp = {
  user: null,
  events: [],
  spots: [],
  calendar: null
};

// Basic navigation helpers (if needed later)
document.addEventListener("DOMContentLoaded", () => {
  registerServiceWorker();
  initCalendarIfPresent();
});

// PWA: service worker registration (Railway-friendly)
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch(err => console.error("SW registration failed", err));
  }
}

// Calendar placeholder – we’ll wire real UI later
function initCalendarIfPresent() {
  const calendarRoot = document.getElementById("calendar-root");
  if (!calendarRoot) return;

  // For now, just a placeholder; later we’ll render real calendar + events
  calendarRoot.innerHTML = `
    <div class="calendar-placeholder">
      <p>Calendar will load events from events.js and user data from profile.js.</p>
    </div>
  `;
}

// Shared helper to add event to calendar (used by events.js, profile.js later)
export function addEventToCalendar(eventObj) {
  RCApp.events.push(eventObj);
  // Later: re-render calendar UI
}
