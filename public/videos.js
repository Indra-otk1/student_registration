// ===== EDIT THIS: put your YouTube links here =====
const TRACK_VIDEOS = {
  TOEFL:    'https://youtu.be/Lo1wuQBr_iw?si=Ylx6p7IO9NSwt8K2',
  IELTS:    'https://youtu.be/tOFm-zoI6-w?si=svI5fY49MF6YLIzu',
  SAT:      'https://youtu.be/06Y6OtRj0n8?si=FcXnEIm6wjgRlpcF',
  Duolingo: 'https://youtu.be/sq7BVilIdAY?si=Ch2hvJSmVfgSI-aCE',
};
// ==================================================

const params = new URLSearchParams(window.location.search);
const name = params.get('name');
const tracks = (params.get('tracks') || '').split(',').filter((t) => t in TRACK_VIDEOS);

if (name) document.getElementById('welcome').textContent = `Thank you for registering, ${name}!`;

function toEmbedUrl(link) {
  const match = link.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

const videosEl = document.getElementById('videos');
tracks.forEach((track) => {
  const block = document.createElement('div');
  block.className = 'video-block';

  const title = document.createElement('h2');
  title.textContent = `${track} overview`;
  block.appendChild(title);

  const embedUrl = toEmbedUrl(TRACK_VIDEOS[track]);
  if (embedUrl) {
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = `${track} overview video`;
    iframe.allowFullscreen = true;
    block.appendChild(iframe);
  } else {
    const note = document.createElement('p');
    note.className = 'error';
    note.textContent = 'Video coming soon.';
    block.appendChild(note);
  }
  videosEl.appendChild(block);
});
