import React, { useState } from "react";
import { auth } from "../api/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  Avatar,
} from "@mui/material";
import StarsIcon from "@mui/icons-material/Stars";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.log("🚀 ~ handleLogin ~ err:", err);
      setError("이메일 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    // Box를 이용해 부모 높이(Layout의 minHeight) 내에서 꽉 채우고 중앙 정렬
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // 세로 중앙
        alignItems: "center", // 가로 중앙
        minHeight: "70vh", // Navbar 제외한 가용 높이의 대부분 차지
        width: "100%",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: "400px", // 카드의 최대 너비 제한
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            m: "0 auto",
            bgcolor: "secondary.main",
            mb: 2,
            width: 56,
            height: 56,
          }}
        >
          <StarsIcon fontSize="large" />
        </Avatar>

        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: 800, mb: 1, color: "primary.main" }}
        >
          칭찬 스티커
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          우리 아이 성취감을 높여주는 마법의 판
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            margin="normal"
            fullWidth
            label="이메일 주소"
            autoFocus
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            variant="outlined"
          />
          <TextField
            margin="normal"
            fullWidth
            label="비밀번호"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            variant="outlined"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, textAlign: "left" }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 4,
              mb: 2,
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            로그인하기
          </Button>
        </form>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            처음 이용하시나요?{" "}
            <Link
              component={RouterLink}
              to="/signup"
              sx={{ fontWeight: "bold", textDecoration: "none" }}
            >
              가족 계정 생성하기
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
