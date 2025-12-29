import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

// 임시 데이터 (나중에 Firebase 연결 예정)
const mockBoard = {
  id: "1",
  title: "🍓 하루에 사과 한 알 먹기",
  totalSlots: 20,
  currentCount: 12,
  stickerImg: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<any>(mockBoard); // 초기값은 mock으로 설정

  // 진행률 계산
  const progress = (board.currentCount / board.totalSlots) * 100;

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      {/* 상단 헤더 섹션 */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            부모님 대시보드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            아이의 성장을 함께 응원해주세요!
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => navigate("/history")}
        >
          지난 기록
        </Button>
      </Stack>

      {!board ? (
        /* 상태 1: 생성된 판이 없을 때 */
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 5,
            border: "2px dashed #e0e0e0",
            bgcolor: "#fafafa",
          }}
        >
          <AddCircleOutlineIcon
            sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            아직 활성화된 칭찬 판이 없어요.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 2, borderRadius: 10, px: 4 }}
            onClick={() => navigate("/create-board")}
          >
            새 칭찬 판 만들기
          </Button>
        </Paper>
      ) : (
        /* 상태 2: 활성화된 판이 있을 때 */
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Card
              sx={{ borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.05)" }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="overline"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  현재 진행 중인 목표
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  {board.title}
                </Typography>

                <Box
                  sx={{
                    mb: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    달성률: {Math.round(progress)}%
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {board.currentCount} / {board.totalSlots}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 12, borderRadius: 5, mb: 4 }}
                />

                <Divider sx={{ mb: 3 }} />

                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: "bold" }}
                >
                  스티커 관리
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ py: 1.5, borderRadius: 3, fontSize: "1rem" }}
                    onClick={() => {
                      /* +1 로직 */
                    }}
                  >
                    스티커 붙이기
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<RemoveIcon />}
                    sx={{ py: 1.5, borderRadius: 3 }}
                    onClick={() => {
                      /* -1 로직 */
                    }}
                  >
                    떼기
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: "#fff9db",
                border: "1px solid #fab005",
              }}
            >
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <StarIcon sx={{ color: "#f08c00" }} /> 응원의 한마디
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.6, color: "#5c940d" }}
              >
                "우리 OO이가 벌써 스티커를 {board.currentCount}개나 모았네!
                조금만 더 힘내면 선물을 받을 수 있어!"
              </Typography>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 3, color: "#f08c00" }}
                onClick={() => navigate("/create-board")} // 수정 페이지로 활용 가능
              >
                판 설정 변경하기
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ParentDashboard;
