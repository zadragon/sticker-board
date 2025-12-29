// src/api/auth.ts
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
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
