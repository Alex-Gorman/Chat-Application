import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import HomePage from './HomePage/HomePage';
import LoginPage from './LoginPage/LoginPage';
import ChannelsPage from './ChannelsPage/ChannelsPage';
import RegisterPage from './RegisterPage/RegisterPage';
import ChannelPage from './ChannelPage/ChannelPage';
import SearchPage from './SearchPage/SearchPage';
import LogoutPage from './LogoutPage/LogoutPage';
import AdminPage from './AdminPage/AdminPage';
import StatsPage from './StatsPage/StatsPage';


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
          <Route path="/channel/*" element={<ChannelPage />} />
          <Route path="/SearchPage" element={<SearchPage />} />
          <Route path="/LogoutPage" element={<LogoutPage />} />
          <Route path="/AdminPage" element={<AdminPage />} />
          <Route path="/StatsPage" element={<StatsPage />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
