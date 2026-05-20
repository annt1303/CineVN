import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/public/Profile";
import AdminLayout from "./components/layout/AdminLayout";
import AdminRoute from "./routes/AdminRoute";
import Dashboard from "./pages/admin/Dashboard";
import CinemaManagement from "./pages/admin/CinemaManagement";
import MovieManagement from "./pages/admin/MovieManagement";
import ShowtimeManagement from "./pages/admin/ShowtimeManagement";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-black text-white">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="cinemas" element={<CinemaManagement />} />
                <Route path="movies" element={<MovieManagement />} />
                <Route path="showtimes" element={<ShowtimeManagement />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
