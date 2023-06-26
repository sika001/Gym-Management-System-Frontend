import SideBar from "../Side Bar/side-bar";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import "./App-layout.css";

function AppLayout() {
    const height = 70;
    const marginTop = 100;
    return (
        //IZMIJENITI CSS DEBILU
        <div className="app-container">
            <aside className="side-bar" style={{ height: height + "%" }}>
                <SideBar />
            </aside>
            <main className="main-container">
                {/* This is the place where the content of the child component will be rendered*/}
                <Outlet />
            </main>
            <footer style={{ marginTop: marginTop + "%" }}>
                <Footer />
            </footer>
        </div>
    );
}

export default AppLayout;
