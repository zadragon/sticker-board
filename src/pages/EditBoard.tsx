import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../api/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Container,
  TextField,
  Typography,
  Button,
  Slider,
  Box,
  Paper,
  CircularProgress,
  Stack,
  Avatar,
} from "@mui/material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../api/firebase";

const EditBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [totalSlots, setTotalSlots] = useState(20);
  const [currentCount, setCurrentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 이미지 관련 상태 수정
  const [stickerFile, setStickerFile] = useState<File | null>(null); // 파일 객체
  const [previewUrl, setPreviewUrl] = useState<string>(""); // 화면 표시용 URL

  useEffect(() => {
    const fetchBoard = async () => {
      if (!id) return;
      try {
        const boardDoc = await getDoc(doc(db, "stickerBoards", id));
        if (boardDoc.exists()) {
          const data = boardDoc.data();
          setTitle(data.title);
          setTotalSlots(data.totalSlots);
          setCurrentCount(data.currentCount);
          setPreviewUrl(data.stickerImg); // 기존 저장된 이미지 URL 로드
        } else {
          alert("존재하지 않는 보드입니다.");
          navigate("/parent-dashboard");
        }
      } catch (error) {
        console.error("Error fetching board:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id, navigate]);

  // 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStickerFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 업로드 전 미리보기 생성
    }
  };

  // 최종 업데이트 함수
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (totalSlots < currentCount) {
      alert(
        `이미 ${currentCount}개의 스티커가 붙어있습니다. 총 개수를 줄일 수 없습니다.`
      );
      return;
    }

    setUpdating(true);
    try {
      let finalStickerUrl = previewUrl; // 기본적으로 기존 URL 유지

      // 1. 새로운 이미지 파일이 선택되었다면 업로드 진행
      if (stickerFile) {
        const storageRef = ref(
          storage,
          `stickers/${id}/${Date.now()}_${stickerFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, stickerFile);
        finalStickerUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Firestore 정보 업데이트
      const boardRef = doc(db, "stickerBoards", id);
      await updateDoc(boardRef, {
        title: title,
        totalSlots: totalSlots,
        stickerImg: finalStickerUrl, // 업데이트된 URL (또는 기존 URL) 저장
      });

      alert("성공적으로 수정되었습니다.");
      navigate("/parent-dashboard");
    } catch (error) {
      console.error("Error updating board:", error);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          ⚙️ 칭찬 판 수정하기
        </Typography>

        <form onSubmit={handleUpdate}>
          {/* 이미지 수정 구역을 폼 안쪽 상단에 배치하면 더 직관적입니다 */}
          <Box
            sx={{
              mb: 4,
              p: 2,
              border: "1px dashed #ddd",
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              스티커 이미지 변경
            </Typography>
            <Avatar
              src={previewUrl}
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                border: "2px solid #4dabf7",
              }}
            />
            <input
              type="file"
              onChange={handleImageChange}
              id="sticker-upload"
              hidden
              accept="image/*"
            />
            <label htmlFor="sticker-upload">
              <Button component="span" size="small" variant="outlined">
                사진 선택
              </Button>
            </label>
          </Box>

          <TextField
            fullWidth
            label="목표 내용"
            value={title}
            onChange={e => setTitle(e.target.value)}
            sx={{ mb: 4 }}
            required
          />

          <Box sx={{ mb: 4 }}>
            <Typography
              gutterBottom
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>스티커 총 개수</span>
              <b style={{ color: "#1976d2" }}>{totalSlots}개</b>
            </Typography>
            <Slider
              value={totalSlots}
              onChange={(_, val) => setTotalSlots(val as number)}
              step={5}
              marks
              min={5}
              max={50}
              valueLabelDisplay="auto"
            />
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/parent-dashboard")}
              disabled={updating}
            >
              취소
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={updating || totalSlots < currentCount}
            >
              {updating ? "저장 중..." : "수정 완료"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default EditBoard;
