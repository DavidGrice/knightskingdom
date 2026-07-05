/**
 * Workshop challenge tutorials (D5) — target builds + step-by-step instructions.
 * Bucket tab 9 (challenges) loads these instead of individual brick picks.
 */

/** @typedef {{ brickId: string, position: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }, color?: string }} BrickInstance */

/**
 * @typedef {Object} ChallengeStep
 * @property {string} text
 * @property {string} [focusBrickId] — highlight a bucket brick thumbnail (pick step)
 * @property {number} [previewCount] — show first N target bricks in the build preview
 */

/**
 * @typedef {Object} WorkshopChallenge
 * @property {string} id
 * @property {string} name
 * @property {ChallengeStep[]} steps
 * @property {BrickInstance[]} starterInstances
 * @property {BrickInstance[]} targetInstances
 */

/** @type {WorkshopChallenge[]} */
export const WORKSHOP_CHALLENGES = [
  {
    id: 'c5-stacked-wall',
    name: 'Stacked 2×4 Wall',
    steps: [
      {
        text: 'Open the Basic tab and select the yellow 2×4 challenge brick.',
        focusBrickId: 'c5_2x4',
      },
      {
        text: 'Place one brick on the yellow plate.',
        previewCount: 1,
      },
      {
        text: 'Stack a second identical brick directly on top.',
        previewCount: 2,
      },
    ],
    starterInstances: [],
    targetInstances: [
      {
        brickId: 'c5_2x4',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        color: 'eac000',
      },
      {
        brickId: 'c5_2x4',
        position: { x: 0, y: 0.8, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        color: 'eac000',
      },
    ],
  },
  {
    id: 'c5-door-frame',
    name: 'Challenge Door',
    steps: [
      {
        text: 'Find the challenge door in the Challenges brick tab.',
        focusBrickId: 'c5_door',
      },
      {
        text: 'Place the door upright on the centre of the yellow plate.',
        previewCount: 1,
      },
    ],
    starterInstances: [],
    targetInstances: [
      {
        brickId: 'c5_door',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        color: 'b80000',
      },
    ],
  },
  {
    id: 'c5-door-and-window',
    name: 'Door + Window',
    steps: [
      {
        text: 'Place the challenge door on the left side of the plate.',
        focusBrickId: 'c5_door',
        previewCount: 1,
      },
      {
        text: 'Place the challenge window one stud spacing to the right of the door.',
        focusBrickId: 'c5_window',
        previewCount: 2,
      },
    ],
    starterInstances: [],
    targetInstances: [
      {
        brickId: 'c5_door',
        position: { x: -1.6, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        color: 'b80000',
      },
      {
        brickId: 'c5_window',
        position: { x: 1.6, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        color: '3080c0',
      },
    ],
  },
];

/** Flat instruction strings (legacy helper for tests / logging). */
export const getChallengeInstructionTexts = (challenge) => (
  challenge?.steps?.map((step) => step.text) ?? []
);

/** @param {string} id */
export const getWorkshopChallengeById = (id) => (
  WORKSHOP_CHALLENGES.find((c) => c.id === id) ?? null
);