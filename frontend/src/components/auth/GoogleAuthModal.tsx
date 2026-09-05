import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

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
  const toast = useToast();
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

    let intervalId: ReturnType<typeof setInterval> | undefined;
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
            toast.success('Welcome', 'You are signed in.');
          } catch (err: any) {
            setAuthError(err.message || 'Sign-in failed. Please try again.');
            toast.error('Sign-in failed', err.message);
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
  }, [isAuthModalOpen, gisLoaded, googleClientId, loginWithGoogleCredential, toast]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="w-full max-w-sm panel-brutal overflow-hidden animate-pop-in">
        <div className="flex justify-between items-center px-4 pt-4">
          <div className="w-10 h-10 border-accent overflow-hidden shadow-hard-sm">
            <BrandLogo size={40} className="w-full h-full" />
          </div>
          <button
            onClick={closeAuthModal}
            className="icon-btn w-8 h-8"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-6 pb-7 pt-4 flex flex-col items-center text-center space-y-5">
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-ink tracking-tight">
              Welcome to CodeMentor
            </h2>
            <p className="text-[13px] text-muted leading-relaxed max-w-64 mx-auto">
              Sign in to save sessions, code, and progress across devices.
            </p>
          </div>

          {authError && (
            <div className="w-full px-4 py-2.5 border-2 border-accent bg-danger/10 text-danger text-xs text-center font-medium">
              {authError}
            </div>
          )}

          {googleClientId ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div ref={googleBtnRef} className="flex justify-center w-full [&_div]:rounded-none!" />

              {isSubmitting && (
                <div className="flex items-center gap-2 text-xs text-muted font-mono">
                  <div className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent animate-spin" />
                  <span>Signing you in…</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted">
              Google Sign-In is not configured yet.
            </p>
          )}

          <p className="text-[11px] text-muted leading-relaxed">
            We only access your name, email, and profile picture.
          </p>
        </div>
      </div>
    </div>
  );
};
