import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

// Instead of redirecting immediately, show a message and provide sign-out so user can switch accounts
const loggedInNotice = document.getElementById('loggedInNotice');
const loginForm = document.getElementById('loginForm');
const btnSignOut = document.getElementById('btnSignOut');

onAuthStateChanged(auth, (user) => {
  if(user){
    // show notice and hide form so user can explicitly sign out to login with another account
    if(loggedInNotice){ loggedInNotice.classList.remove('hidden'); }
    if(loginForm){ loginForm.classList.add('hidden'); }
  } else {
    if(loggedInNotice){ loggedInNotice.classList.add('hidden'); }
    if(loginForm){ loginForm.classList.remove('hidden'); }
  }
});

btnSignOut?.addEventListener('click', async (e) => {
  e.preventDefault();
  try{
    await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js').then(mod => mod.signOut(auth));
    alert('Sesión cerrada. Ahora puedes iniciar con otra cuenta.');
  }catch(err){ console.error('Sign out failed', err); alert('No se pudo cerrar sesión.'); }
});

const form = document.getElementById('loginForm');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value || '';
  if(!email || !password){ alert('Por favor ingresa email y contraseña.'); return; }

  try{
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // success — show a polished success overlay (like registration) and a short confetti burst, then redirect
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
      <div class="success-panel" role="status" aria-live="polite">
        <div class="checkmark" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h3>Iniciaste sesión correctamente</h3>
        <p>Redirigiendo a la página de inicio...</p>
      </div>`;
    document.body.appendChild(overlay);

    const confettiRoot = document.getElementById('confetti');
    const colors = ['#FF5C7C','#FFD166','#4ADE80','#60A5FA','#C084FC','#FFB86B'];
    const pieces = 28;
    for(let i=0;i<pieces;i++){
      const el = document.createElement('div');
      el.className = 'piece';
      el.style.left = Math.random()*100 + '%';
      el.style.background = colors[Math.floor(Math.random()*colors.length)];
      el.style.transform = `translateY(-10vh) rotate(${Math.random()*360}deg)`;
      el.style.animationDelay = (Math.random()*0.12)+'s';
      el.style.opacity = '1';
      if(confettiRoot) confettiRoot.appendChild(el);
    }

    setTimeout(()=>{
      if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if(confettiRoot) confettiRoot.innerHTML = '';
      window.location.href = 'index.html';
    }, 1500);

  }catch(err){
    const code = err.code || '';
    if(code === 'auth/user-not-found') alert('Usuario no encontrado. Verifica tu email.');
    else if(code === 'auth/wrong-password') alert('Contraseña incorrecta. Intenta de nuevo.');
    else if(code === 'auth/invalid-email') alert('Email inválido. Corrígelo e intenta de nuevo.');
    else if(code === 'auth/too-many-requests') alert('Demasiados intentos. Intenta más tarde.');
    else { console.error(err); alert('Error al iniciar sesión. Intenta nuevamente.'); }
  }
});
