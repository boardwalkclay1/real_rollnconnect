// js/events.js
// Events list + create + join + calendar integration

let eventsData = [
  {
    id: "event-1",
    title: "Night Skate at City Rink",
    date: "2026-02-20",
    time: "19:00",
    location: "City Rink, Amsterdam",
    description: "Group night skate, all levels welcome."
  },
  {
    id: "event-2",
    title: "Canal Trail Session",
    date: "2026-02-22",
    time: "14:00",
    location: "Canal Trail, Amsterdam",
    description: "Chill cruise along the canal trail."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const eventsListEl = document.getElementById("events-list");
  const addEventBtn = document.getElementById("add-event-btn");

  if (eventsListEl) {
    renderEventsList(eventsListEl, eventsData);
  }

  if (addEventBtn) {
    addEventBtn.addEventListener("click", openCreateEventPrompt);
  }

  initEventModal();
});

function renderEventsList(container, events) {
  if (!events || events.length === 0) {
    container.innerHTML = `<p class="empty-state">No events yet. They’ll show up here.</p>`;
    return;
  }

  container.innerHTML = events
    .map(event => {
      return `
        <article class="event-card" data-event-id="${event.id}">
          <div class="event-main">
            <h3>${event.title}</h3>
            <p class="event-datetime">${event.date} • ${event.time}</p>
            <p class="event-location">${event.location}</p>
          </div>
          <div class="event-actions">
            <button class="btn small" data-action="view-event" data-event-id="${event.id}">View</button>
            <button class="btn small secondary" data-action="join-event" data-event-id="${event.id}">Join</button>
          </div>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll("[data-action='view-event']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.eventId;
      openEventModal(id);
    });
  });

  container.querySelectorAll("[data-action='join-event']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.eventId;
      joinEvent(id);
    });
  });
}

function openCreateEventPrompt() {
  const title = prompt("Event title:");
  if (!title) return;

  const date = prompt("Event date (YYYY-MM-DD):");
  if (!date) return;

  const time = prompt("Event time (HH:MM):") || "";
  const location = prompt("Location:") || "";
  const description = prompt("Description:") || "";

  const newEvent = {
    id: `event-${Date.now()}`,
    title,
    date,
    time,
    location,
    description
  };

  eventsData.push(newEvent);

  // Add to global calendar
  if (typeof addToCalendar === "function") {
    addToCalendar(newEvent.date, {
      type: "event",
      id: newEvent.id,
      title: newEvent.title,
      time: newEvent.time,
      location: newEvent.location
    });
  }

  const eventsListEl = document.getElementById("events-list");
  if (eventsListEl) renderEventsList(eventsListEl, eventsData);

  saveJoinedEvent(newEvent.id, true); // creator auto-joined
  alert("Event created and added to your calendar.");
}

function initEventModal() {
  const modal = document.getElementById("event-modal");
  if (!modal) return;

  modal.addEventListener("click", e => {
    if (e.target.dataset.closeModal !== undefined || e.target === modal) {
      closeEventModal();
    }
  });

  const joinBtn = document.getElementById("join-event-btn");
  if (joinBtn) {
    joinBtn.addEventListener("click", () => {
      const eventId = joinBtn.dataset.eventId;
      if (eventId) {
        joinEvent(eventId);
        closeEventModal();
      }
    });
  }
}

function openEventModal(eventId) {
  const event = eventsData.find(e => e.id === eventId);
  if (!event) return;

  const modal = document.getElementById("event-modal");
  const titleEl = document.getElementById("event-modal-title");
  const bodyEl = document.getElementById("event-modal-body");
  const joinBtn = document.getElementById("join-event-btn");

  if (!modal || !titleEl || !bodyEl || !joinBtn) return;

  titleEl.textContent = event.title;
  bodyEl.innerHTML = `
    <p><strong>Date:</strong> ${event.date}</p>
    <p><strong>Time:</strong> ${event.time}</p>
    <p><strong>Location:</strong> ${event.location}</p>
    <p>${event.description || ""}</p>
  `;

  joinBtn.dataset.eventId = event.id;
  modal.hidden = false;
}

function closeEventModal() {
  const modal = document.getElementById("event-modal");
  if (modal) modal.hidden = true;
}

function joinEvent(eventId) {
  const event = eventsData.find(e => e.id === eventId);
  if (!event) return;

  // Add to global calendar
  if (typeof addToCalendar === "function") {
    addToCalendar(event.date, {
      type: "event",
      id: event.id,
      title: event.title,
      time: event.time,
      location: event.location
    });
  }

  saveJoinedEvent(eventId, true);
  alert("You joined this event. It will show in your profile and calendar.");
}

function saveJoinedEvent(eventId, joined) {
  const joinedEvents = JSON.parse(localStorage.getItem("rc_joined_events") || "[]");
  if (joined && !joinedEvents.includes(eventId)) {
    joinedEvents.push(eventId);
  }
  localStorage.setItem("rc_joined_events", JSON.stringify(joinedEvents));
}
