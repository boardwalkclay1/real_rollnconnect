// js/spots.js

// Later we can load this from /data/spots.json or an API
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
  if (!spotsListEl) return;

  renderSpotsList(spotsListEl, spotsData);
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
            <button class="btn small" data-action="view-spot" data-spot-id="${spot.id}">View</button>
            <button class="btn small secondary" data-action="save-spot" data-spot-id="${spot.id}">Save</button>
          </div>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll("[data-action='view-spot']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.spotId;
      openSpotDetail(id);
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

function openSpotDetail(spotId) {
  const spot = spotsData.find(s => s.id === spotId);
  if (!spot) return;

  alert(`${spot.name}\n\n${spot.description || ""}`);
  // Later: real modal with map, add-to-calendar, comments, etc.
}

function saveSpotToProfile(spotId) {
  const saved = JSON.parse(localStorage.getItem("rc_saved_spots") || "[]");
  if (!saved.includes(spotId)) {
    saved.push(spotId);
    localStorage.setItem("rc_saved_spots", JSON.stringify(saved));
  }
  alert("Spot saved to your profile.");
}
