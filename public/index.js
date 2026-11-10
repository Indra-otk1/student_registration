// Show an error message sent back by the server (e.g. /?error=...)
const error = new URLSearchParams(window.location.search).get('error');
if (error) {
  const el = document.getElementById('form-error');
  el.textContent = error; // textContent keeps this safe from injected HTML
  el.hidden = false;
}
