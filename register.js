import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

const form = document.getElementById('registerForm');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const first = document.getElementById('firstName')?.value?.trim() || '';
  const last = document.getElementById('lastName')?.value?.trim() || '';
  const email = document.getElementById('email')?.value?.trim() || '';
  const password = document.getElementById('password')?.value || '';
  const photoURL = 'imagenes/logo.png';

  if(!first || !last || !email || !password){ alert('Completa todos los campos requeridos.'); return; }

  try{
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // set displayName and photoURL
    await updateProfile(user, { displayName: first + ' ' + last, photoURL });
    // show animated success overlay then redirect
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
      <div class="success-panel" role="status" aria-live="polite">
        <div class="checkmark" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h3>Cuenta creada con éxito</h3>
        <p>Te redirigimos al inicio...</p>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(()=>{ window.location.href = 'index.html'; }, 1600);
  }catch(err){
    console.error('Registro falló', err);
    const code = err.code || '';
    if(code === 'auth/email-already-in-use') alert('El email ya está en uso. Intenta iniciar sesión.');
    else if(code === 'auth/weak-password') alert('La contraseña es débil. Usa al menos 6 caracteres.');
    else alert('Error al crear la cuenta. Intenta de nuevo.');
  }
});
