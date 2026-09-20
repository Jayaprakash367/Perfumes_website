import React from 'react';
import { Sparkles, Heart, Feather } from 'lucide-react';

export default function FragrancePyramid({ topNotes, heartNotes, baseNotes }) {
  return (
    <div className="fragrance-pyramid">
      <div className="pyramid-tier tier-top">
        <div className="tier-header">
          <span className="tier-badge">
            <Sparkles size={14} className="tier-icon" /> Top Notes
          </span>
          <span className="tier-timeline">First 15 Minutes</span>
        </div>
        <p className="tier-notes">{topNotes || 'Bergamot, Citrus, Fresh Florals'}</p>
        <div className="tier-desc">The vibrant opening impression that greets the senses.</div>
      </div>

      <div className="pyramid-tier tier-heart">
        <div className="tier-header">
          <span className="tier-badge">
            <Heart size={14} className="tier-icon" /> Heart Notes
          </span>
          <span className="tier-timeline">2 - 4 Hours</span>
        </div>
        <p className="tier-notes">{heartNotes || 'Damask Rose, Jasmine, Spices'}</p>
        <div className="tier-desc">The true soul of the perfume, unfolding as the top notes settle.</div>
      </div>

      <div className="pyramid-tier tier-base">
        <div className="tier-header">
          <span className="tier-badge">
            <Feather size={14} className="tier-icon" /> Base Notes
          </span>
          <span className="tier-timeline">8 - 12+ Hours</span>
        </div>
        <p className="tier-notes">{baseNotes || 'Sandalwood, Amber, Rare Musk'}</p>
        <div className="tier-desc">The enduring foundation that lingers intimately on your skin.</div>
      </div>
    </div>
  );
}
