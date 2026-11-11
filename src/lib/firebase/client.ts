import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// NEXT_PUBLIC_ の値はビルド時に埋め込まれるため、process.env.名前 の形で直接書く。
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getClientApp() {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/** ブラウザ用の Firebase Auth。クライアントコンポーネントからだけ呼ぶ。 */
export function getClientAuth() {
  return getAuth(getClientApp());
}

/** ブラウザ用の Firestore。クライアントコンポーネントからだけ呼ぶ。 */
export function getClientDb() {
  return getFirestore(getClientApp());
}
