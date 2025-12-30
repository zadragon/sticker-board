import { useState, useEffect } from "react";
import { db, auth } from "../api/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
} from "@mui/material";
import confetti from "canvas-confetti";

interface StickerBoard {
  id: string;
  uid: string;
  title: string;
  currentCount: number;
  totalSlots: number;
  stickerImg: string;
  status: string;
}

const ChildBoard = () => {
  const [boards, setBoards] = useState<StickerBoard[]>([]);
  const [loading, setLoading] = useState(true);

  // 폭죽 효과 함수 통합 및 강화
  const triggerCelebration = (size: "small" | "large") => {
    if (size === "small") {
      // 작게 터지는 효과: 중앙에서 가볍게 팡!
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#FFD700", "#FF69B4", "#00CED1"], // 밝고 귀여운 색상
      });
    } else {
      // 크게 터지는 효과: 양옆에서 3초간 지속적으로 쏟아짐
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        // 왼쪽에서 쏘기
        confetti({
          ...defaults,
          particleCount,
          origin: { x: 0.1, y: 0.7 },
          colors: ["#ff0000", "#ffff00", "#00ff00", "#0000ff"],
        });
        // 오른쪽에서 쏘기
        confetti({
          ...defaults,
          particleCount,
          origin: { x: 0.9, y: 0.7 },
          colors: ["#ff00ff", "#00ffff", "#ffffff", "#ff8c00"],
        });
      }, 250);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "stickerBoards"),
      where("uid", "==", auth.currentUser.uid),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const boardList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<StickerBoard, "id">), // id를 제외한 나머지를 StickerBoard 타입으로 캐스팅
      }));

      boardList.forEach(board => {
        const storageKey = `last_seen_count_${board.id}`;
        const lastSeenCount = parseInt(
          localStorage.getItem(storageKey) || "0",
          10
        );

        // --- 폭죽 로직 수정 ---
        if (board.currentCount > lastSeenCount) {
          if (board.currentCount === board.totalSlots) {
            // 1. 다 채웠을 때 (크게!)
            triggerCelebration("large");
          } else {
            // 2. 개수만 늘어났을 때 (작게!)
            triggerCelebration("small");
          }
        }

        // 현재 개수를 로컬 스토리지에 업데이트
        localStorage.setItem(storageKey, board.currentCount.toString());
      });

      setBoards(boardList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // boards를 의존성에 넣어 이전 상태와 비교 가능하게 함

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ mb: 4, fontWeight: 900, color: "primary.main" }}
      >
        내 칭찬판 🌟
      </Typography>

      {boards.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 4 }}>
          <Typography color="text.secondary">
            아직 활성화된 칭찬판이 없어요.
            <br />
            부모님께 만들어달라고 말씀드려보세요!
          </Typography>
        </Paper>
      ) : (
        boards.map(board => (
          <Paper
            key={board.id}
            elevation={3}
            sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: 5 }}
          >
            <Typography
              variant="h5"
              align="center"
              sx={{ fontWeight: "bold", mb: 3 }}
            >
              {board.title}
            </Typography>

            {/* 스티커 그리드 영역 */}
            <Grid container spacing={1.5} justifyContent="center">
              {Array.from({ length: board.totalSlots }).map((_, index) => {
                const isFilled = index < board.currentCount;
                return (
                  <div key={index}>
                    <Box
                      sx={{
                        width: { xs: 55, sm: 70 },
                        height: { xs: 55, sm: 70 },
                        borderRadius: "15px",
                        border: isFilled
                          ? "2px solid #FFD700"
                          : "2px dashed #e0e0e0", // 채워지면 테두리 강조
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isFilled ? "#fff9db" : "#fcfcfc", // 배경색 변화
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: isFilled
                          ? "0 4px 10px rgba(0,0,0,0.1)"
                          : "none",
                      }}
                    >
                      {isFilled && (
                        <Box
                          component="img"
                          src={board.stickerImg}
                          alt="sticker"
                          key={`sticker-${index}`} // 🌟 중요: 이 키가 있어야 추가될 때 애니메이션이 작동함
                          sx={{
                            width: "85%",
                            height: "85%",
                            objectFit: "contain",
                            // 🌟 SX 속성 안에 직접 애니메이션 정의
                            animation:
                              "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            "@keyframes popIn": {
                              "0%": {
                                transform: "scale(0) rotate(-45deg)",
                                opacity: 0,
                              },
                              "70%": { transform: "scale(1.2) rotate(10deg)" },
                              "100%": {
                                transform: "scale(1) rotate(0)",
                                opacity: 1,
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                  </div>
                );
              })}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                오늘도 한 걸음 더!
              </Typography>
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: "bold" }}
              >
                {board.currentCount} / {board.totalSlots}
              </Typography>
            </Box>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default ChildBoard;
