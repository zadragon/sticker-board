import React, { useState } from "react";
import { signUpUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentPin, setParentPin] = useState(""); // 6자리 PIN 상태
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (parentPin.length !== 4) {
      alert("부모님 확인용 PIN은 숫자 4자리로 입력해주세요.");
      return;
    }

    try {
      // 이전에 만든 auth.ts의 signUpUser 함수 호출 (email, password, parentPin 전달)
      await signUpUser(email, password, parentPin);
      alert("가족 계정 생성이 완료되었습니다!");
      navigate("/"); // 로그인 페이지로 이동
    } catch (err) {
      console.log("🚀 ~ handleSignup ~ err:", err);
      alert("회원가입 실패: " + err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            👪 가족 계정 만들기
          </Typography>

          <Box component="form" onSubmit={handleSignup} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="이메일"
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="비밀번호"
              type="password"
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "secondary.light",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "secondary.main",
              }}
            >
              <Typography
                variant="subtitle2"
                color="secondary.dark"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <LockOutlinedIcon fontSize="small" /> 부모님 인증 PIN (4자리
                숫자)
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                placeholder="0000"
                sx={{ mt: 1 }}
                value={parentPin}
                onChange={e =>
                  setParentPin(e.target.value.replace(/[^0-9]/g, ""))
                }
                inputProps={{
                  maxLength: 4,
                  inputMode: "numeric",
                  style: {
                    textAlign: "center",
                    fontSize: "1.5rem",
                    letterSpacing: "10px",
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 4, py: 1.5, borderRadius: 2 }}
            >
              가입하기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupPage;
