import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
 apiKey: "AIzaSyBKWvpsB4rN3lbZrPp_PPJxR2g41oss1Dw",
  authDomain: "fir-auth-495605.firebaseapp.com",
  projectId: "firebase-auth-495605",
  storageBucket: "firebase-auth-495605.firebasestorage.app",
  messagingSenderId: "319816911102",
  appId: "1:319816911102:web:079b5b9a0d8e1c99043daf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


//  SIGNUP + SEND EMAIL VERIFICATION
window.register = async function () {

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {

    const cred = await createUserWithEmailAndPassword(auth,email,password);
    const user = cred.user;

    // send verification email
    await sendEmailVerification(user);

    // save email in Firestore
    await setDoc(doc(db,"users",user.uid),{
      email:user.email
    });

    alert("Verification email sent. Verify then login.");
    await firebaseSignOut(auth); // logout after signup
    window.location.href = "index.html";

  } catch(err){
    document.getElementById("message").innerText = err.message;
  }
}


// LOGIN ONLY IF EMAIL VERIFIED
window.login = async function () {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {

    const cred = await signInWithEmailAndPassword(auth,email,password);
    const user = cred.user;

    // check email verification
    if(!user.emailVerified){
      alert("Please verify your email before login.");
      await firebaseSignOut(auth);
      return;
    }

    window.location.href = "dashboard.html";

  } catch(err){
    document.getElementById("message").innerText = err.message;
  }
}

// SESSION LISTENER + FETCH USER EMAIL FROM DB
onAuthStateChanged(auth, async (user) => {

  // If dashboard but not logged in → go login
  if(location.pathname.includes("dashboard") && !user){
    window.location.href = "index.html";
    return;
  }

  // If logged in → fetch email from Firestore
  if(user && location.pathname.includes("dashboard")){

    try{
      const docRef = doc(db,"users",user.uid);
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()){
        document.getElementById("userEmail").innerText =
          docSnap.data().email;
      }
      else{
        // fallback (should not happen)
        document.getElementById("userEmail").innerText = user.email;
      }

    }catch(err){
      console.log(err);
    }
  }
});

// LOGOUT
window.logout = async function(){
  await signOut(auth);
  window.location.href = "index.html";
}