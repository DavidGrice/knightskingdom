import React, { useMemo } from 'react';
import { getChallengeBrickThumb } from '@/data/workshop/challengeBrickThumbs';
import styles from './WorkshopInstructionsPanel.module.css';

const STACK_Y_TOLERANCE = 0.35;

/**
 * Mini plate preview — arranges brick thumbs from target instances.
 * @param {{ step: import('@/data/workshop/workshopChallenges').ChallengeStep, targetInstances: BrickInstance[] }} props
 */
const InstructionStepPreview = ({ step, targetInstances }) => {
  const previewInstances = useMemo(() => {
    if (step.previewCount && step.previewCount > 0) {
      return targetInstances.slice(0, step.previewCount);
    }
    return [];
  }, [step.previewCount, targetInstances]);

  const focusThumb = getChallengeBrickThumb(step.focusBrickId);
  const showFocus = Boolean(focusThumb) && previewInstances.length === 0;
  const showBuild = previewInstances.length > 0;

  if (!showFocus && !showBuild) {
    return null;
  }

  if (showFocus) {
    return (
      <div className={styles.preview} data-testid="workshop-instructions-preview">
        <div className={styles.previewPlate}>
          <img
            src={focusThumb.src ?? focusThumb}
            alt={step.focusBrickId}
            className={styles.previewBrickSingle}
          />
        </div>
      </div>
    );
  }

  const minX = Math.min(...previewInstances.map((b) => b.position?.x ?? 0));
  const minY = Math.min(...previewInstances.map((b) => b.position?.y ?? 0));
  const isVerticalStack = previewInstances.length > 1
    && previewInstances.every((b) => Math.abs((b.position?.x ?? 0) - minX) < 0.2)
    && previewInstances.some((b) => (b.position?.y ?? 0) > minY + STACK_Y_TOLERANCE);

  return (
    <div className={styles.preview} data-testid="workshop-instructions-preview">
      <div
        className={isVerticalStack ? styles.previewPlateStack : styles.previewPlateRow}
        data-layout={isVerticalStack ? 'stack' : 'row'}
      >
        {previewInstances.map((instance, index) => {
          const thumb = getChallengeBrickThumb(instance.brickId);
          if (!thumb) {
            return null;
          }
          return (
            <img
              key={`${instance.brickId}-${index}`}
              src={thumb.src ?? thumb}
              alt={instance.brickId}
              className={styles.previewBrick}
              data-brick-id={instance.brickId}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InstructionStepPreview;