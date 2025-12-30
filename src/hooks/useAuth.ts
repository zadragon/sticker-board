import { useState, useEffect } from "react";
import { auth } from "../api/firebase";
// 1. User를 import type으로 가져오거나 별도로 명시합니다.
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. onAuthStateChanged는 함수(값)이므로 그대로 사용합니다.
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, isLoggedIn: !!user, loading };
}
