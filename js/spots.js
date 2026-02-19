// js/spots.js
// Spots list + basic filters + add session to calendar

let spotsData = [
  {
    id: "spot-1",
    name: "City Rink",
    type: "skating_rinks",
    city: "Amsterdam",
    description: "Outdoor rink with smooth concrete.",
    lat: 52.3702,
    lng: 4.8952
  },
  {
    id: "spot-2",
    name: "Canal Trail",
    type: "paved_trails",
    city: "Amsterdam",
    description: "Long, smooth trail along the canal.",
    lat: 52.3676,
    lng: 4.9041
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const spotsListEl = document.getElementById("spots-list");
  const filterChips = document.querySelectorAll(".filter-chip");

  if (spotsListEl) {
    renderSpotsList(spotsListEl, spotsData);
  }

  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chip.classList.toggle("active");

      const activeFilters = Array.from(document.querySelectorAll(".filter-chip.active"))
        .map(c => c.dataset.filter);

      const filtered = activeFilters.length
        ? spotsData.filter(s => activeFilters.includes(s.type))
        : spotsData;

      if (spotsListEl) renderSpotsList(spotsListEl, filtered);
    });
  });
});

function renderSpotsList(container, spots) {
  if (!spots || spots.length === 0) {
    container.innerHTML = `<p class="empty-state">No spots yet. They’ll show up here.</p>`;
    return;
  }

  container.innerHTML = spots
    .map(spot => {
      return `
        <article class="spot-card" data-spot-id="${spot.id}">
          <div class="spot-card-main">
            <h3>${spot.name}</h3>
            <p class="spot-type">${formatSpotType(spot.type)}</p>
            <p class="spot-city">${spot.city || ""}</p>
            <p class="spot-desc">${spot.description || ""}</p>
          </div>
          <div class="spot-card-actions">
            <button class="btn small" data-action="view-spot" data-spot-id="${spot.id}">Session</button>
            <button class="btn small secondary" data-action="save-spot" data-spot-id="${spot.id}">Save</button>
          </div>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll("[data-action='view-spot']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.spotId;
      openSpotSessionPrompt(id);
    });
  });

  container.querySelectorAll("[data-action='save-spot']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.spotId;
      saveSpotToProfile(id);
    });
  });
}

function formatSpotType(type) {
  const map = {
    water: "Water",
    medical: "Medical Supplies",
    food: "Food",
    paved_trails: "Paved Trails",
    parking_decks: "Parking Decks",
    parking_lots: "Parking Lots",
    skating_rinks: "Skating Rinks"
  };
  return map[type] || type;
}

// Add a session from this spot directly to calendar
function openSpotSessionPrompt(spotId) {
  const spot = spotsData.find(s => s.id === spotId);
  if (!spot) return;

  const date = prompt("Session date (YYYY-MM-DD):");
  if (!date) return;

  const time = prompt("Session time (HH:MM):") || "";
  const note = prompt("Session note (optional):") || "";

  if (typeof addToCalendar === "function") {
    addToCalendar(date, {
      type: "spot-session",
      id: `${spot.id}-${date}-${time}`,
      name: spot.name,
      time,
      location: spot.city || "",
      note
    });
  }

  alert("Session added to your calendar.");
}

function saveSpotToProfile(spotId) {
  const saved = JSON.parse(localStorage.getItem("rc_saved_spots") || "[]");
  if (!saved.includes(spotId)) {
    saved.push(spotId);
    localStorage.setItem("rc_saved_spots", JSON.stringify(saved));
  }
  alert("Spot saved to your profile.");
}
