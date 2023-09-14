import Home from "./Components/Home/Home";
import Login from "./Components/Login/Login";
import Account from "./Components/Account/Account";
import Members from "./Components/Members/Members";
import Register from "./Components/Register/Register";
import Error from "./Components/Error/Error";
import AppLayout from "./Components/App Layout/App-layout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import React from "react";
import ProtectedRoute from "./Utilities/Protected Routes/ProtectedRoutes";
import Dashboard from "./Components/Dashboard/Dashboard";
import Schedule from "./Components/Schedule/Schedule";
import Employee from "./Components/Employee/Employee";

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Home />{" "}
                    </ProtectedRoute>
                ),
            },
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Dashboard />{" "}
                    </ProtectedRoute>
                ),
            },
            {
                path: "/login",
                element: (
                    <ProtectedRoute accessBy="non-authenticated">
                        <Login />{" "}
                    </ProtectedRoute>
                ),
            },
            {
                path: "/logout",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Login />{" "}
                    </ProtectedRoute>
                ),
            },
            {
                path: "/register",
                element: (
                    <ProtectedRoute accessBy="non-authenticated">
                        <Register />{" "}
                    </ProtectedRoute>
                ),
            },
            {
                path: "/account",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Account />{" "}
                    </ProtectedRoute>
                ),
                // loader: accountLoader,
            },
            {
                path: "/members",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Members />{" "}
                    </ProtectedRoute>
                ),
                // loader: membersLoader,
            },
            {
                path: "/employees",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Employee />{" "}
                    </ProtectedRoute>
                ),
            },
            {
                path: "/arrival",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Members />{" "}
                    </ProtectedRoute>
                ),
            },
            {
                path: "/schedule",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Schedule />{" "}
                    </ProtectedRoute>
                ),
            },
            {
                path: "/*",
                element: (
                    <ProtectedRoute accessBy="non-authenticated">
                        <Error />{" "}
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);
function App() {
    return (
        <div>
            <div className="app-container">
                <RouterProvider router={router}>
                    <AppLayout />
                </RouterProvider>
            </div>
        </div>
    );
}

export default App;
