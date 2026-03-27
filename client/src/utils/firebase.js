
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyCLDunO8Z2nmFxpO3aHdJ8m9qyOfspQmyU",
  authDomain: "interviewai-a3fd5.firebaseapp.com",
  projectId: "interviewai-a3fd5",
  storageBucket: "interviewai-a3fd5.firebasestorage.app",
  messagingSenderId: "1053977359557",
  appId: "1:1053977359557:web:9e374245d8b5dedbe76cac"
};



const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}