// js/spots.js
// Google Maps EMBED + filters + geolocation

let userLat = null;
let userLng = null;

document.addEventListener("DOMContentLoaded", () => {
  const filterChips = document.querySelectorAll(".filter-chip");

  // Get location immediately
  getUserLocation().then(() => {
    // Load default map (skating rinks)
    loadMap("skating rink");
  });

  filterChips.forEach(chip => {
    chip.addEventListener("click", async () => {
      chip.classList.toggle("active");

      // Always refresh location before applying filter
      await getUserLocation();

      const activeFilters = Array.from(document.querySelectorAll(".filter-chip.active"))
        .map(c => c.dataset.filter);

      if (activeFilters.length === 0) {
        loadMap("skating rink");
        return;
      }

      // Combine filters into one search query
      const query = activeFilters.join(" OR ");

      loadMap(query);
    });
  });
});

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

function loadMap(query) {
  const iframe = document.getElementById("spot-map");
  if (!iframe) return;

  const lat = userLat || 52.3676;
  const lng = userLng || 4.9041;

  const encoded = encodeURIComponent(query);

  const url = `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encoded}+near+${lat},${lng}`;

  iframe.src = url;
}
