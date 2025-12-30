// src/api/auth.ts
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * 회원가입 및 초기 역할(부모/자녀) 설정 함수
 */
export const signUpUser = async (
  email: string,
  password: string,
  parentPin: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      parentPin: parentPin, // 6자리 숫자 비밀번호 저장
      familyId: `family_${user.uid}`,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("회원가입 에러:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("로그아웃 에러:", error);
    throw error;
  }
};

export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("익명 로그인 성공:", result.user.uid);
    return result.user;
  } catch (error) {
    console.error("익명 로그인 실패:", error);
    throw error;
  }
};

export const linkAnonymousToEmail = async (email: string, pass: string) => {
  if (!auth.currentUser) throw new Error("로그인된 사용자가 없습니다.");

  const credential = EmailAuthProvider.credential(email, pass);
  try {
    const result = await linkWithCredential(auth.currentUser, credential);
    return result.user;
  } catch (error) {
    console.error("계정 연동 에러:", error);
    throw error;
  }
};
