import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/login/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ContactListAndAdd from './pages/contacts/ContactListAndAdd';
import Deals from './pages/Deals/Deals';
import Dashboard from './pages/Dashboard/Dashboard';
import EventManager from "./pages/EvenetManager/EventManager"
import Tasks from './pages/tasks/Tasks';
import MainLayout from './components/MainLayout';
import "./Antdesign.css";
import Products from './pages/Product/Products';
import Invoices from './pages/Invoice/Invoices';
import './App.css';
import "./variable.css"
import WebMailLogin from './pages/webmail/WebMailLogin';
import WebMailDashboard from './pages/webmail/WebMailDashboard';
import { useState, useEffect } from 'react';
import CompanyList from './pages/Company/CompanyList';
import AddCompanyForm from './pages/Company/AddCompanyForm';
import ViewCompany from './pages/Company/ViewCompany';
import ViewContact from './pages/contacts/ViewContact';
import DealView from './pages/Deals/DealView';
import CampaignList from './pages/Campaigns/CampaignsList';
import OutReachList from './pages/OutReach/OutReachList';
import CategoryList from './pages/Categories/CategoryList';
import ViewOutReach from './pages/viewOutreach/ViewOutReach';
import Analytics from './pages/analytics/analytics';
import Analytics2 from './pages/analytics/analytics2';

const PrivateRoute = ({ children }) => {
  let token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};



function App() {


  const [userData, setUserData] = useState(() => {
    return localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {};
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setUserData(localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {});
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <ConfigProvider
      theme={ {
        token: {
          colorPrimary: '#03497a',
          colorBgContainer: '#f6ffed',
        },
      } }
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */ }
            <Route path="/login" element={ <Login /> } />

            {/* Private Routes inside MainLayout */ }
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={ <Dashboard /> } />
                      <Route path="/deals" element={ <Deals /> } />
                      <Route path="/contacts" element={ <ContactListAndAdd /> } />
                      <Route path="/event-manager" element={ <EventManager /> } />
                      <Route path="/tasks" element={ <Tasks /> } />
                      <Route path="/products" element={ <Products /> } />
                      <Route path="/invoices" element={ <Invoices /> } />
                      {/* <Route path="/webmail" element={userData?.tokens ? <WebMailDashboard /> : <WebMailLogin />} /> */ }
                      <Route path="/webmail" element={ <WebMailDashboard /> } />
                      <Route path="/webmail-setup" element={ <WebMailLogin /> } />
                      <Route path="/company" element={ <CompanyList /> } />
                      <Route path="/company/add" element={ <AddCompanyForm /> } />
                      <Route path="/company/edit/:id" element={ <AddCompanyForm /> } />
                      <Route path="/company/view/:id" element={ <ViewCompany /> } />
                      <Route path="/contact/view/:id" element={ <ViewContact /> } />
                      <Route path="/deals/view/:id" element={ <DealView /> } />
                      <Route path="/outreach/campaign" element={ <CampaignList /> } />
                      <Route path="/outreach/list" element={<OutReachList />} />
                      <Route path="/outreach/categories" element={<CategoryList />} />
                      <Route path='/ViewOutReach/:id' element={<ViewOutReach/>}/>
                      <Route path='/outreach/analytics' element={<Analytics/>}/>
                      <Route path='/outreach/analytics2' element={<Analytics2/>}/>
                      



                    </Routes>
                  </MainLayout>
                </PrivateRoute>
              }
            />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
