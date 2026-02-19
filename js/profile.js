// js/profile.js
// Profile: avatar, 3s clip, posts, likes, comments, tabs, counts, calendar hook

let profileState = {
  username: "@username",
  bio: "Bio goes here…",
  avatar: "assets/images/default-avatar.png",
  clipUrl: "",        // 3-second intro clip
  posts: [],          // { id, videoUrl, caption, likes, comments: [] }
  savedSpots: [],     // spot IDs
  joinedEvents: []    // event IDs
};

document.addEventListener("DOMContentLoaded", () => {
  loadProfileFromStorage();
  renderProfileHeader();
  renderProfileTabs();
  wireProfileActions();
  renderPosts();
  renderProfileEvents();
  renderProfileSpots();
  renderProfileCalendarCounts();
});

function loadProfileFromStorage() {
  const stored = localStorage.getItem("rc_profile");
  if (stored) {
    try {
      profileState = { ...profileState, ...JSON.parse(stored) };
    } catch (e) {
      console.error("Failed to parse profile from storage", e);
    }
  }

  profileState.savedSpots = JSON.parse(localStorage.getItem("rc_saved_spots") || "[]");
  profileState.joinedEvents = JSON.parse(localStorage.getItem("rc_joined_events") || "[]");
}

function saveProfileToStorage() {
  localStorage.setItem("rc_profile", JSON.stringify(profileState));
}

function renderProfileHeader() {
  const avatarEl = document.getElementById("profile-avatar");
  const usernameEl = document.getElementById("profile-username");
  const bioEl = document.getElementById("profile-bio");
  const clipEl = document.getElementById("profile-clip");

  if (avatarEl) avatarEl.src = profileState.avatar;
  if (usernameEl) usernameEl.textContent = profileState.username;
  if (bioEl) bioEl.textContent = profileState.bio;
  if (clipEl && profileState.clipUrl) clipEl.src = profileState.clipUrl;

  renderProfileCalendarCounts();
}

function renderProfileCalendarCounts() {
  const postCountEl = document.getElementById("profile-post-count");
  const eventsCountEl = document.getElementById("profile-events-count");
  const spotsCountEl = document.getElementById("profile-spots-count");

  if (postCountEl) postCountEl.textContent = profileState.posts.length;
  if (eventsCountEl) eventsCountEl.textContent = profileState.joinedEvents.length;
  if (spotsCountEl) spotsCountEl.textContent = profileState.savedSpots.length;
}

function renderProfileTabs() {
  // content rendering handled separately
}

function wireProfileActions() {
  const editBtn = document.getElementById("edit-profile-btn");
  const changeAvatarBtn = document.getElementById("change-avatar-btn");
  const changeClipBtn = document.getElementById("change-clip-btn");
  const modal = document.getElementById("edit-profile-modal");
  const form = document.getElementById("edit-profile-form");

  if (editBtn && modal) {
    editBtn.addEventListener("click", () => {
      openEditProfileModal();
    });
  }

  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener("click", () => {
      const url = prompt("Paste image URL for avatar:");
      if (!url) return;
      profileState.avatar = url;
      saveProfileToStorage();
      renderProfileHeader();
    });
  }

  if (changeClipBtn) {
    changeClipBtn.addEventListener("click", () => {
      const url = prompt("Paste video URL for your 3-second clip:");
      if (!url) return;
      profileState.clipUrl = url;
      saveProfileToStorage();
      renderProfileHeader();
    });
  }

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target.dataset.closeModal !== undefined || e.target === modal) {
        closeEditProfileModal();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const usernameInput = document.getElementById("edit-username");
      const bioInput = document.getElementById("edit-bio");

      if (usernameInput) profileState.username = "@" + (usernameInput.value || profileState.username.replace(/^@/, ""));
      if (bioInput) profileState.bio = bioInput.value || "";

      saveProfileToStorage();
      renderProfileHeader();
      closeEditProfileModal();
    });
  }

  const tabs = document.querySelectorAll(".profile-tabs .tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });
}

function openEditProfileModal() {
  const modal = document.getElementById("edit-profile-modal");
  const usernameInput = document.getElementById("edit-username");
  const bioInput = document.getElementById("edit-bio");

  if (usernameInput) usernameInput.value = profileState.username.replace(/^@/, "");
  if (bioInput) bioInput.value = profileState.bio;

  if (modal) modal.hidden = false;
}

function closeEditProfileModal() {
  const modal = document.getElementById("edit-profile-modal");
  if (modal) modal.hidden = true;
}

function switchTab(tabName) {
  const tabs = document.querySelectorAll(".profile-tabs .tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));
  panels.forEach(p => p.classList.toggle("active", p.id === `profile-${tabName}`));
}

/* ---------------- POSTS (video, likes, comments) ---------------- */

function renderPosts() {
  const postsEl = document.getElementById("profile-posts");
  if (!postsEl) return;

  if (!profileState.posts || profileState.posts.length === 0) {
    postsEl.innerHTML = `<p class="empty-state">No posts yet.</p>`;
    return;
  }

  postsEl.innerHTML = profileState.posts
    .map(post => {
      return `
        <article class="post-card" data-post-id="${post.id}">
          <div class="post-video">
            <video src="${post.videoUrl}" controls></video>
          </div>
          <div class="post-meta">
            <p class="post-caption">${post.caption || ""}</p>
            <button class="like-btn" data-post-id="${post.id}">
              ❤️ <span>${post.likes || 0}</span>
            </button>
          </div>
          <div class="post-comments">
            ${(post.comments || [])
              .map(c => `<p class="comment"><strong>${c.user}:</strong> ${c.text}</p>`)
              .join("")}
            <button class="btn small" data-action="add-comment" data-post-id="${post.id}">Add Comment</button>
          </div>
        </article>
      `;
    })
    .join("");

  postsEl.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.postId;
      likePost(id);
    });
  });

  postsEl.querySelectorAll("[data-action='add-comment']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.postId;
      addCommentToPost(id);
    });
  });
}

function likePost(postId) {
  const post = profileState.posts.find(p => p.id === postId);
  if (!post) return;

  if (!post.likes) post.likes = 0;
  if (post.likes >= 1) return; // one like per piece

  post.likes += 1;
  saveProfileToStorage();
  renderPosts();
  renderProfileCalendarCounts();
}

function addCommentToPost(postId) {
  const post = profileState.posts.find(p => p.id === postId);
  if (!post) return;

  const text = prompt("Comment:");
  if (!text) return;

  if (!post.comments) post.comments = [];
  post.comments.push({
    user: profileState.username,
    text
  });

  saveProfileToStorage();
  renderPosts();
}

/* ---------------- EVENTS + SPOTS LISTS ON PROFILE ---------------- */

function renderProfileEvents() {
  const eventsEl = document.getElementById("profile-events");
  if (!eventsEl) return;

  const joined = profileState.joinedEvents || [];
  if (joined.length === 0) {
    eventsEl.innerHTML = `<p class="empty-state">No joined events yet.</p>`;
    return;
  }

  eventsEl.innerHTML = joined
    .map(id => `<p>Event: ${id}</p>`)
    .join("");
}

function renderProfileSpots() {
  const spotsEl = document.getElementById("profile-spots");
  if (!spotsEl) return;

  const saved = profileState.savedSpots || [];
  if (saved.length === 0) {
    spotsEl.innerHTML = `<p class="empty-state">No saved spots yet.</p>`;
    return;
  }

  spotsEl.innerHTML = saved
    .map(id => `<p>Spot: ${id}</p>`)
    .join("");
}
