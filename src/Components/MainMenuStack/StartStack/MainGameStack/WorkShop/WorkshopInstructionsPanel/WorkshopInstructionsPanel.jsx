import React, { useEffect, useState } from 'react';
import InstructionStepPreview from './InstructionStepPreview';
import styles from './WorkshopInstructionsPanel.module.css';

const WorkshopInstructionsPanel = ({
  challenge,
  match,
  onDismiss,
  onCheck,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
  }, [challenge?.id]);

  if (!challenge) {
    return null;
  }

  const steps = challenge.steps ?? [];
  const currentStep = steps[stepIndex] ?? steps[0];
  const stepCount = steps.length;
  const { matched, total, complete } = match ?? { matched: 0, total: 0, complete: false };

  const goPrev = () => setStepIndex((index) => Math.max(0, index - 1));
  const goNext = () => setStepIndex((index) => Math.min(stepCount - 1, index + 1));

  return (
    <div className={styles.panel} data-testid="workshop-instructions-panel">
      <h3 className={styles.title}>{challenge.name}</h3>
      <p
        className={complete ? styles.progressComplete : styles.progress}
        data-testid="workshop-challenge-progress"
      >
        {complete
          ? 'Challenge complete!'
          : `Progress: ${matched} / ${total} bricks matched`}
      </p>

      {currentStep ? (
        <div className={styles.stepViewer} data-testid="workshop-instructions-step">
          <InstructionStepPreview
            step={currentStep}
            targetInstances={challenge.targetInstances ?? []}
          />
          <p className={styles.stepText}>{currentStep.text}</p>
          {stepCount > 1 ? (
            <div className={styles.stepNav}>
              <button
                type="button"
                className={styles.stepButton}
                onClick={goPrev}
                disabled={stepIndex === 0}
                data-testid="workshop-instructions-step-prev"
              >
                Prev
              </button>
              <span
                className={styles.stepCounter}
                data-testid="workshop-instructions-step-counter"
              >
                {stepIndex + 1} / {stepCount}
              </span>
              <button
                type="button"
                className={styles.stepButton}
                onClick={goNext}
                disabled={stepIndex >= stepCount - 1}
                data-testid="workshop-instructions-step-next"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={onCheck}>
          Check build
        </button>
        <button type="button" className={styles.button} onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default WorkshopInstructionsPanel;