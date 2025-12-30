import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Tooltip,
  Container,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import FaceIcon from "@mui/icons-material/Face";
import { useNavigate } from "react-router-dom";
import { linkAnonymousToEmail, logoutUser } from "../api/auth";
import { useAuth } from "../hooks/useAuth"; // useAuth 훅 임포트
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../api/firebase";
import { Star } from "@mui/icons-material";
import { FirebaseError } from "firebase/app";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        // 세션 삭제를 먼저 확실히 수행
        sessionStorage.removeItem("isParentAuthenticated");
        await logoutUser();
        // 로그인 페이지나 메인으로 이동
        navigate("/", { replace: true });
      } catch (error) {
        console.error("로그아웃 실패:", error);
      }
    }
  };

  const handleSavePin = async (newPin: string) => {
    await setDoc(
      doc(db, "users", auth?.currentUser?.uid || ""),
      {
        parentPin: newPin,
      },
      { merge: true }
    );

    alert("부모님 인증 PIN이 설정되었습니다!"); // 🌟 여기서만 실행되어야 함
    navigate("/parent-dashboard");
  };

  const handleParentModeClick = async () => {
    // 유저가 없으면 아예 실행되지 않도록 방어
    if (!user || !auth.currentUser) return;

    const isAlreadyAuthenticated =
      sessionStorage.getItem("isParentAuthenticated") === "true";

    if (isAlreadyAuthenticated) {
      navigate("/parent-dashboard");
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));

      // 유저 문서가 존재할 때만 로직 실행
      if (userDoc.exists() && userDoc.data().parentPin) {
        navigate("/parent-auth", { state: { target: "/parent-dashboard" } });
      } else {
        // PIN이 없을 때만 설정 로직 실행
        const newPin = prompt("새 부모님 인증 PIN 4자리를 설정하세요:");
        if (newPin && newPin.length === 4) {
          await handleSavePin(newPin);
        }
      }
    } catch (error) {
      console.error("PIN 확인 중 오류:", error);
    }
  };

  const handleLinkAccount = async () => {
    const email = prompt("연동할 이메일을 입력하세요:");
    if (!email) return;
    const password = prompt("사용할 비밀번호를 입력하세요 (6자리 이상):");
    if (!password || password.length < 6) {
      alert("비밀번호는 6자리 이상이어야 합니다.");
      return;
    }

    try {
      await linkAnonymousToEmail(email, password);
      alert("계정 연동 성공! 이제 다른 기기에서도 로그인할 수 있습니다.");
      // 연동 후 UI 갱신을 위해 새로고침 또는 상태 반영
      window.location.reload();
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          alert("이미 사용 중인 이메일입니다.");
        } else if (error.code === "auth/weak-password") {
          alert("비밀번호가 너무 취약합니다. (6자 이상)");
        } else {
          alert("연동 실패: " + error.message);
        }
      } else {
        // 3. 일반 에러 처리
        alert("알 수 없는 에러가 발생했습니다.");
        console.error(error);
      }
    }
  };

  if (!user) return null;

  return (
    <AppBar
      position="fixed" // 상단에 항상 고정
      elevation={1}
      sx={{
        bgcolor: "white",
        color: "text.primary",
        zIndex: theme => theme.zIndex.drawer + 1,
      }}
    >
      {/* Container를 사용해 내부 요소만 1000px로 제한 */}
      <Container maxWidth={false} sx={{ maxWidth: "1000px !important" }}>
        <Toolbar disableGutters>
          {/* 서비스 로고/이름 */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <FaceIcon
              sx={{ color: "secondary.main", mr: 1, fontSize: "2rem" }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              칭찬 스티커
            </Typography>
          </Box>

          {/* 우측 메뉴 구역 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* 부모 모드 전환 버튼 */}
            <Tooltip title="부모님 설정">
              <Button
                variant="outlined"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => handleParentModeClick()}
                sx={{ borderRadius: 5, mr: 1 }}
              >
                부모님 모드
              </Button>
            </Tooltip>

            {/* 로그아웃 아이콘 버튼 */}
            {/* 🌟 익명 사용자: 연동 버튼 / 정식 사용자: 로그아웃 버튼 */}
            {user.isAnonymous ? (
              <Tooltip title="내 기록 저장하고 계정 만들기">
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<Star />}
                  onClick={handleLinkAccount}
                  sx={{ borderRadius: 5, fontWeight: "bold" }}
                >
                  계정연동
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="로그아웃">
                <IconButton onClick={handleLogout} color="inherit" size="small">
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
