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
import { auth } from "../api/firebase";
import { logoutUser } from "../api/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      await logoutUser();
      navigate("/");
    }
  };

  // 로그인하지 않은 상태에서는 내비게이션 바를 표시하지 않음
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
                onClick={() => navigate("/parent-auth")}
                sx={{ borderRadius: 5, mr: 1 }}
              >
                부모모드
              </Button>
            </Tooltip>

            {/* 로그아웃 아이콘 버튼 */}
            <Tooltip title="로그아웃">
              <IconButton onClick={handleLogout} color="inherit" size="small">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
