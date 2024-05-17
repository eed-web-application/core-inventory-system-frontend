import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useLocation, Redirect } from "react-router-dom";
import CISadmin from "./cisAdmin.js";
import './admin.css';

function Admin() {

  return (
    <Router>
      <div>
        <div className="admin-tab-extension">
        <div className="tab-bar">
          <NavLink to="/admin/CISadmin">CIS</NavLink>
        </div>
        </div>
        <Switch>
          <Route path="/admin/CISadmin">
            <CISadmin />
          </Route>
        </Switch>
      </div>
    </Router>
      );
    }
    
    // Custom NavLink component to handle active styling
    function NavLink({ to, children }) {
      const location = useLocation(); // Hook from react-router-dom to get the current location
      const isActive = location.pathname === to || (location.pathname === "/admin" && to === "/admin/CISadmin"); // Check if current location is root path and target is "Search"
      
      return (
        <Link to={to} className={`cis-tab ${isActive ? 'active' : ''}`}>
          {children}
        </Link>
      );
    }

export default Admin;

