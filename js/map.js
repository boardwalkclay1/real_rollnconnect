// js/map.js
// Google Maps + geolocation + marker handling

let rcMap;
let rcUserMarker;
let rcSpotMarkers = [];
let rcUserLocation = null;

function initRollNConnectMap() {
  // Default center (Amsterdam) until we get real location
  const defaultCenter = { lat: 52.3676, lng: 4.9041 };

  rcMap = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 13,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#000000" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "road",
        stylers: [{ color: "#222222" }]
      },
      {
        featureType: "water",
        stylers: [{ color: "#111111" }]
      }
    ]
  });

  getUserLocation().then(pos => {
    if (!pos) return;
    rcUserLocation = pos;

    rcMap.setCenter(pos);
    rcUserMarker = new google.maps.Marker({
      position: pos,
      map: rcMap,
      title: "You",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#ffffff",
        fillOpacity: 1,
        strokeColor: "#00ffff",
        strokeWeight: 2
      }
    });

    // Initial markers based on all spots
    if (typeof renderSpotsOnMap === "function") {
      renderSpotsOnMap(spotsData || []);
    }
  });
}

function getUserLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true }
    );
  });
}

function clearSpotMarkers() {
  rcSpotMarkers.forEach(m => m.setMap(null));
  rcSpotMarkers = [];
}

function renderSpotsOnMap(spots) {
  if (!rcMap) return;
  clearSpotMarkers();

  spots.forEach(spot => {
    if (!spot.lat || !spot.lng) return;

    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map: rcMap,
      title: spot.name,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    });

    const info = new google.maps.InfoWindow({
      content: `
        <div style="color:#000;">
          <strong>${spot.name}</strong><br>
          ${spot.city || ""}<br>
          ${spot.description || ""}
        </div>
      `
    });

    marker.addListener("click", () => {
      info.open(rcMap, marker);
    });

    rcSpotMarkers.push(marker);
  });
}

window.initRollNConnectMap = initRollNConnectMap;
window.renderSpotsOnMap = renderSpotsOnMap;
