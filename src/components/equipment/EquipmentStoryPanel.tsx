// The RIGHT SIDE storytelling panel for individual equipment exploration.
// Renders the 6 narrative stages with smooth reveals and interactive component highlights.
import React from 'react';
import { EquipmentData } from '../../data/types';
import {
  Sparkles,
  Compass,
  Calendar,
  Layers,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface EquipmentStoryPanelProps {
  equipment: EquipmentData;
  activeStage: number; // 1 to 6
  onChangeStage: (stage: number) => void;
  activeComponentIndex: number;
  onSelectComponent: (index: number) => void;
  onReturnToOverview: () => void;
  onNextEquipment: () => void;
  isLastEquipment: boolean;
}

const STAGE_NAMES = [
  '01 Meet',
  '02 Mission',
  '03 Inside',
  '04 Discoveries',
  '05 Resting Place',
  '06 Legacy',
];

export function EquipmentStoryPanel({
  equipment,
  activeStage,
  onChangeStage,
  activeComponentIndex,
  onSelectComponent,
  onReturnToOverview,
  onNextEquipment,
  isLastEquipment,
}: EquipmentStoryPanelProps) {
  const { stages } = equipment;

  return (
    <div className="equipment-story-panel" aria-label={`Story of ${equipment.name}`}>
      {/* Top Header with Status & Machine Category */}
      <div className="story-header">
        <div className="story-badges">
          <span className={`status-badge status-${equipment.operationalStatus}`}>
            {equipment.operationalStatus === 'still-working' ? (
              <CheckCircle2 size={12} className="badge-icon" />
            ) : (
              <AlertCircle size={12} className="badge-icon" />
            )}
            <span>{equipment.operationalStatus.replace('-', ' ').toUpperCase()}</span>
          </span>
          <span className="type-badge">{equipment.equipmentType}</span>
        </div>

        <h2 className="story-equipment-name">{equipment.name}</h2>
        <p className="story-equipment-subtitle">{equipment.subtitle}</p>
      </div>

      {/* Stage Navigation Pills */}
      <div className="stage-nav-bar" role="tablist">
        {STAGE_NAMES.map((name, idx) => {
          const stageNum = idx + 1;
          const isActive = activeStage === stageNum;
          return (
            <button
              key={name}
              role="tab"
              aria-selected={isActive}
              className={`stage-pill ${isActive ? 'active' : ''}`}
              onClick={() => onChangeStage(stageNum)}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Area for the 6 Stages */}
      <div className="story-stage-content">
        {/* ========================================================= */}
        {/* STAGE 01 — MEET THE EXPLORER */}
        {/* ========================================================= */}
        {activeStage === 1 && (
          <div className="stage-block animate-fade-in">
            <div className="stage-label">
              <Compass size={14} className="icon-gold" />
              <span>STAGE 01 · MEET THE EXPLORER</span>
            </div>
            <h3 className="stage-headline">{stages.stage1_meet.headline}</h3>
            {stages.stage1_meet.body.map((p, i) => (
              <p key={i} className="stage-paragraph">{p}</p>
            ))}
            {stages.stage1_meet.highlight && (
              <div className="stage-callout">
                <Sparkles size={16} className="callout-icon" />
                <span>{stages.stage1_meet.highlight}</span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 02 — THE MISSION */}
        {/* ========================================================= */}
        {activeStage === 2 && (
          <div className="stage-block animate-fade-in">
            <div className="stage-label">
              <Calendar size={14} className="icon-gold" />
              <span>STAGE 02 · THE MISSION</span>
            </div>
            <div className="mission-meta-grid">
              <div className="meta-item">
                <span className="meta-label">LAUNCH</span>
                <span className="meta-value">{equipment.launchDate}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">TOUCHDOWN</span>
                <span className="meta-value">{equipment.landingDate}</span>
              </div>
              <div className="meta-item full">
                <span className="meta-label">LANDING SITE</span>
                <span className="meta-value">{equipment.locationName}</span>
              </div>
            </div>
            <h3 className="stage-headline">{stages.stage2_mission.headline}</h3>
            {stages.stage2_mission.body.map((p, i) => (
              <p key={i} className="stage-paragraph">{p}</p>
            ))}
            {stages.stage2_mission.quote && (
              <blockquote className="mission-quote">{stages.stage2_mission.quote}</blockquote>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 03 — INSIDE THE MACHINE (ENGINEERING HIGHLIGHTS) */}
        {/* ========================================================= */}
        {activeStage === 3 && (
          <div className="stage-block animate-fade-in">
            <div className="stage-label">
              <Layers size={14} className="icon-gold" />
              <span>STAGE 03 · INSIDE THE MACHINE</span>
            </div>
            <h3 className="stage-headline">{stages.stage3_inside.headline}</h3>
            {stages.stage3_inside.body.map((p, i) => (
              <p key={i} className="stage-paragraph">{p}</p>
            ))}

            <div className="component-selector-title">EXPLORE PHYSICAL SUBSYSTEMS:</div>
            <div className="component-buttons-grid">
              {stages.stage3_inside.components.map((comp, idx) => (
                <button
                  key={comp.id}
                  className={`component-btn ${activeComponentIndex === idx ? 'selected' : ''}`}
                  onClick={() => onSelectComponent(idx)}
                >
                  <Eye size={14} />
                  <span>{comp.name}</span>
                </button>
              ))}
            </div>

            {stages.stage3_inside.components[activeComponentIndex] && (
              <div className="component-detail-card">
                <h4 className="component-detail-name">
                  {stages.stage3_inside.components[activeComponentIndex].name}
                </h4>
                <p className="component-detail-text">
                  {stages.stage3_inside.components[activeComponentIndex].description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 04 — WHAT IT DISCOVERED */}
        {/* ========================================================= */}
        {activeStage === 4 && (
          <div className="stage-block animate-fade-in">
            <div className="stage-label">
              <Sparkles size={14} className="icon-gold" />
              <span>STAGE 04 · WHAT IT DISCOVERED</span>
            </div>
            <h3 className="stage-headline">{stages.stage4_discoveries.headline}</h3>
            {stages.stage4_discoveries.body.map((p, i) => (
              <p key={i} className="stage-paragraph">{p}</p>
            ))}
            <div className="findings-list">
              {stages.stage4_discoveries.keyFindings.map((finding, idx) => (
                <div key={idx} className="finding-item">
                  <div className="finding-bullet" />
                  <span className="finding-text">{finding}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 05 — WHERE IT RESTS TODAY */}
        {/* ========================================================= */}
        {activeStage === 5 && (
          <div className="stage-block animate-fade-in">
            <div className="stage-label">
              <Compass size={14} className="icon-gold" />
              <span>STAGE 05 · WHERE IT RESTS TODAY</span>
            </div>
            <h3 className="stage-headline">{stages.stage5_restingPlace.headline}</h3>
            {stages.stage5_restingPlace.body.map((p, i) => (
              <p key={i} className="stage-paragraph">{p}</p>
            ))}
            <div className="status-report-box">
              <div className="report-row">
                <span className="report-label">COORDINATES:</span>
                <span className="report-value">
                  {equipment.coordinates.lat.toFixed(2)}°, {equipment.coordinates.lon.toFixed(2)}°
                </span>
              </div>
              <div className="report-row">
                <span className="report-label">CURRENT CONDITION:</span>
                <span className="report-value">{equipment.statusDescription}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 06 — THE UNFINISHED QUESTION */}
        {/* ========================================================= */}
        {activeStage === 6 && (
          <div className="stage-block animate-fade-in">
            <div className="stage-label">
              <HelpCircle size={14} className="icon-gold" />
              <span>STAGE 06 · THE UNFINISHED QUESTION</span>
            </div>
            <h3 className="stage-headline">{stages.stage6_unfinishedQuestion.headline}</h3>
            {stages.stage6_unfinishedQuestion.body.map((p, i) => (
              <p key={i} className="stage-paragraph">{p}</p>
            ))}
          </div>
        )}
      </div>

      {/* Stage Progression Footer */}
      <div className="story-footer-nav">
        {activeStage < 6 ? (
          <button className="stage-step-btn next" onClick={() => onChangeStage(activeStage + 1)}>
            <span>CONTINUE TO {STAGE_NAMES[activeStage]}</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <div className="story-completion-actions">
            <button className="stage-step-btn overview" onClick={onReturnToOverview}>
              <RotateCcw size={16} />
              <span>RETURN TO THREE-MODEL OVERVIEW</span>
            </button>
            <button className="stage-step-btn next" onClick={onNextEquipment}>
              <span>{isLastEquipment ? 'PROCEED TO NEXT CHAPTER' : 'EXPLORE NEXT EXPLORER'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
