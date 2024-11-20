// src/App.js 1
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import ThemedAccordion from './components/Accordion/ThemedAccordion';
import Header from './components/Header/Header';
import Domains from './components/Domains/Domains';
import GoogleAccounts from './components/GoogleAccounts/GoogleAccounts';
import Logs from './components/Logs/Logs';
import Statistics from './components/Statistics/Statistics';
import AuthorizationForm from './components/AuthorizationForm/AuthorizationForm';
import Spinner from './components/Spinner/Spinner';

import './App.scss';

function App() {
  const { data, isAuthenticated, loading, errorMessage, login } =
    useContext(AuthContext);

  // Если данные загружаются, отображаем индикатор загрузки
  if (loading) {
    return <Spinner loading={loading}></Spinner>;
  }

  // Если пользователь не аутентифицирован, показываем форму входа
  if (!isAuthenticated) {
    return <AuthorizationForm login={login} errorMessage={errorMessage} />;
  }

  // Интерфейс приложения после успешной аутентификации
  return (
    <Router>
      <Header />
      <main style={{ padding: '0 10px' }}>
        <Routes>
          <Route path="/" element={<ThemedAccordion items={data} />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/google-accounts" element={<GoogleAccounts />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
