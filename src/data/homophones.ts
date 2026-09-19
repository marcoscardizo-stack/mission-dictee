import type { QuizQuestion } from './types';

type Raw = [tag: string, sentence: string, choices: string[], answer: string, explanation: string];

const raw: Raw[] = [
  // a / à / as
  ['a / à / as', 'Paul ___ son cahier.', ['a', 'à', 'as'], 'a',
    'Remplace par « avait » : « Paul avait son cahier. » Ça marche, donc c’est le verbe avoir : a, sans accent.'],
  ['a / à / as', 'Nous partons ___ la plage.', ['a', 'à', 'as'], 'à',
    '« Nous partons avait la plage » ne veut rien dire : c’est la préposition à, avec un accent grave.'],
  ['a / à / as', 'Tu ___ un joli sac.', ['a', 'à', 'as'], 'as',
    'Avec « tu », le verbe avoir s’écrit as : « Tu avais un joli sac. »'],
  ['a / à / as', 'Léa ___ faim après le sport.', ['a', 'à', 'as'], 'a',
    '« Léa avait faim » : on peut dire avait, donc on écrit a (verbe avoir).'],
  ['a / à / as', 'Il écrit ___ sa grand-mère.', ['a', 'à', 'as'], 'à',
    '« Il écrit avait sa grand-mère » ne fonctionne pas : c’est la préposition à.'],
  ['a / à / as', 'Est-ce que tu ___ fini tes devoirs ?', ['a', 'à', 'as'], 'as',
    'Le sujet est « tu » : tu as fini (tu avais fini). Le s va avec tu.'],
  ['a / à / as', 'Le gâteau ___ la fraise est délicieux.', ['a', 'à', 'as'], 'à',
    'On ne peut pas dire « le gâteau avait la fraise » : ici, à introduit le parfum. Préposition à.'],
  ['a / à / as', 'Il y ___ un oiseau sur le toit.', ['a', 'à', 'as'], 'a',
    '« Il y avait un oiseau » : on peut dire avait, donc c’est a sans accent.'],
  ['a / à / as', 'C’est ___ toi de jouer !', ['a', 'à', 'as'], 'à',
    '« C’est avait toi » ne veut rien dire : c’est la préposition à.'],

  // et / est / es
  ['et / est / es', 'Le ciel ___ bleu.', ['et', 'est', 'es'], 'est',
    'Remplace par « était » : « Le ciel était bleu. » C’est le verbe être : est.'],
  ['et / est / es', 'Tom ___ Inès jouent ensemble.', ['et', 'est', 'es'], 'et',
    'On peut dire « Tom et puis Inès » : et relie deux mots. C’est une conjonction.'],
  ['et / est / es', 'Tu ___ très courageuse.', ['et', 'est', 'es'], 'es',
    'Avec « tu », le verbe être s’écrit es : « Tu étais très courageuse. »'],
  ['et / est / es', 'Il prend son sac ___ il part.', ['et', 'est', 'es'], 'et',
    '« Il prend son sac et puis il part » : et relie deux actions.'],
  ['et / est / es', 'Ma sœur ___ en vacances.', ['et', 'est', 'es'], 'est',
    '« Ma sœur était en vacances » : on peut dire était, donc c’est est.'],
  ['et / est / es', 'Tu ___ en retard ce matin !', ['et', 'est', 'es'], 'es',
    'Le sujet est « tu » : tu es (tu étais). Verbe être avec tu = es.'],

  // son / sont
  ['son / sont', 'Les chats ___ dans le jardin.', ['son', 'sont'], 'sont',
    'Remplace par « étaient » : « Les chats étaient dans le jardin. » C’est le verbe être : sont.'],
  ['son / sont', 'Hugo range ___ vélo.', ['son', 'sont'], 'son',
    'Remplace par « mon » : « Hugo range mon vélo. » Le vélo est à lui : son.'],
  ['son / sont', 'Mes parents ___ fiers de moi.', ['son', 'sont'], 'sont',
    '« Mes parents étaient fiers » : on peut dire étaient, donc c’est sont.'],
  ['son / sont', 'Elle a perdu ___ bonnet.', ['son', 'sont'], 'son',
    '« Elle a perdu mon bonnet » fonctionne : c’est le déterminant son (le bonnet à elle).'],

  // ses / ces
  ['ses / ces', 'Regarde ___ nuages dans le ciel !', ['ses', 'ces'], 'ces',
    'On montre les nuages : on peut dire « ces nuages-là ». Ces sert à montrer.'],
  ['ses / ces', 'Nina prête ___ crayons à Tom.', ['ses', 'ces'], 'ses',
    'Les crayons sont à Nina : on peut dire « les siens ». Ses indique à qui ils appartiennent.'],
  ['ses / ces', 'Le chien retrouve ___ jouets.', ['ses', 'ces'], 'ses',
    'Les jouets sont au chien (les siens) : on écrit ses.'],
  ['ses / ces', '___ fleurs sentent très bon.', ['Ses', 'Ces'], 'Ces',
    'On montre des fleurs : « ces fleurs-là ». Ces est un déterminant démonstratif.'],

  // ce / se
  ['ce / se', 'Il ___ lave les mains.', ['ce', 'se'], 'se',
    'Conjugue avec « je » : « je me lave » → « il se lave ». Se accompagne un verbe.'],
  ['ce / se', '___ livre est passionnant.', ['Ce', 'Se'], 'Ce',
    'On peut dire « ce livre-là » : ce montre un nom.'],
  ['ce / se', 'Les enfants ___ cachent derrière l’arbre.', ['ce', 'se'], 'se',
    '« Nous nous cachons » → « ils se cachent » : se accompagne le verbe cacher.'],
  ['ce / se', 'J’aime beaucoup ___ dessin.', ['ce', 'se'], 'ce',
    '« Ce dessin-là » : ce est placé devant un nom pour le montrer.'],

  // on / ont
  ['on / ont', 'Mes cousins ___ un chien.', ['on', 'ont'], 'ont',
    'Remplace par « avaient » : « Mes cousins avaient un chien. » Verbe avoir : ont.'],
  ['on / ont', '___ va au cinéma ce soir ?', ['On', 'Ont'], 'On',
    'Remplace par « il » : « Il va au cinéma. » C’est le pronom on.'],
  ['on / ont', 'Ils ___ gagné le match.', ['on', 'ont'], 'ont',
    '« Ils avaient gagné » : on peut dire avaient, donc c’est ont.'],
  ['on / ont', 'Le samedi, ___ fait des crêpes.', ['on', 'ont'], 'on',
    '« Le samedi, il fait des crêpes » fonctionne : c’est le pronom on.'],

  // ou / où
  ['ou / où', 'Tu préfères le chocolat ___ la vanille ?', ['ou', 'où'], 'ou',
    'Remplace par « ou bien » : c’est un choix, donc ou sans accent.'],
  ['ou / où', '___ as-tu rangé tes chaussures ?', ['Ou', 'Où'], 'Où',
    'On demande un lieu : où prend un accent grave.'],
  ['ou / où', 'Je sais ___ se cache le trésor.', ['ou', 'où'], 'où',
    '« Ou bien se cache » ne veut rien dire : on parle d’un endroit, donc où.'],
  ['ou / où', 'Veux-tu du jus ___ de l’eau ?', ['ou', 'où'], 'ou',
    '« Du jus ou bien de l’eau » : c’est un choix, ou sans accent.'],
];

export const homophones: QuizQuestion[] = raw.map(([tag, sentence, choices, answer, explanation], i) => ({
  id: `h${i + 1}`,
  tag,
  sentence,
  choices,
  answer,
  explanation,
}));
