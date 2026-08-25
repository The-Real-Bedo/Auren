'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClosingFramePage() {
  const [animKey, setAnimKey] = useState<number>(0);

  const restartAnimation = () => {
    setAnimKey((prev) => prev + 1);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07080A',
        color: '#F8F6F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Control bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: 1080,
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-gold">Launch Video Asset</span>
          <span className="text-sm text-muted">16:9 Twitter/X Video Frame</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={restartAnimation} className="btn btn-gold btn-sm">
            ↺ Replay Animation (2s)
          </button>
          <Link href="/" className="btn btn-outline-white btn-sm">
            ← Return to Homepage
          </Link>
        </div>
      </div>

      {/* 16:9 Cinematic Video Frame Container */}
      <div
        key={animKey}
        style={{
          width: '100%',
          maxWidth: 1080,
          aspectRatio: '16 / 9',
          background: 'radial-gradient(ellipse at 50% 45%, #14171D 0%, #0B0C0E 70%, #07080A 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(200, 149, 58, 0.06)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Subtle Ambient Background Energy Gradient */}
        <div
          style={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200, 149, 58, 0.09) 0%, rgba(200, 149, 58, 0) 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -55%)',
            pointerEvents: 'none',
            filter: 'blur(30px)',
          }}
        />

        {/* 1. Flow / Energy Line SVG Animation (Starts at 0.0s) */}
        <svg
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
          viewBox="0 0 1920 1080"
          fill="none"
        >
          <defs>
            <linearGradient id="goldFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8953A" stopOpacity="0" />
              <stop offset="35%" stopColor="#C8953A" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#E2B765" stopOpacity="0.8" />
              <stop offset="65%" stopColor="#C8953A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C8953A" stopOpacity="0" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Primary Motion Flow Wave */}
          <path
            d="M 200 680 Q 640 760 960 620 T 1720 660"
            stroke="url(#goldFlowGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#goldGlow)"
            style={{
              strokeDasharray: 1800,
              strokeDashoffset: 1800,
              animation: 'flowStroke 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />

          {/* Secondary Delicate Orbit */}
          <circle
            cx="960"
            cy="470"
            r="160"
            stroke="#C8953A"
            strokeWidth="1"
            strokeOpacity="0.2"
            strokeDasharray="4 8"
            style={{
              animation: 'orbitFadeIn 1.4s ease-out 0.2s forwards',
              opacity: 0,
            }}
          />
        </svg>

        {/* Centered Typography Composition */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo Brand Emblem & Title (Fades in at 0.35s) */}
          <div
            style={{
              opacity: 0,
              animation: 'heroTitleEntry 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            {/* Minimalist Gold Mark */}
            <div style={{ marginBottom: '1.25rem' }}>
              <svg width="44" height="44" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="#C8953A" strokeWidth="1.2" strokeOpacity="0.4" />
                <path
                  d="M14 4C8.477 4 4 8.477 4 14C4 19.523 8.477 24 14 24"
                  stroke="#C8953A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="14" cy="14" r="4" fill="#C8953A" />
                <circle cx="14" cy="7" r="2" fill="#F8F6F2" fillOpacity="0.8" />
              </svg>
            </div>

            {/* Wordmark */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#F8F6F2',
                margin: 0,
                lineHeight: 1,
              }}
            >
              Auren
            </h1>
          </div>

          {/* Subtitle: Arc Testnet (Fades in at 0.7s) */}
          <div
            style={{
              opacity: 0,
              animation: 'subtitleEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C8953A',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Arc Testnet
            </div>
          </div>

          {/* Tagline: Fund growth. Enable agents. (Fades in at 1.0s) */}
          <div
            style={{
              opacity: 0,
              animation: 'taglineEntry 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.0s forwards',
            }}
          >
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)',
                fontWeight: 400,
                letterSpacing: '0.04em',
                color: 'rgba(248, 246, 242, 0.65)',
                margin: 0,
              }}
            >
              Fund growth. Enable agents.
            </p>
          </div>
        </div>

        {/* Global Keyframe Styles for 2s Timeline */}
        <style jsx>{`
          @keyframes flowStroke {
            0% {
              stroke-dashoffset: 1800;
              opacity: 0;
            }
            30% {
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0.9;
            }
          }

          @keyframes orbitFadeIn {
            0% {
              opacity: 0;
              transform: scale(0.85);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes heroTitleEntry {
            0% {
              opacity: 0;
              transform: translateY(18px) scale(0.97);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes subtitleEntry {
            0% {
              opacity: 0;
              transform: translateY(12px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes taglineEntry {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      {/* Specifications & Asset Details */}
      <div
        style={{
          width: '100%',
          maxWidth: 1080,
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          { label: 'Resolution', value: '1920 × 1080 (16:9 Full HD)' },
          { label: 'Framerate & Duration', value: '60 FPS · 2.5s Closing Card' },
          { label: 'Typography', value: 'AUREN / Arc Testnet / Fund growth. Enable agents.' },
          { label: 'Video Export', value: 'auren_launch_closing_frame.mp4 (H.264)' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'rgba(248, 246, 242, 0.4)', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F8F6F2' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
