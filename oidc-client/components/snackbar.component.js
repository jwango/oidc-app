import React from 'react';

import styles from './snackbar.module.css';

function Snackbar({ state, onDismiss }) {
  const { visible, content } = state;
  const visibilityClassname = visible ? styles["snackbar--visible"] : styles["snackbar--hidden"];
  return <div className={`${styles["container"]} ${visibilityClassname}`} aria-role={visible ? 'alert' : 'generic'} aria-hidden={!visible}>
    {content}
    <button onClick={onDismiss}>OK</button>
  </div>;
}

export default Snackbar;