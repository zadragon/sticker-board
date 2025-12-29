import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./api/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ParentDashboard from "./pages/ParentDashboard";
import ChildBoard from "./pages/ChildBoard";
import PinCheckPage from "./pages/PinCheckPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4dabf7", // 하늘색 (부모용)
    },
    secondary: {
      main: "#fab005", // 노란색 (스티커/포인트)
    },
    background: {
      default: "#f8f9fa",
    },
  },
  typography: {
    fontFamily: "Pretendard, sans-serif", // 폰트는 깔끔한 폰트 권장
  },
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 사용자의 로그인 상태가 변경될 때마다 실행
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            {/* 로그인 후 첫 화면은 자녀 보드 */}
            <Route path="/" element={user ? <ChildBoard /> : <LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* PIN 확인 단계 */}
            <Route path="/parent-auth" element={<PinCheckPage />} />

            {/* PIN 확인 완료 후 접근 가능한 대시보드 */}
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
