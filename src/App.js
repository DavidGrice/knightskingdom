import React, { Component } from 'react';
import { Authentication } from './components/AuthenticationStack'; 
import { fetchData } from './api';
import styles from './App.module.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: null,
      loading: true,
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });
    const data = await fetchData();
    this.setState({ userData: data, loading: false });
  }

  render() {
    const { userData, loading } = this.state;

    return (
      <div className={styles.mainDiv}>
        {loading ? <p>Loading...</p> : <Authentication userData={userData} />}
      </div>
    );
  }
}

export default App;