/**
 * Unit tests — workshop challenge definitions + match evaluator.
 */
import { runUnitSuite, assert, assertEqual } from '../../lib/unitRunner.mjs';
import {
  WORKSHOP_CHALLENGES,
  getWorkshopChallengeById,
} from '../../../src/data/workshop/workshopChallenges.js';
import { evaluateChallengeMatch } from '../../../src/data/workshop/workshopChallengeMatch.js';

await runUnitSuite('workshop.unit.challenges', [
  {
    name: 'three challenges defined',
    fn: () => {
      assertEqual(WORKSHOP_CHALLENGES.length, 3);
    },
  },
  {
    name: 'getWorkshopChallengeById resolves stacked wall',
    fn: () => {
      const c = getWorkshopChallengeById('c5-stacked-wall');
      assert(c, 'challenge missing');
      assertEqual(c.targetInstances.length, 2);
      assertEqual(c.steps.length, 3);
      assert(c.steps[0].focusBrickId === 'c5_2x4', 'first step focus brick');
      assertEqual(c.steps[2].previewCount, 2);
    },
  },
  {
    name: 'evaluateChallengeMatch — exact target passes',
    fn: () => {
      const target = WORKSHOP_CHALLENGES[0].targetInstances;
      const result = evaluateChallengeMatch(target, target);
      assertEqual(result.complete, true);
      assertEqual(result.matched, 2);
    },
  },
  {
    name: 'evaluateChallengeMatch — partial build fails',
    fn: () => {
      const target = WORKSHOP_CHALLENGES[0].targetInstances;
      const partial = [target[0]];
      const result = evaluateChallengeMatch(partial, target);
      assertEqual(result.complete, false);
      assertEqual(result.matched, 1);
    },
  },
  {
    name: 'evaluateChallengeMatch — position tolerance',
    fn: () => {
      const target = WORKSHOP_CHALLENGES[1].targetInstances;
      const shifted = [{
        ...target[0],
        position: { x: 0.2, y: 0.1, z: -0.2 },
      }];
      const result = evaluateChallengeMatch(shifted, target);
      assertEqual(result.complete, true);
    },
  },
]);