import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import HomePage from './HomePage/HomePage';
import LoginPage from './LoginPage/LoginPage';
import ChannelsPage from './ChannelsPage/ChannelsPage';
import RegisterPage from './RegisterPage/RegisterPage';


function App() {

  return (
    <Router>
      <div>
        <Navbar/>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/ChannelsPage" element={<ChannelsPage />} />
          <Route path="/RegisterPage" element={<RegisterPage />} />

          </Routes>
      </div>
    </Router>
  );
}

export default App;
