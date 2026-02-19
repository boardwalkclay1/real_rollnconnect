// js/spots.js
// Google Maps EMBED + filters + geolocation + local spot list + calendar + save

let userLat = null;
let userLng = null;
let lastQuery = "skating rink";
let liveTracking = false;
let liveTrackingInterval = null;

// Simple local spots list (can be expanded / replaced by API later)
let spotsData = [
  {
    id: "spot-1",
    name: "City Rink",
    type: "skating rink",
    city: "Amsterdam",
    description: "Outdoor rink with smooth concrete."
  },
  {
    id: "spot-2",
    name: "Canal Trail",
    type: "paved trail",
    city: "Amsterdam",
    description: "Long, smooth trail along the canal."
  },
  {
    id: "spot-3",
    name: "Water Fountain Plaza",
    type: "water",
    city: "Amsterdam",
    description: "Public plaza with multiple water fountains."
  },
  {
    id: "spot-4",
    name: "Deckside Garage",
    type: "parking garage",
    city: "Amsterdam",
    description: "Multi-level parking deck with smooth ramps."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const filterChips = document.querySelectorAll(".filter-chip");
  const nationwideToggle = document.getElementById("nationwide-rinks-toggle");
  const liveToggle = document.getElementById("live-tracking-toggle");
  const spotsListEl = document.getElementById("spots-list");

  // Initial location + default map + list
  getUserLocation().then(() => {
    loadMap(lastQuery);
    if (spotsListEl) renderSpotsList(spotsListEl, spotsData);
  });

  filterChips.forEach(chip => {
    chip.addEventListener("click", async () => {
      chip.classList.toggle("active");

      // Always refresh location before applying filter
      await getUserLocation();

      const activeFilters = Array.from(document.querySelectorAll(".filter-chip.active"))
        .map(c => c.dataset.filter);

      if (activeFilters.length === 0) {
        lastQuery = "skating rink";
      } else {
        lastQuery = activeFilters.join(" OR ");
      }

      const nationwide = nationwideToggle && nationwideToggle.checked;
      loadMap(lastQuery, nationwide);

      if (spotsListEl) {
        const filtered = activeFilters.length
          ? spotsData.filter(s => activeFilters.includes(s.type))
          : spotsData;
        renderSpotsList(spotsListEl, filtered);
      }
    });
  });

  if (nationwideToggle) {
    nationwideToggle.addEventListener("change", () => {
      const nationwide = nationwideToggle.checked;
      loadMap(lastQuery, nationwide);
    });
  }

  if (liveToggle) {
    liveToggle.addEventListener("change", () => {
      liveTracking = liveToggle.checked;
      if (liveTracking) {
        startLiveTracking();
      } else {
        stopLiveTracking();
      }
    });
  }
});

function startLiveTracking() {
  if (liveTrackingInterval) return;
  liveTrackingInterval = setInterval(async () => {
    await getUserLocation();
    loadMap(lastQuery, document.getElementById("nationwide-rinks-toggle")?.checked);
  }, 30000); // every 30 seconds
}

function stopLiveTracking() {
  if (liveTrackingInterval) {
    clearInterval(liveTrackingInterval);
    liveTrackingInterval = null;
  }
}

function getUserLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        resolve();
      },
      () => resolve(),
      { enableHighAccuracy: true }
    );
  });
}

function loadMap(query, nationwide = false) {
  const iframe = document.getElementById("spot-map");
  if (!iframe) return;

  const lat = userLat || 52.3676;
  const lng = userLng || 4.9041;

  const encodedQuery = encodeURIComponent(query);

  let url;
  if (nationwide && query.toLowerCase().includes("skating rink")) {
    // Nationwide rinks search (no near clause)
    url = `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodedQuery}`;
  } else {
    // Local search near current location
    url = `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodedQuery}+near+${lat},${lng}`;
  }

  iframe.src = url;
}

/* ---------------- LOCAL SPOT LIST: TAP, SESSION, SAVE ---------------- */

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
            <button class="btn small" data-action="details" data-spot-id="${spot.id}">Details</button>
            <button class="btn small secondary" data-action="save-spot" data-spot-id="${spot.id}">Save</button>
          </div>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll("[data-action='details']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.spotId;
      openSpotDetails(id);
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
    "paved trail": "Paved Trail",
    "parking garage": "Parking Deck",
    "parking lot": "Parking Lot",
    "skating rink": "Skating Rink"
  };
  return map[type] || type;
}

function openSpotDetails(spotId) {
  const spot = spotsData.find(s => s.id === spotId);
  if (!spot) return;

  const action = prompt(
    `${spot.name}\n\n${spot.description || ""}\n\nType:\n1 = Add session to calendar\n2 = Save spot\nCancel = close`
  );

  if (action === "1") {
    openSpotSessionPrompt(spotId);
  } else if (action === "2") {
    saveSpotToProfile(spotId);
  }
}

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
