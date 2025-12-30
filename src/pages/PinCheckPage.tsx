import { useState, useEffect, useCallback } from "react";
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
  const [isVerifying, setIsVerifying] = useState(false);

  // 1. PIN 검증 함수 (useCallback 내부에 불필요한 isVerifying 의존성 제거)
  const verifyPin = useCallback(
    async (inputPin: string) => {
      // 이미 검증 중이거나 4자리가 아니면 중단
      if (isVerifying || inputPin.length !== 4) return;

      setIsVerifying(true);
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
        if (userDoc.exists() && userDoc.data().parentPin === inputPin) {
          sessionStorage.setItem("isParentAuthenticated", "true");
          navigate("/parent-dashboard");
        } else {
          alert("PIN 번호가 일치하지 않습니다.");
          setPin(""); // 입력 초기화
        }
      } catch (error) {
        console.error("PIN 확인 에러:", error);
      } finally {
        // 약간의 지연을 주어 상태가 확실히 변한 뒤에 풀리도록 함
        setTimeout(() => setIsVerifying(false), 300);
      }
    },
    [navigate] // isVerifying을 의존성에서 빼야 최신 로직 유지 가능
  );

  // 2. PIN이 4자리가 되었을 때만 실행되는 Effect
  useEffect(() => {
    if (pin.length === 4 && !isVerifying) {
      // 사용자가 마지막 숫자가 채워지는 것을 볼 수 있도록 약간의 지연 후 실행
      const timer = setTimeout(() => {
        verifyPin(pin);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pin, verifyPin, isVerifying]);

  const handleNumberClick = useCallback(
    (num: string) => {
      // 검증 중에는 추가 입력 방지
      if (isVerifying) return;

      setPin(prev => {
        if (prev.length < 4) {
          return prev + num;
        }
        return prev;
      });
    },
    [isVerifying]
  );

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
  }, []);

  // 물리 키보드 이벤트 리스너 등록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // 키를 꾹 누르고 있을 때 발생하는 중복 이벤트 무시

      if (/^[0-9]$/.test(e.key)) {
        handleNumberClick(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNumberClick, handleDelete]);

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
