// TypeScript types for the cinematic documentary website

export type CelestialBody = 'moon' | 'mars';

export interface ComponentFeature {
  id: string;
  name: string;
  description: string;
  cameraOffset?: [number, number, number];
  focusPoint?: [number, number, number];
}

export interface EquipmentStageStory {
  stage: number;
  stageTitle: string;
  headline: string;
  body: string[];
  highlight?: string;
  quote?: string;
}

export interface EquipmentData {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  body: CelestialBody;
  locationName: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  launchDate: string;
  landingDate: string;
  operationalStatus: 'active' | 'retired' | 'silent' | 'still-working';
  statusDescription: string;
  equipmentType: string;
  modelKind: 'retroreflector' | 'lrv' | 'surveyor' | 'sojourner' | 'opportunity' | 'insight';
  modelPath?: string;
  scale: number;
  stages: {
    stage1_meet: EquipmentStageStory;
    stage2_mission: EquipmentStageStory;
    stage3_inside: EquipmentStageStory & {
      components: ComponentFeature[];
    };
    stage4_discoveries: EquipmentStageStory & {
      keyFindings: string[];
    };
    stage5_restingPlace: EquipmentStageStory;
    stage6_unfinishedQuestion: EquipmentStageStory;
  };
}

export interface LocationMarker {
  id: string;
  equipmentId: string;
  name: string;
  shortName: string;
  lat: number;
  lon: number;
  year: number;
  brief: string;
}
