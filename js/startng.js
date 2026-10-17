// ---------------------------------------------------------------------------
// start.ng adapter: who is playing + how their character looks.
//
// VERIFIED AGAINST THE DOCS (https://start.ng/docs.md): the postMessage
// "connect page" method below ('startng:whoami' -> 'startng:user').
// NOT YET TESTED LIVE: it only works once the game runs at <name>.start.ng.
//
// MOCK: when the game runs anywhere else (your laptop), we use fake data so
// you can develop. The mock is clearly flagged with source: 'mock'.
// ---------------------------------------------------------------------------
const START_NG = 'https://start.ng';

// Fake data for local development ONLY. Not real start.ng data.
export const MOCK_STYLE = { body: 'male', primaryColor: '#a55eea', secondaryColor: '#0c6e5a',
  skinColor: '#8d5524', hairColor: '#17120f', hair: 'afro', hat: 'crown', accessory: 'glasses' };

const onStartNg = location.hostname.endsWith('.start.ng');

// --- helper copied from the start.ng docs (always checks e.origin) ---------
let frame;
function connectFrame() {
  frame ??= new Promise((resolve, reject) => {
    const el = document.createElement('iframe');
    el.src = `${START_NG}/connect`;
    el.hidden = true;
    el.onload = () => resolve(el);
    el.onerror = reject;
    document.body.append(el);
  });
  return frame;
}
async function askStartNg(message, replyType, timeoutMs = 5000) {
  const el = await connectFrame();
  return new Promise((resolve) => {
    const requestId = Math.random().toString(36).slice(2);
    const done = (reply) => { clearTimeout(timer); removeEventListener('message', onMessage); resolve(reply); };
    const timer = setTimeout(() => done(null), timeoutMs);
    function onMessage(e) {
      if (e.origin !== START_NG || e.source !== el.contentWindow) return;
      if (e.data?.type === replyType && e.data.requestId === requestId) done(e.data);
    }
    addEventListener('message', onMessage);
    el.contentWindow.postMessage({ ...message, requestId }, START_NG);
  });
}

// Returns { source, signedIn, name, account, style }
export async function loadPlayer() {
  if (onStartNg) {
    const reply = await askStartNg({ type: 'startng:whoami' }, 'startng:user').catch(() => null);
    const p = reply?.user ?? reply?.guest;
    if (p) return { source: 'startng', signedIn: !!reply.user, name: p.name,
      account: reply.user?.account ?? null, style: p.style };
  }
  // Not on start.ng (or start.ng did not answer): fall back to the mock.
  return { source: 'mock', signedIn: false, name: 'Dev Player', account: null, style: MOCK_STYLE };
}

// Per the docs: ask again when the player returns to the tab, because they
// may have signed in/out or changed their character on start.ng.
export function watchPlayer(onChange) {
  let last = '';
  const check = async () => {
    const p = await loadPlayer();
    const key = JSON.stringify([p.name, p.signedIn, p.style]);
    if (key !== last) { last = key; onChange(p); }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  addEventListener('focus', check);
  check();
  // Dev helper (console): devSetStyle({ primaryColor: '#ff0000', hair: 'bun' })
  if (!onStartNg) window.devSetStyle = (s) => onChange({ source: 'mock', signedIn: false, name: 'Dev Player', account: null, style: { ...MOCK_STYLE, ...s } });
}

export const signInUrl = () => `${START_NG}/?return_to=${encodeURIComponent(location.origin + location.pathname)}`;
