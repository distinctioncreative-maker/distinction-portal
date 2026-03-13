/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Activity from './pages/Activity';
import Billing from './pages/Billing';
import CalendarPage from './pages/CalendarPage';
import Dashboard from './pages/Dashboard';
import InitDemo from './pages/InitDemo';
import LeadDetail from './pages/LeadDetail';
import Leads from './pages/Leads';
import Notifications from './pages/Notifications';
import OrgManagement from './pages/OrgManagement';
import OrgSettings from './pages/OrgSettings';
import Pipeline from './pages/Pipeline';
import Profile from './pages/Profile';
import SupportConsole from './pages/SupportConsole';
import SupportLogs from './pages/SupportLogs';
import Tasks from './pages/Tasks';
import WidgetPreferences from './pages/WidgetPreferences';
import Financials from './pages/Financials';
import Metrics from './pages/Metrics';


export const PAGES = {
    "Activity": Activity,
    "Billing": Billing,
    "CalendarPage": CalendarPage,
    "Dashboard": Dashboard,
    "InitDemo": InitDemo,
    "LeadDetail": LeadDetail,
    "Leads": Leads,
    "Notifications": Notifications,
    "OrgManagement": OrgManagement,
    "OrgSettings": OrgSettings,
    "Pipeline": Pipeline,
    "Profile": Profile,
    "SupportConsole": SupportConsole,
    "SupportLogs": SupportLogs,
    "Tasks": Tasks,
    "WidgetPreferences": WidgetPreferences,
    "Financials": Financials,
    "Metrics": Metrics,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
};