import React from "react";
import { Route, Routes } from "react-router-dom";
import { Navbar } from "../Navbar";
import {HomePage, LoginPage, RegisterPage, DashboardPage} from "../pages";

export const AppRouter = () => {
  return <>
      <Routes>
        <Route path="/" element={<Navbar />}>
            <Route index element={<HomePage />} />
            <Route path='login' element={<LoginPage />} />
            <Route path='register' element={<RegisterPage />} />
            <Route path='dashboard' element={<DashboardPage />} />
        </Route>
      </Routes>
    </>;
};
