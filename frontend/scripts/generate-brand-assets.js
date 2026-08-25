const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brandDir = path.resolve(__dirname, '../public/brand');
const logoDir = path.join(brandDir, 'logo');
const socialDir = path.join(brandDir, 'social');
const bgDir = path.join(brandDir, 'background');

[logoDir, socialDir, bgDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── 1. SVG LOGOS ──────────────────────────────────────────

// Mark SVG
const markSvg = `<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="128" cy="128" r="118" stroke="#C8953A" stroke-width="12" stroke-opacity="0.25" />
  <path d="M128 36C77.19 36 36 77.19 36 128C36 178.81 77.19 220 128 220" stroke="#C8953A" stroke-width="16" stroke-linecap="round" />
  <circle cx="128" cy="128" r="36" fill="#C8953A" />
  <circle cx="128" cy="64" r="18" fill="#F8F6F2" fill-opacity="0.9" />
</svg>`;

// Primary Logo (Mark + Wordmark)
const primaryLogoSvg = `<svg width="600" height="160" viewBox="0 0 600 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(20, 20)">
    <circle cx="60" cy="60" r="55" stroke="#C8953A" stroke-width="6" stroke-opacity="0.25" />
    <path d="M60 17C36.25 17 17 36.25 17 60C17 83.75 36.25 103 60 103" stroke="#C8953A" stroke-width="8" stroke-linecap="round" />
    <circle cx="60" cy="60" r="17" fill="#C8953A" />
    <circle cx="60" cy="30" r="8" fill="#F8F6F2" fill-opacity="0.9" />
  </g>
  <text x="170" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="0.12em" fill="#F8F6F2">AUREN</text>
  <text x="172" y="128" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" letter-spacing="0.25em" fill="#C8953A">ARC TESTNET</text>
</svg>`;

// White Logo
const whiteLogoSvg = `<svg width="600" height="160" viewBox="0 0 600 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(20, 20)">
    <circle cx="60" cy="60" r="55" stroke="#FFFFFF" stroke-width="6" stroke-opacity="0.3" />
    <path d="M60 17C36.25 17 17 36.25 17 60C17 83.75 36.25 103 60 103" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" />
    <circle cx="60" cy="60" r="17" fill="#FFFFFF" />
    <circle cx="60" cy="30" r="8" fill="#FFFFFF" fill-opacity="0.9" />
  </g>
  <text x="170" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="0.12em" fill="#FFFFFF">AUREN</text>
</svg>`;

// Black Logo
const blackLogoSvg = `<svg width="600" height="160" viewBox="0 0 600 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(20, 20)">
    <circle cx="60" cy="60" r="55" stroke="#0A0D14" stroke-width="6" stroke-opacity="0.3" />
    <path d="M60 17C36.25 17 17 36.25 17 60C17 83.75 36.25 103 60 103" stroke="#0A0D14" stroke-width="8" stroke-linecap="round" />
    <circle cx="60" cy="60" r="17" fill="#0A0D14" />
    <circle cx="60" cy="30" r="8" fill="#0A0D14" fill-opacity="0.9" />
  </g>
  <text x="170" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="0.12em" fill="#0A0D14">AUREN</text>
</svg>`;

fs.writeFileSync(path.join(logoDir, 'auren-logo-mark.svg'), markSvg);
fs.writeFileSync(path.join(logoDir, 'auren-logo-primary.svg'), primaryLogoSvg);
fs.writeFileSync(path.join(logoDir, 'auren-logo-white.svg'), whiteLogoSvg);
fs.writeFileSync(path.join(logoDir, 'auren-logo-black.svg'), blackLogoSvg);

console.log('✓ Wrote SVG logos');

// ── 2. SOCIAL & GRAPHIC ASSETS ────────────────────────────

// X Profile (400x400 PNG)
const xProfileSvg = `<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#0A0D14" />
  <circle cx="200" cy="200" r="140" stroke="#C8953A" stroke-width="10" stroke-opacity="0.2" />
  <path d="M200 90C139.25 90 90 139.25 90 200C90 260.75 139.25 310 200 310" stroke="#C8953A" stroke-width="14" stroke-linecap="round" />
  <circle cx="200" cy="200" r="42" fill="#C8953A" />
  <circle cx="200" cy="125" r="20" fill="#F8F6F2" fill-opacity="0.95" />
</svg>`;

// X Header (1500x500 PNG)
const xHeaderSvg = `<svg width="1500" height="500" viewBox="0 0 1500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C8953A" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#0A0D14" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C8953A" stop-opacity="0" />
      <stop offset="50%" stop-color="#C8953A" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#C8953A" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="1500" height="500" fill="#0A0D14" />
  <rect width="1500" height="500" fill="url(#bgGlow)" />

  <!-- Subtle Agent Connection Grid Lines -->
  <path d="M0 250 H1500" stroke="url(#lineGrad)" stroke-width="1.5" />
  <circle cx="750" cy="250" r="160" stroke="#C8953A" stroke-width="2" stroke-opacity="0.15" stroke-dasharray="4 8" />

  <!-- Centered Branding -->
  <g transform="translate(685, 120)">
    <circle cx="65" cy="65" r="55" stroke="#C8953A" stroke-width="5" stroke-opacity="0.25" />
    <path d="M65 20C40.15 20 20 40.15 20 65C20 89.85 40.15 110 65 110" stroke="#C8953A" stroke-width="7" stroke-linecap="round" />
    <circle cx="65" cy="65" r="18" fill="#C8953A" />
    <circle cx="65" cy="35" r="9" fill="#F8F6F2" fill-opacity="0.9" />
  </g>

  <text x="750" y="320" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" letter-spacing="0.18em" fill="#F8F6F2">AUREN</text>
  <text x="750" y="365" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" letter-spacing="0.12em" fill="#C8953A">THE ECONOMIC LAYER FOR AUTONOMOUS APPLICATIONS</text>
  <text x="750" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" letter-spacing="0.25em" fill="#8A8F9E">ARC TESTNET</text>
</svg>`;

// OG Image (1200x630 PNG)
const ogImageSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ogGlow" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#C8953A" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0A0D14" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C8953A" />
      <stop offset="100%" stop-color="#E2B768" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0D14" />
  <rect width="1200" height="630" fill="url(#ogGlow)" />

  <!-- Decorative Flow Line -->
  <path d="M100 520 Q 400 500, 600 520 T 1100 480" stroke="#C8953A" stroke-opacity="0.2" stroke-width="2" fill="none" />

  <!-- Left Aligned Brand Box -->
  <g transform="translate(100, 110)">
    <!-- Logo Mark -->
    <circle cx="45" cy="45" r="42" stroke="#C8953A" stroke-width="4" stroke-opacity="0.25" />
    <path d="M45 10C25.67 10 10 25.67 10 45C10 64.33 25.67 80 45 80" stroke="#C8953A" stroke-width="5.5" stroke-linecap="round" />
    <circle cx="45" cy="45" r="14" fill="#C8953A" />
    <circle cx="45" cy="22" r="7" fill="#F8F6F2" fill-opacity="0.9" />

    <text x="110" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="800" letter-spacing="0.15em" fill="#F8F6F2">AUREN</text>
  </g>

  <!-- Main Headlines -->
  <text x="100" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700" letter-spacing="-0.02em" fill="#F8F6F2">The economic layer for</text>
  <text x="100" y="335" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700" letter-spacing="-0.02em" fill="url(#goldText)">autonomous applications.</text>

  <text x="100" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#8A8F9E">Fund growth. Enable agents.</text>

  <!-- Bottom Status Pill -->
  <g transform="translate(100, 480)">
    <rect width="180" height="42" rx="21" fill="rgba(200,149,58,0.12)" stroke="#C8953A" stroke-opacity="0.3" />
    <circle cx="24" cy="21" r="5" fill="#C8953A" />
    <text x="38" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" letter-spacing="0.12em" fill="#F8F6F2">ARC TESTNET</text>
  </g>

  <g transform="translate(300, 480)">
    <rect width="250" height="42" rx="21" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <text x="24" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#8A8F9E">ERC-4337 + Mudarabah</text>
  </g>
</svg>`;

// Hero Background (1920x1080 PNG)
const heroBgSvg = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="heroGlow1" cx="50%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#C8953A" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#0A0D14" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="flow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C8953A" stop-opacity="0" />
      <stop offset="50%" stop-color="#C8953A" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#C8953A" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="#0A0D14" />
  <rect width="1920" height="1080" fill="url(#heroGlow1)" />
  <path d="M0 400 Q 480 300, 960 400 T 1920 350" stroke="url(#flow1)" stroke-width="2" fill="none" />
  <path d="M0 650 Q 480 750, 960 650 T 1920 700" stroke="url(#flow1)" stroke-width="1.5" fill="none" />
</svg>`;

// Profile Background (1920x1080 PNG)
const profileBgSvg = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C8953A" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#0A0D14" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="#0A0D14" />
  <rect width="1920" height="1080" fill="url(#pGlow)" />
  <circle cx="960" cy="540" r="400" stroke="#C8953A" stroke-width="1" stroke-opacity="0.08" stroke-dasharray="6 12" />
</svg>`;

async function renderPngs() {
  await sharp(Buffer.from(xProfileSvg)).png().toFile(path.join(socialDir, 'auren-x-profile.png'));
  console.log('✓ Generated social/auren-x-profile.png (400x400)');

  await sharp(Buffer.from(xHeaderSvg)).png().toFile(path.join(socialDir, 'auren-x-header.png'));
  console.log('✓ Generated social/auren-x-header.png (1500x500)');

  await sharp(Buffer.from(ogImageSvg)).png().toFile(path.join(socialDir, 'auren-og-image.png'));
  console.log('✓ Generated social/auren-og-image.png (1200x630)');

  await sharp(Buffer.from(heroBgSvg)).png().toFile(path.join(bgDir, 'auren-hero-background.png'));
  console.log('✓ Generated background/auren-hero-background.png (1920x1080)');

  await sharp(Buffer.from(profileBgSvg)).png().toFile(path.join(bgDir, 'auren-profile-background.png'));
  console.log('✓ Generated background/auren-profile-background.png (1920x1080)');
}

renderPngs().catch(e => {
  console.error('Error rendering PNGs:', e);
  process.exit(1);
});
