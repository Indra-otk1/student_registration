const params = new URLSearchParams(window.location.search);
const registrationId = params.get('registration_id');

const listEl = document.getElementById('module-list');
const headingEl = document.getElementById('track-heading');
const summaryEl = document.getElementById('progress-summary');
const errorEl = document.getElementById('dashboard-error');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function renderModules(modules) {
  listEl.innerHTML = '';
  modules.forEach((mod) => {
    const li = document.createElement('li');
    li.className = 'module-item' + (mod.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = mod.completed;
    checkbox.addEventListener('change', () => toggleModule(mod.id, checkbox.checked));

    const textWrap = document.createElement('div');
    textWrap.innerHTML = `
      <div class="module-title">${mod.title}</div>
      <div class="module-meta">${mod.duration_minutes} min</div>
    `;

    li.appendChild(checkbox);
    li.appendChild(textWrap);
    listEl.appendChild(li);
  });

  const completedCount = modules.filter((m) => m.completed).length;
  summaryEl.textContent = `${completedCount} of ${modules.length} modules completed`;
}

async function toggleModule(moduleId, completed) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id: registrationId, module_id: moduleId, completed }),
    });
    loadProgress();
  } catch (err) {
    showError('Could not update progress. Please try again.');
  }
}

async function loadRegistration() {
  const res = await fetch(`/api/register/${registrationId}`);
  if (!res.ok) return;
  const reg = await res.json();
  headingEl.textContent = `${reg.track_name} training`;
}

async function loadProgress() {
  if (!registrationId) {
    showError('No registration found. Please register first.');
    return;
  }

  try {
    const res = await fetch(`/api/progress/${registrationId}`);
    const modules = await res.json();

    if (!res.ok) {
      showError(modules.error || 'Could not load your progress.');
      return;
    }

    renderModules(modules);
  } catch (err) {
    showError('Something went wrong. Please try again.');
  }
}

loadRegistration();
loadProgress();
