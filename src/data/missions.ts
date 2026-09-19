import type { MissionId, QuizMissionId, QuizQuestion } from './types';
import { homophones } from './homophones';
import { accords } from './accords';
import { verbes } from './verbes';

export interface MissionMeta {
  id: MissionId;
  emoji: string;
  title: string;
  navLabel: string;
  tagline: string;
  intro: string;
  color: 'violet' | 'pink' | 'blue' | 'mint';
}

export const missions: MissionMeta[] = [
  {
    id: 'homophones', emoji: '🧩', title: 'Le détective', navLabel: 'Homophones',
    tagline: 'Trouve le bon homophone.',
    intro: 'Ils se prononcent pareil mais ne s’écrivent pas pareil. Mène l’enquête !',
    color: 'violet',
  },
  {
    id: 'accords', emoji: '🎀', title: 'La reine des accords', navLabel: 'Accords',
    tagline: 'Accorde comme une pro.',
    intro: 'Masculin, féminin, singulier, pluriel : chaque mot doit être bien habillé.',
    color: 'pink',
  },
  {
    id: 'verbes', emoji: '⚡', title: 'Le labo des verbes', navLabel: 'Verbes',
    tagline: 'Maîtrise les temps.',
    intro: 'Hier, aujourd’hui, demain : repère les indices et choisis le bon temps.',
    color: 'blue',
  },
  {
    id: 'dictee', emoji: '🎧', title: 'Grande dictée', navLabel: 'Dictée',
    tagline: 'Écoute et écris.',
    intro: 'Écoute bien, écris tranquillement, puis corrige ta dictée.',
    color: 'mint',
  },
];

export const missionById = (id: MissionId) => missions.find((m) => m.id === id)!;

export const questionBank: Record<QuizMissionId, QuizQuestion[]> = { homophones, accords, verbes };

/** Nombre de questions par série. */
export const ROUND_SIZE = 10;
