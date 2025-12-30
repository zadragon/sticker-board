import { useState, useEffect } from "react";
import { db, auth } from "../api/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";

interface StickerBoard {
  id: string;
  uid: string;
  title: string;
  currentCount: number;
  totalSlots: number;
  stickerImg: string;
  status: string;
}

const ParentDashboard = () => {
  const [boards, setBoards] = useState<StickerBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const archiveBoard = async (boardId: string) => {
    if (
      !window.confirm(
        "이 칭찬 판을 기록 보관소로 옮길까요? 더 이상 스티커를 수정할 수 없게 됩니다."
      )
    )
      return;

    try {
      const boardRef = doc(db, "stickerBoards", boardId);
      await updateDoc(boardRef, {
        status: "archived",
        completedAt: serverTimestamp(), // 완료 시점 기록
      });
      alert("기록 보관소로 이동되었습니다! 🎉");
    } catch (error) {
      console.error("Archive error:", error);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    // 현재 유저의 모든 활성(active) 보드를 가져옴
    const q = query(
      collection(db, "stickerBoards"),
      where("uid", "==", auth.currentUser.uid),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const boardList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<StickerBoard, "id">),
      }));
      setBoards(boardList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * 스티커 개수 업데이트 함수
   * @param boardId - 수정할 보드의 ID
   * @param currentCount - 현재 보드의 스티커 개수
   * @param totalSlots - 보드의 전체 칸 수
   * @param amount - 변화량 (+1 또는 -1)
   */
  const updateStickerCount = async (
    boardId: string,
    currentCount: number,
    totalSlots: number,
    amount: number
  ) => {
    try {
      const newCount = currentCount + amount;

      // 1. 범위를 벗어나는 경우 업데이트 방지
      if (newCount < 0 || newCount > totalSlots) {
        console.warn("스티커 개수가 범위를 벗어납니다.");
        return;
      }

      const boardRef = doc(db, "stickerBoards", boardId);

      // 2. Firestore 업데이트
      await updateDoc(boardRef, {
        currentCount: increment(amount),
        // 만약 다 채웠다면 마지막 업데이트 시간 기록 (나중에 정렬이나 축하 로직에 사용)
        ...(newCount === totalSlots && { completedAt: new Date() }),
      });

      // 3. 다 채웠을 때 부모에게 알림 (나중에 폭죽 효과와 연결)
      if (newCount === totalSlots && amount > 0) {
        alert("🎉 축하합니다! 모든 스티커를 다 채웠어요!");
      }
    } catch (error) {
      console.error("스티커 업데이트 중 오류 발생:", error);
      alert("변경사항을 저장하지 못했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "정말로 이 칭찬 판을 삭제하시겠습니까? 기록이 모두 사라집니다."
      )
    ) {
      await deleteDoc(doc(db, "stickerBoards", id));
    }
  };

  if (loading) return <Typography>데이터 불러오는 중...</Typography>;

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          진행 중인 칭찬 판 ({boards.length})
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="contained" onClick={() => navigate("/create-board")}>
          +
        </Button>
        <Button variant="contained" onClick={() => navigate("/history")}>
          기록 보관소
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {boards.map(board => (
          <div key={board.id}>
            <Card sx={{ borderRadius: 3, position: "relative" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {board.title}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(board.currentCount / board.totalSlots) * 100}
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    // 인자: 보드ID, 현재개수, 전체칸수, 변화량
                    onClick={() =>
                      updateStickerCount(
                        board.id,
                        board.currentCount,
                        board.totalSlots,
                        1
                      )
                    }
                    disabled={board.currentCount >= board.totalSlots}
                  >
                    붙이기
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RemoveIcon />}
                    onClick={() =>
                      updateStickerCount(
                        board.id,
                        board.currentCount,
                        board.totalSlots,
                        -1
                      )
                    }
                    disabled={board.currentCount <= 0}
                  >
                    떼기
                  </Button>
                  {/* 수정 페이지로 이동할 때 ID를 넘김 */}
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => navigate(`/edit-board/${board.id}`)}
                  >
                    수정
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(board.id)}
                  >
                    삭제
                  </Button>
                </Stack>
                {board.currentCount === board.totalSlots && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    sx={{ mt: 2, fontWeight: "bold", borderRadius: 3 }}
                    onClick={() => archiveBoard(board.id)}
                  >
                    🏆 미션 완료! 기록으로 옮기기
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </Grid>

      {boards.length === 0 && (
        <Typography align="center" sx={{ mt: 5 }}>
          아직 판이 없습니다. 새로 만들어보세요!
        </Typography>
      )}
    </Box>
  );
};

export default ParentDashboard;
