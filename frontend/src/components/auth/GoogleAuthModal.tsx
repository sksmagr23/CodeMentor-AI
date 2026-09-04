import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, AlertCircle, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

export const GoogleAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogleCredential } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

  // Listen for Google Identity Services script availability
  useEffect(() => {
    if (!isAuthModalOpen) {
      setAuthError(null);
      return;
    }

    let intervalId: any;
    const checkGis = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
        if (intervalId) clearInterval(intervalId);
      }
    };

    checkGis();
    if (!window.google?.accounts?.id) {
      intervalId = setInterval(checkGis, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthModalOpen]);

  // Render the official Google Sign-In button
  useEffect(() => {
    if (!isAuthModalOpen || !gisLoaded || !googleClientId || !googleBtnRef.current) {
      return;
    }

    try {
      window.google!.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            setAuthError('No credential token received from Google.');
            return;
          }
          setIsSubmitting(true);
          setAuthError(null);
          try {
            await loginWithGoogleCredential(response.credential);
          } catch (err: any) {
            setAuthError(err.message || 'Google OAuth verification failed.');
          } finally {
            setIsSubmitting(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear container and render official Google button
      googleBtnRef.current.innerHTML = '';
      window.google!.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        width: 320,
        text: 'signin_with',
        logo_alignment: 'left',
      });
    } catch (err) {
      console.warn('[GoogleAuthModal] Failed to render Google OAuth button:', err);
    }
  }, [isAuthModalOpen, gisLoaded, googleClientId, loginWithGoogleCredential]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Google Sign-In</span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  OAuth 2.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">Authenticate securely with your Google account</p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {authError && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {googleClientId ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="flex justify-center w-full min-h-11.5 items-center">
                <div ref={googleBtnRef} className="flex justify-center w-full" />
              </div>

              {isSubmitting && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Verifying Google token with backend...</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 text-center max-w-xs leading-relaxed">
                Signing in synchronizes your DSA chat sessions, problem code, and test cases across devices.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Google OAuth Setup Required</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Please configure <code className="text-cyan-300 font-mono">VITE_GOOGLE_CLIENT_ID</code> in <code className="text-slate-300 font-mono">frontend/.env</code> and <code className="text-cyan-300 font-mono">GOOGLE_CLIENT_ID</code> / <code className="text-cyan-300 font-mono">GOOGLE_CLIENT_SECRET</code> in <code className="text-slate-300 font-mono">backend/.env</code>.
              </p>
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Google Verified OAuth</span>
            </div>
            <span className="font-mono text-[10px] text-slate-600">HS256 JWT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
