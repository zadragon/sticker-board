import { useState, useEffect } from "react";
import { db, auth } from "../api/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Paper,
  CircularProgress,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

// 1. 타입 정의 추가
interface ArchivedBoard {
  id: string;
  title: string;
  stickerImg: string;
  totalSlots: number;
  completedAt?: {
    toDate: () => Date;
  };
}

const HistoryPage = () => {
  const [archivedBoards, setArchivedBoards] = useState<ArchivedBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // 완료된(archived) 보드만 최신순으로 가져오기
    const q = query(
      collection(db, "stickerBoards"),
      where("uid", "==", auth.currentUser.uid),
      where("status", "==", "archived"),
      orderBy("completedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<ArchivedBoard, "id">),
      }));
      setArchivedBoards(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography color="text.secondary">
          기록을 불러오고 있어요...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ width: "100%", m: 0 }}>
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <EmojiEventsIcon sx={{ fontSize: 60, color: "#fcc419", mb: 1 }} />
        <Typography variant="h4" fontWeight="bold">
          명예의 전당
        </Typography>
        <Typography color="text.secondary">
          우리 아이가 완성한 소중한 기록들입니다.
        </Typography>
      </Box>

      {archivedBoards.length === 0 ? (
        <Paper
          sx={{
            p: 10,
            textAlign: "center",
            borderRadius: 4,
            bgcolor: "#f8f9fa",
          }}
        >
          <Typography color="text.secondary">
            아직 완료된 칭찬 판이 없어요.
            <br />첫 번째 미션 성공을 응원합니다!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {archivedBoards.map(board => (
            <div
              key={board.id}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  position: "relative",
                  overflow: "visible",
                  width: "100%",
                }}
              >
                <Chip
                  label="성공"
                  color="secondary"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: 10,
                    fontWeight: "bold",
                  }}
                />
                <CardContent sx={{ pt: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={board.stickerImg}
                      sx={{
                        width: 50,
                        height: 50,
                        mr: 2,
                        border: "2px solid #e0e0e0",
                      }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {board.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {board.totalSlots}개의 스티커를 모두 모았어요!
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "#f1f3f5",
                      p: 1.5,
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      fontWeight="500"
                    >
                      📅 완료일:{" "}
                      {board.completedAt
                        ? board.completedAt.toDate().toLocaleDateString()
                        : "날짜 기록 중..."}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </div>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HistoryPage;
