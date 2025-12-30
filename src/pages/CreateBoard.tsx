import React, { useState } from "react";
import { db, auth, storage } from "../api/firebase"; // storage 임포트 확인
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Container,
  TextField,
  Typography,
  Button,
  Slider,
  Box,
  Paper,
  Avatar,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useNavigate } from "react-router-dom";

const CreateBoard = () => {
  const [title, setTitle] = useState("");
  const [totalSlots, setTotalSlots] = useState(20);
  const [stickerImg, setStickerImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("/party.png");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // 이미지 선택 시 미리보기 생성
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStickerImg(file);
      setPreviewUrl(URL.createObjectURL(file)); // 브라우저 임시 URL
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setUploading(true);

    try {
      let finalStickerUrl = "/party.png"; // 기본값

      // 1. 이미지가 선택되었다면 Storage에 업로드
      if (stickerImg) {
        const storageRef = ref(
          storage,
          `stickers/${auth.currentUser.uid}/${Date.now()}_${stickerImg.name}`
        );
        const snapshot = await uploadBytes(storageRef, stickerImg);
        finalStickerUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Firestore에 보드 정보 저장 (업로드된 이미지 URL 포함)
      await addDoc(collection(db, "stickerBoards"), {
        uid: auth.currentUser.uid,
        title,
        totalSlots,
        currentCount: 0,
        status: "active",
        stickerImg: finalStickerUrl,
        startDate: serverTimestamp(),
      });

      alert("새로운 칭찬 판이 시작되었습니다!");
      navigate("/parent-dashboard");
    } catch (err) {
      console.error("업로드 실패:", err);
      alert("생성 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          ✨ 칭찬 판 설정
        </Typography>

        <form onSubmit={handleCreate}>
          <TextField
            fullWidth
            label="목표 (예: 장난감 스스로 정리하기)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            sx={{ mb: 4 }}
            required
          />

          {/* 이미지 업로드 섹션 */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              스티커 이미지 등록
            </Typography>
            {previewUrl && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Avatar
                  src={previewUrl}
                  sx={{ width: 80, height: 80, border: "2px solid #4dabf7" }}
                />
              </Box>
            )}
            <p>Icons made by Pixel perfect from www.flaticon.com</p>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="sticker-image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="sticker-image-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                sx={{ mb: 2 }}
              >
                이미지 선택
              </Button>
            </label>
          </Box>

          <Typography gutterBottom>스티커 개수: {totalSlots}개</Typography>
          <Slider
            value={totalSlots}
            onChange={(_, val) => setTotalSlots(val as number)}
            step={5}
            min={10}
            max={50}
            marks
            valueLabelDisplay="auto"
            sx={{ mb: 4 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={uploading}
            sx={{ py: 1.5, borderRadius: 3 }}
          >
            {uploading ? "이미지 업로드 중..." : "칭찬 판 만들기 시작!"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateBoard;
