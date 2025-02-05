import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Layout from "../components/Layout/index";
import AuthRoute from "../AuthRoute";
import ProtectedRoute from "../ProtectedRoute";
import CrmPage from "../pages/CRM/CrmPage";

const routesArr = [
  {
    path: "/",
    component: <CrmPage />,
    wrapRoute: "authRoute",
  },
 
  {
    path: "/login",
    component: <Login />,
    wrapRoute: "authRoute",
  },

  {
    path: "/",
    component: <Login />,
    wrapRoute: "authRoute",
  },

  {
    path: "/layout",
    component: <Layout />,
    wrapRoute: "protectedRoute",
  },
];

const Index = () => {
  return (
    <Routes>
      {routesArr.map((item, key) => {
        switch (item.wrapRoute) {
          case "authRoute":
            return (
              <Route
                key={key}
                path={item.path}
                element={
                  // <Layout>
                  <AuthRoute element={item.component} />
                  // </Layout>
                }
              />
            );

          case "protectedRoute":
            return (
              <Route
                key={key}
                path={item.path}
                element={<ProtectedRoute element={item.component} />} // Use ProtectedRoute for public routes
              />
            );

          default:
            return (
              <Route
                key={key}
                path={item.path}
                element={item.component} // Use for public routes
              />
            );
        }
      })}
    </Routes>
  );
};

export default Index;
