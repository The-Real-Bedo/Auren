'use client';
import Link from 'next/link';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID } from '../../config/contracts';

const config = CONTRACTS[ARC_TESTNET_CHAIN_ID];

export default function ExplorePage() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--paper)' }}>
      <div style={{ background: 'var(--ink)', padding: '4rem 0 3rem' }}>
        <div className="container">
          <span className="badge badge-arc" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Arc Testnet</span>
          <h1 className="text-headline" style={{ color: 'var(--paper)', marginBottom: '0.75rem' }}>Explore DApp Opportunities</h1>
          <p className="text-body" style={{ color: 'rgba(245,243,239,0.55)', maxWidth: 520 }}>
            Browse active DApp ventures available for capital participation. Due diligence is your responsibility.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        {/* Demo DApp card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: 720 }}>
          <div style={{ height: 6, background: 'linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 100%)' }} />
          <div style={{ padding: '2rem 2rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Demo Digital Marketplace</h2>
                  <span className="badge badge-green">Active</span>
                </div>
                <p className="text-sm text-muted">
                  A demonstration digital goods marketplace on Arc Testnet. Sponsored purchases flow through Auren's capital infrastructure.
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>50%</div>
                <div className="text-xs text-muted">LP profit share</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: 'var(--ink-10)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              {[
                { label: 'Status', value: 'Testnet' },
                { label: 'Profit Share', value: '50 / 50' },
                { label: 'Capital Type', value: 'Native USDC' },
                { label: 'Recovery', value: 'Revenue-first' },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '0.875rem 1rem', background: 'var(--paper)' }}>
                  <div className="stat-label" style={{ marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Growth thesis */}
            <div className="card-inset" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Growth Thesis</div>
              <p className="text-sm text-muted">
                Eliminating gas friction at point-of-purchase converts hesitant users into paying customers. Each sponsored transaction can be recovered from item sale revenue, creating a sustainable acquisition flywheel.
              </p>
            </div>

            {/* Risk section */}
            <div className="card-inset" style={{ padding: '1.25rem', background: 'var(--red-bg)', borderColor: '#E8C0BD', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--red)', marginBottom: '0.5rem' }}>⚠ Risk Disclosure</div>
              <p className="text-sm" style={{ color: 'var(--red)' }}>
                This is a testnet demonstration. Deployed capital funds real user sponsorships and may not be recovered if DApp revenue is insufficient. No guaranteed returns. Capital is at risk. No interest or fixed yield. Profit-sharing model subject to qualified Sharia scholar review.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/invest" className="btn btn-gold">Provide Capital</Link>
              <Link href="/demo" className="btn btn-outline btn-sm">Try the DApp</Link>
            </div>
          </div>
          <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--ink-10)', background: 'var(--paper)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="text-xs text-subtle">Vault: <span className="text-mono">{config.vault}</span></span>
          </div>
        </div>

        <p className="text-sm text-subtle" style={{ marginTop: '2rem' }}>
          Additional DApp opportunities will appear here as they register on the Auren network.
        </p>
      </div>
    </div>
  );
}
