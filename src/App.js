import React, { Component } from 'react';
import { Navigate, BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { fetchData } from './api';
import styles from './App.module.css';
import { AuthenticationStack } from './components/AuthenticationStack';
import { MainMenuStack } from './components/MainMenuStack';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: null,
      loading: true,
      isAuthenticated: false, // Add authentication state
      selectedProfile: null,
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });
    const data = await fetchData();
    this.setState({ userData: data, loading: false });
  }

  navigateToMainMenu = (selectedProfile) => {
    this.setState({ isAuthenticated: true }); // Set authentication status
    this.setState({ selectedProfile: selectedProfile });
  };

  navigateToAuthentication = () => {
    this.setState({ isAuthenticated: false }); // Set authentication status
    this.setState({ selectedProfile: null });
  }

  render() {
    const { userData, loading, isAuthenticated, selectedProfile } = this.state;

    return (
        <div className={styles.mainDiv}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            
            !isAuthenticated ? (
              <Router>
                <AuthenticationStack userData={userData} navigateToMainMenu={this.navigateToMainMenu} />
              </Router>
            )  : (
              <Router>
                <MainMenuStack navigateToAuthentication={this.navigateToAuthentication} selectedProfile={selectedProfile} />
              </Router>
            )
          )}
        </div>
    );
  }
}

export default App;