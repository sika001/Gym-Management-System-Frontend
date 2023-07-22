import Home from "./Components/Home/Home";
import Login from "./Components/Login/Login";
import Client from "./Components/Client/Client";
import Members from "./Components/Members/Members";
import Register from "./Components/Register/Register";
import Error from "./Components/Error/Error";
import AppLayout from "./Components/App Layout/App-layout";
import { loader as clientLoader } from "./Components/Client/Client";
import { loader as membersLoader } from "./Components/Members/Members";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import React from "react";
import ProtectedRoute from "./Utilities/Protected Routes/ProtectedRoutes";

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
                path: "/client",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Client />{" "}
                    </ProtectedRoute>
                ),
                loader: clientLoader,
            },
            {
                path: "/members",
                element: (
                    <ProtectedRoute accessBy="authenticated">
                        <Members />{" "}
                    </ProtectedRoute>
                ),
                loader: membersLoader,
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
