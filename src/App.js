import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { fetchData, persistUserData } from './api';
import styles from './App.module.css';
import { AuthenticationStack } from './Components/AuthenticationStack';
import { MainMenuStack } from './Components/MainMenuStack';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: null,
      loading: true,
      isAuthenticated: false,
      selectedProfile: null,
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });
    const data = await fetchData();
    this.setState({ userData: data, loading: false });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.userData !== this.state.userData) {
      persistUserData(this.state.userData);
    }
  }

  updateUserData = (newUserData) => {
    this.setState({ userData: newUserData });
  };

  navigateToMainMenu = (selectedProfile) => {
    this.setState({ isAuthenticated: true, selectedProfile });
  };

  navigateToAuthentication = () => {
    this.setState({ isAuthenticated: false, selectedProfile: null });
  };

  render() {
    const { userData, loading, isAuthenticated, selectedProfile } = this.state;

    return (
      <div className={styles.mainDiv}>
        {loading ? (
          <p>Loading...</p>
        ) : !isAuthenticated ? (
          <Router>
            <AuthenticationStack
              userData={userData}
              updateUserData={this.updateUserData}
              navigateToMainMenu={this.navigateToMainMenu}
            />
          </Router>
        ) : (
          <Router>
            <MainMenuStack
              navigateToAuthentication={this.navigateToAuthentication}
              selectedProfile={selectedProfile}
            />
          </Router>
        )}
      </div>
    );
  }
}

export default App;