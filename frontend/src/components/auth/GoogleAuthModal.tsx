import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

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

  useEffect(() => {
    if (!isAuthModalOpen || !gisLoaded || !googleClientId || !googleBtnRef.current) {
      return;
    }

    try {
      window.google!.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            setAuthError('Something went wrong. Please try again.');
            return;
          }
          setIsSubmitting(true);
          setAuthError(null);
          try {
            await loginWithGoogleCredential(response.credential);
          } catch (err: any) {
            setAuthError(err.message || 'Sign-in failed. Please try again.');
          } finally {
            setIsSubmitting(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      googleBtnRef.current.innerHTML = '';
      window.google!.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        width: 300,
        text: 'continue_with',
        logo_alignment: 'left',
      });
    } catch (err) {
      console.warn('[GoogleAuthModal] Failed to render sign-in button:', err);
    }
  }, [isAuthModalOpen, gisLoaded, googleClientId, loginWithGoogleCredential]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-2 flex flex-col items-center text-center space-y-6">
          {/* Logo / Brand */}
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
              Welcome to CodeMentor
            </h2>
            <p className="text-[13px] text-slate-400 leading-relaxed max-w-65">
              Sign in to save your sessions, code, and progress across devices.
            </p>
          </div>

          {/* Error */}
          {authError && (
            <div className="w-full px-4 py-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300 text-xs text-center">
              {authError}
            </div>
          )}

          {/* Google Sign-In */}
          {googleClientId ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div ref={googleBtnRef} className="flex justify-center w-full" />

              {isSubmitting && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
                  <span>Signing you in...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-3">
              <p className="text-xs text-slate-500">
                Google Sign-In is not configured yet. Please set it up to continue.
              </p>
            </div>
          )}

          {/* Footer */}
          <p className="text-[11px] text-slate-600 leading-relaxed">
            We only access your name, email, and profile picture.
          </p>
        </div>
      </div>
    </div>
  );
};
