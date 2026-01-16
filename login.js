import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, updateProfile, EmailAuthProvider, reauthenticateWithCredential, updateEmail } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

// Instead of redirecting immediately, show a message and provide sign-out so user can switch accounts
const loggedInNotice = document.getElementById('loggedInNotice');
const loginForm = document.getElementById('loginForm');
const btnSignOut = document.getElementById('btnSignOut');

// New profile panel elements
const profilePanel = document.getElementById('profilePanel');
const profilePicture = document.getElementById('profilePicture');
const profilePictureInput = document.getElementById('profilePictureInput');
const changePictureBtn = document.getElementById('changePictureBtn');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const saveProfileBtn = document.getElementById('saveProfileBtn');

let tempProfilePhoto = null; // Variable temporal para la foto de perfil

onAuthStateChanged(auth, (user) => {
  if(user){
    // Show profile panel, hide login form
    if(profilePanel){ profilePanel.classList.remove('hidden'); }
    if(loginForm){ loginForm.classList.add('hidden'); }

    // Populate profile data
    if(profileName){ profileName.value = user.displayName || ''; }
    if(profileEmail){ profileEmail.value = user.email || ''; }
    // Load profile picture from localStorage
    const localPhoto = localStorage.getItem(`profilePhoto_${user.uid}`);
    if (profilePicture) { profilePicture.src = localPhoto || 'imagenes/logo.png'; }

  } else {
    // Hide profile panel, show login form
    if(profilePanel){ profilePanel.classList.add('hidden'); }
    if(loginForm){ loginForm.classList.remove('hidden'); }
  }
});

btnSignOut?.addEventListener('click', async (e) => {
  e.preventDefault();
  try{
    await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js').then(mod => mod.signOut(auth));
    // Clear local storage photo on sign out
    const user = auth.currentUser;
    if (user) { localStorage.removeItem(`profilePhoto_${user.uid}`); }
    alert('Sesión cerrada. Ahora puedes iniciar con otra cuenta.');
  }catch(err){ console.error('Sign out failed', err); alert('No se pudo cerrar sesión.'); }
});

// Save profile changes
saveProfileBtn?.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;

  const newName = profileName?.value?.trim() || '';

  if (newName !== user.displayName) {
    try {
      await updateProfile(user, { displayName: newName });
      alert('Nombre de perfil actualizado correctamente.');
    } catch (error) {
      console.error('Error al actualizar el nombre:', error);
      alert('Error al actualizar el nombre.');
    }
  }

  // Save temporary profile photo to localStorage if available
  if (tempProfilePhoto) {
    localStorage.setItem(`profilePhoto_${user.uid}`, tempProfilePhoto);
    if (profilePicture) profilePicture.src = tempProfilePhoto; // Asegurar que la UI esté actualizada
    tempProfilePhoto = null; // Limpiar la variable temporal
    alert('Foto de perfil guardada localmente.');
  }
});

// Change profile picture (using localStorage)
changePictureBtn?.addEventListener('click', () => {
  profilePictureInput?.click();
});

profilePictureInput?.addEventListener('change', (e) => {
  const user = auth.currentUser;
  if (!user || !e.target.files || e.target.files.length === 0) return;

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const base64Image = reader.result;
    if (typeof base64Image === 'string') {
      tempProfilePhoto = base64Image; // Guardar temporalmente
      if (profilePicture) profilePicture.src = base64Image; // Actualizar previsualización
      alert('Nueva foto seleccionada. Haz clic en "Guardar Cambios" para aplicarla.');
    }
  };

  reader.onerror = (error) => {
    console.error('Error al leer el archivo:', error);
    alert('Error al leer el archivo de imagen.');
  };

  reader.readAsDataURL(file);
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
