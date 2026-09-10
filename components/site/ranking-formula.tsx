'use client'

import React from 'react'

export function RankingFormula() {
  return (
    <section style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #333' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>KSOP RANKING FORMULA</h3>
      <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>
        GPI 공개 산정 요소를 참고한 KSOP 랭킹 산정 방식
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Infographic flow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <FactorCard label="FINISH FACTOR" sub="Position → Factor" />
          <Arrow />
          <FactorCard label="FIELD FACTOR" sub="Field Size → Factor" />
          <Arrow />
          <FactorCard label="BUY-IN FACTOR" sub="Buy-In → Factor" />
          <Arrow />
          <FactorCard label="RECENCY FACTOR" sub="Date → Factor" />
        </div>

        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '1px' }}>EVENT SCORE</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '14px', color: '#999' }}>↓</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '1px' }}>BEST 10 RESULTS</span>
        </div>

        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <span style={{ fontSize: '14px', color: '#999' }}>↓</span>
        </div>

        <div style={{ textAlign: 'center', background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '16px 24px' }}>
          <span style={{ fontWeight: 700, fontSize: '22px', letterSpacing: '2px', color: '#fff' }}>
            KSOP RANKING SCORE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px' }}>
          <FactorDetail label="FINISH FACTOR" desc="Finish position drives the base score. Clamped before Math.pow to prevent NaN." />
          <FactorDetail label="FIELD FACTOR" desc="Derived from fieldSize. Larger fields increase score up to a cap." />
          <FactorDetail label="BUY-IN FACTOR" desc="Derived from buyIn amount. Higher stakes raise the score up to a cap." />
          <FactorDetail label="RECENCY FACTOR" desc="0-6mo = 1.0 · 6-12mo = 0.9 · 12-18mo = 0.75 · 18-24mo = 0.6 · >24mo = 0 · Invalid/missing = 0" />
        </div>
      </div>
    </section>
  )
}

function Arrow() {
  return (
    <span style={{ fontSize: '24px', color: '#555' }} aria-hidden="true">→</span>
  )
}

function FactorCard({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{ border: '1px solid #333', borderRadius: '10px', padding: '16px', minWidth: '140px', textAlign: 'center', background: '#0a0a0a' }}>
      <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '1px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: '#777' }}>{sub}</div>
    </div>
  )
}

function FactorDetail({ label, desc }: { label: string; desc: string }) {
  return (
    <div style={{ border: '1px solid #222', borderRadius: '10px', padding: '16px', background: '#0a0a0a' }}>
      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}
