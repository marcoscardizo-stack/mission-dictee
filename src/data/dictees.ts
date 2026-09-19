import type { DictationLevel, DictationText } from './types';

export const LEVELS: { id: DictationLevel; emoji: string; label: string }[] = [
  { id: 'facile', emoji: '🌱', label: 'Facile' },
  { id: 'moyen', emoji: '🌼', label: 'Moyen' },
  { id: 'champion', emoji: '🌟', label: 'Champion' },
];

export const dictees: DictationText[] = [
  {
    id: 'f1', level: 'facile', title: 'Le jardin',
    text: 'Ce matin, Léa se promène dans le jardin. Elle regarde les fleurs et écoute les oiseaux. Le soleil brille doucement.',
  },
  {
    id: 'f2', level: 'facile', title: 'Mon chat',
    text: 'Mon chat dort sur le canapé. Il ronronne quand je le caresse. Il est tout doux.',
  },
  {
    id: 'f3', level: 'facile', title: 'Le petit-déjeuner',
    text: 'Le matin, je prends mon petit-déjeuner. Je bois du lait et je mange une tartine.',
  },
  {
    id: 'm1', level: 'moyen', title: 'Après l’école',
    text: 'Après l’école, Camille retrouve ses amis devant la bibliothèque. Ils discutent quelques minutes, puis ils rentrent tranquillement à la maison.',
  },
  {
    id: 'm2', level: 'moyen', title: 'À la mer',
    text: 'Pendant les vacances, nous sommes partis à la mer. Chaque jour, nous nagions et nous construisions des châteaux de sable.',
  },
  {
    id: 'm3', level: 'moyen', title: 'Le potager',
    text: 'Mon grand-père cultive des tomates dans son potager. Il les arrose chaque soir, et elles deviennent rouges et sucrées.',
  },
  {
    id: 'c1', level: 'champion', title: 'Après la pluie',
    text: 'Lorsque la pluie s’arrête, les enfants sortent dans la cour. Les petites feuilles brillent encore et les oiseaux commencent à chanter dans les grands arbres.',
  },
  {
    id: 'c2', level: 'champion', title: 'L’école d’autrefois',
    text: 'Autrefois, les enfants allaient à l’école à pied, même quand il neigeait. Ils portaient de lourdes sacoches et écrivaient avec une plume.',
  },
  {
    id: 'c3', level: 'champion', title: 'La grenouille',
    text: 'Au bord de l’étang, une grenouille verte attendait patiemment. Soudain, elle bondit et attrapa une mouche qui passait près d’elle.',
  },
];

export const dicteesByLevel = (level: DictationLevel) => dictees.filter((d) => d.level === level);
