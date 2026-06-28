import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const EMPTY_FORM = { email: '', password: '', confirmPassword: '' };

export default function AuthScreen() {
  const [mode, setMode]     = useState('login'); // 'login' | 'register'
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const emailRef = useRef(null);

  useEffect(() => {
    setForm(EMPTY_FORM);
    setErrors({});
    setServerError('');
    setSuccessMsg('');
    setTimeout(() => emailRef.current?.focus(), 50);
  }, [mode]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email no válido';
    if (!form.password)        e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (mode === 'register') {
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Las contraseñas no coinciden';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email:    form.email.trim(),
        password: form.password,
      });
      if (error) setServerError(translateAuthError(error.message));
    } else {
      const { error } = await supabase.auth.signUp({
        email:    form.email.trim(),
        password: form.password,
      });
      if (error) {
        setServerError(translateAuthError(error.message));
      } else {
        setSuccessMsg('Cuenta creada. Revisa tu correo para confirmar el registro.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen__card">
        <div className="auth-screen__brand">
          <svg width="28" height="28" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="6" height="16" rx="1.5" fill="#6C63FF" />
            <rect x="9" y="3" width="6" height="11" rx="1.5" fill="#F0A500" />
            <rect x="17" y="3" width="4" height="7" rx="1.5" fill="#2DD4BF" />
          </svg>
          <span className="auth-screen__brand-name">TrabajoDiario</span>
        </div>

        <div className="auth-screen__header">
          <h1 className="auth-screen__title">
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
          </h1>
          <p className="auth-screen__subtitle">
            {mode === 'login'
              ? 'Inicia sesión para acceder a tus proyectos'
              : 'Regístrate para empezar a gestionar tus proyectos'}
          </p>
        </div>

        {successMsg ? (
          <div className="auth-screen__success">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>{successMsg}</p>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => { setMode('login'); setSuccessMsg(''); }}
            >
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <form className="auth-screen__form" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="auth-screen__error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {serverError}
              </div>
            )}

            <div className="form__group">
              <label className="form__label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                ref={emailRef}
                type="email"
                className={`form__input ${errors.email ? 'form__input--error' : ''}`}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
              />
              {errors.email && <span className="form__error">{errors.email}</span>}
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="auth-password">Contraseña</label>
              <input
                id="auth-password"
                type="password"
                className={`form__input ${errors.password ? 'form__input--error' : ''}`}
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {errors.password && <span className="form__error">{errors.password}</span>}
            </div>

            {mode === 'register' && (
              <div className="form__group">
                <label className="form__label" htmlFor="auth-confirm">Confirmar contraseña</label>
                <input
                  id="auth-confirm"
                  type="password"
                  className={`form__input ${errors.confirmPassword ? 'form__input--error' : ''}`}
                  value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="form__error">{errors.confirmPassword}</span>}
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary auth-screen__submit"
              disabled={loading}
            >
              {loading
                ? 'Procesando...'
                : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {!successMsg && (
          <div className="auth-screen__switch">
            {mode === 'login' ? (
              <>
                <span>¿No tienes cuenta?</span>
                <button className="auth-screen__switch-btn" onClick={() => setMode('register')}>
                  Regístrate
                </button>
              </>
            ) : (
              <>
                <span>¿Ya tienes cuenta?</span>
                <button className="auth-screen__switch-btn" onClick={() => setMode('login')}>
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const AUTH_ERRORS = {
  'Invalid login credentials':         'Email o contraseña incorrectos',
  'Email not confirmed':               'Confirma tu email antes de entrar',
  'User already registered':           'Este email ya está registrado',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'signup is disabled':                'El registro está desactivado en este momento',
  'email rate limit exceeded':         'Demasiados intentos. Espera unos minutos.',
};

const translateAuthError = (msg) => {
  for (const [key, translation] of Object.entries(AUTH_ERRORS)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return translation;
  }
  return msg;
};
