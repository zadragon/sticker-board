import { useState } from "react";
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

  // 1. 검증 함수에서 async/await를 사용하여 상태 업데이트와 분리
  const verifyPin = async (inputPin: string) => {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().parentPin === inputPin) {
        sessionStorage.setItem("isParentAuthenticated", "true");
        navigate("/parent-dashboard");
      } else {
        alert("PIN 번호가 일치하지 않습니다.");
        setPin(""); // 여기에서의 상태 업데이트는 이제 사용자 이벤트 핸들러 흐름 안에 있어 안전합니다.
      }
    } catch (error) {
      console.error("PIN 확인 에러:", error);
    }
  };

  // 2. 숫자를 클릭할 때마다 길이를 체크하여 4자리가 되면 바로 실행
  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      // 4자리가 완성된 시점에 바로 검증 함수 호출
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

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
          설정하신 4자리 PIN 번호를 입력하세요.
        </Typography>

        {/* PIN 표시란 (동그라미 형태) */}
        <Box sx={{ display: "flex", gap: 2, mb: 5 }}>
          {[...Array(4)].map((_, i) => (
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
        <Paper
          elevation={0}
          sx={{ bgcolor: "transparent", width: "100%", maxWidth: "280px" }}
        >
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0].map((val, index) => (
              // 1. 'item' 속성을 지우고 size 속성(xs 대신 size)을 사용합니다.
              <Grid size={4} key={index}>
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

            {/* 2. 백스페이스 버튼 부분 */}
            <Grid size={4}>
              <IconButton
                onClick={handleDelete}
                // IconButton은 fullWidth를 지원하지 않습니다. 대신 sx로 크기를 조절합니다.
                sx={{
                  width: "100%",
                  height: 70,
                  borderRadius: 3,
                  border: "2px solid rgba(0, 0, 0, 0.12)", // 숫자 버튼과 통일감 유지
                }}
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
