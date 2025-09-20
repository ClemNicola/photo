import { atom } from 'nanostores';

// Store pour suivre si l'animation de scramble text a été jouée
// Utilise une variable en mémoire qui se reset automatiquement lors d'un hard refresh
// mais persiste lors de la navigation SPA
let hasPlayedInMemory = false;

const getInitialState = () => {
  return hasPlayedInMemory;
};

export const hasTextAnimated = atom(getInitialState());

hasTextAnimated.subscribe((value) => {
  hasPlayedInMemory = value;
});
