const trackSelect = document.getElementById('track_id');
const form = document.getElementById('register-form');
const errorEl = document.getElementById('form-error');

async function loadTracks() {
  try {
    const res = await fetch('/api/tracks');
    const tracks = await res.json();

    trackSelect.innerHTML = '<option value="" disabled selected>Select a track</option>';
    tracks.forEach((track) => {
      const option = document.createElement('option');
      option.value = track.id;
      option.textContent = track.name;
      trackSelect.appendChild(option);
    });
  } catch (err) {
    showError('Could not load tracks. Please refresh the page.');
  }
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const payload = {
    full_name: document.getElementById('full_name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    track_id: trackSelect.value,
  };

  if (!payload.full_name || !payload.email || !payload.track_id) {
    showError('Please fill in all required fields.');
    return;
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Registration failed.');
      return;
    }

    window.location.href = `/dashboard.html?registration_id=${data.registration.id}`;
  } catch (err) {
    showError('Something went wrong. Please try again.');
  }
});

loadTracks();
