import React from 'react';
import { Authentication } from './components/AuthenticationStack'; 
import styles from './App.module.css';

class App extends React.Component {
 
  render() {
    return (
      <div className={styles.mainDiv}>
        <Authentication />
      </div>
    );
  }
}

export default App;