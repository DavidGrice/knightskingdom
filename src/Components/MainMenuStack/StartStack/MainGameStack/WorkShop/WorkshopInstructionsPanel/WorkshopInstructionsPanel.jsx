import React from 'react';
import styles from './WorkshopInstructionsPanel.module.css';

const WorkshopInstructionsPanel = ({
  challenge,
  match,
  onDismiss,
  onCheck,
}) => {
  if (!challenge) {
    return null;
  }

  const { matched, total, complete } = match ?? { matched: 0, total: 0, complete: false };

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
      <ol className={styles.steps}>
        {challenge.instructions.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
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