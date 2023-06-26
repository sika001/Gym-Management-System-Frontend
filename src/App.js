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

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
            { path: "/client", element: <Client />, loader: clientLoader },
            { path: "/members", element: <Members />, loader: membersLoader },
            { path: "/*", element: <Error /> },
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
                {/* <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/client" element={<Client />} loader={clientLoader} />
                        <Route path="/*" element={<Error />} />
                    </Routes>
                </BrowserRouter> */}
            </div>
        </div>
    );
}

export default App;
