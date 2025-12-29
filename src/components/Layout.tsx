import { Box, Container, CssBaseline } from "@mui/material";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: "320px",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />

      {/* 상단바 */}
      <Navbar />

      {/* 메인 콘텐츠 영역 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // 가로 방향 중앙 정렬
          pt: { xs: "80px", sm: "90px" }, // Navbar 높이만큼 아래로 밀어줌
          pb: 4,
          px: 2, // 모바일 양옆 여백
        }}
      >
        <Container
          disableGutters // 기본 좌우 여백 제거 (Box의 px로 조절)
          component="main"
          sx={{
            width: "100%",
            maxWidth: "1000px !important",
            display: "flex",
            flexDirection: "column",
            alignItems: "center", // 내부 요소들도 가운데 정렬
          }}
        >
          {children}
        </Container>
      </Box>
      {/* (선택사항) 푸터가 필요하다면 여기에 추가 */}
    </Box>
  );
};

export default Layout;
