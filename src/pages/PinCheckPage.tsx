import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import BackspaceIcon from "@mui/icons-material/Backspace";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../api/firebase";
import { doc, getDoc } from "firebase/firestore";

const PinCheckPage = () => {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().parentPin === pin) {
        // 인증 성공 시 세션 저장 및 이동
        sessionStorage.setItem("isParentAuthenticated", "true");
        navigate("/parent-dashboard");
      } else {
        alert("PIN 번호가 일치하지 않습니다.");
        setPin(""); // 틀리면 초기화
      }
    } catch (error) {
      console.error("PIN 확인 에러:", error);
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) setPin(prev => prev + num);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // PIN이 6자리가 되면 자동으로 확인 로직 실행
  useEffect(() => {
    if (pin.length === 6) {
      handleVerify();
    }
  }, [pin]);

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
          <LockIcon fontSize="large" />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>
          부모님 인증
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          설정하신 6자리 PIN 번호를 입력하세요.
        </Typography>

        {/* PIN 표시란 (동그라미 형태) */}
        <Box sx={{ display: "flex", gap: 2, mb: 5 }}>
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: i < pin.length ? "primary.main" : "#e0e0e0",
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </Box>

        {/* 숫자 키패드 */}
        <Paper elevation={0} sx={{ bgcolor: "transparent", width: "100%" }}>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0].map((val, index) => (
              <Grid item xs={4} key={index}>
                {val !== "" ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => handleNumberClick(val.toString())}
                    sx={{
                      height: 70,
                      fontSize: "1.5rem",
                      borderRadius: 3,
                      borderWidth: 2,
                      "&:hover": { borderWidth: 2 },
                    }}
                  >
                    {val}
                  </Button>
                ) : null}
              </Grid>
            ))}
            <Grid item xs={4}>
              <IconButton
                fullWidth
                onClick={handleDelete}
                sx={{ height: 70, borderRadius: 3 }}
              >
                <BackspaceIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate("/")}
          sx={{ mt: 4, color: "text.secondary" }}
        >
          돌아가기
        </Button>
      </Box>
    </Container>
  );
};

export default PinCheckPage;
