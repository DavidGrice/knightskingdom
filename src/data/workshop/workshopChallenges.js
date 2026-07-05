/**
 * Workshop challenge tutorials (D5) — target builds + step-by-step instructions.
 * Bucket tab 9 (challenges) loads these instead of individual brick picks.
 */

/** @typedef {{ brickId: string, position: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }, color?: string }} BrickInstance */

/** @typedef {{ id: string, name: string, image: import('react').StaticImageData | string, instructions: string[], starterInstances: BrickInstance[], targetInstances: BrickInstance[] }} WorkshopChallenge */

/** @type {WorkshopChallenge[]} */
export const WORKSHOP_CHALLENGES = [
  {
    id: 'c5-stacked-wall',
    name: 'Stacked 2×4 Wall',
    instructions: [
      'Open the Basic tab and select the yellow 2×4 challenge brick.',
      'Place one brick on the yellow plate.',
      'Stack a second identical brick directly on top.',
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
    instructions: [
      'Find the challenge door in the Challenges brick tab (Basic category has parts too).',
      'Place the door upright on the centre of the yellow plate.',
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
    instructions: [
      'Place the challenge door on the left side of the plate.',
      'Place the challenge window one stud spacing to the right of the door.',
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

/** @param {string} id */
export const getWorkshopChallengeById = (id) => (
  WORKSHOP_CHALLENGES.find((c) => c.id === id) ?? null
);