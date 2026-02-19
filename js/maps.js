// js/map.js

let map;
let markers = [];
let activeFilters = new Set();

// Placeholder: later we’ll load real data from spots.json or API
const demoSpots = [
  { id: 1, name: "City Rink", type: "skating_rinks", lat: 52.3702, lng: 4.8952 },
  { id: 2, name: "Canal Trail", type: "paved_trails", lat: 52.3676, lng: 4.9041 },
  { id: 3, name: "Deck Garage", type: "parking_decks", lat: 52.3720, lng: 4.9000 }
];

document.addEventListener("DOMContentLoaded", () => {
  initFilterChips();
  initMapWhenReady();
});

// This will be called once Google Maps script is loaded
window.initRollNConnectMap = function () {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  map = new google.maps.Map(mapEl, {
    center: { lat: 52.3702, lng: 4.8952 }, // Amsterdam default
    zoom: 12,
    disableDefaultUI: true
  });

  renderMarkers();
};

function initMapWhenReady() {
  // We’ll include the Google Maps script tag in a later drop with your API key
  // For now, we assume the script calls window.initRollNConnectMap()
}

function initFilterChips() {
  const chips = document.querySelectorAll(".filter-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
        chip.classList.remove("active");
      } else {
        activeFilters.add(filter);
        chip.classList.add("active");
      }
      renderMarkers();
    });
  });
}

function renderMarkers() {
  if (!map) return;

  // Clear old markers
  markers.forEach(m => m.setMap(null));
  markers = [];

  const filtered = demoSpots.filter(spot => {
    if (activeFilters.size === 0) return true;
    return activeFilters.has(spot.type);
  });

  filtered.forEach(spot => {
    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map,
      title: spot.name
    });

    const info = new google.maps.InfoWindow({
      content: `<strong>${spot.name}</strong><br>Type: ${spot.type}`
    });

    marker.addListener("click", () => {
      info.open(map, marker);
      // Later: open spot detail, add to calendar, save to profile, etc.
    });

    markers.push(marker);
  });
}
