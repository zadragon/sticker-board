import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ChildBoard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <header>
        <h1>내 칭찬판</h1>
        <button onClick={() => navigate("/parent-auth")}>⚙️ 부모 모드</button>
      </header>

      {/* 여기에 스티커 판 렌더링 로직 */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {/* 스티커 아이템들 */}
      </Grid>
    </Box>
  );
};

export default ChildBoard;
