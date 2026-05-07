import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/////////////////////////////////////////////////////////
// 🔐 LOAD FIREBASE CONFIG FROM SERVER (.env)
/////////////////////////////////////////////////////////
async function getFirebaseConfig() {
  const res = await fetch("/firebase-config");
  return res.json();
}

const firebaseConfig = await getFirebaseConfig();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/////////////////////////////////////////////////////////
// SIGNUP → SEND EMAIL VERIFICATION
/////////////////////////////////////////////////////////
window.register = async function () {

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    const user = cred.user;

    // send verification email
    await sendEmailVerification(user);

    // save email to firestore
    await setDoc(doc(db,"users",user.uid), {
      email: user.email
    });

    alert("Verification email sent 📧. Verify then login.");
    await signOut(auth);
    window.location.href = "index.html";

  } catch(err){
    document.getElementById("message").innerText = err.message;
  }
}

/////////////////////////////////////////////////////////
// LOGIN → ONLY VERIFIED USERS ALLOWED
/////////////////////////////////////////////////////////
window.login = async function () {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const cred = await signInWithEmailAndPassword(auth,email,password);
    const user = cred.user;

    if(!user.emailVerified){
      alert("Please verify your email before login.");
      await signOut(auth);
      return;
    }

    window.location.href = "dashboard.html";

  } catch(err){
    document.getElementById("message").innerText = err.message;
  }
}

/////////////////////////////////////////////////////////
// SESSION LISTENER + FETCH USER EMAIL FROM FIRESTORE
/////////////////////////////////////////////////////////
onAuthStateChanged(auth, async (user) => {

  // protect dashboard page
  if(location.pathname.includes("dashboard") && !user){
    window.location.href = "index.html";
    return;
  }

  // if logged in → show email from firestore
  if(user && location.pathname.includes("dashboard")){
    try{
      const docRef = doc(db,"users",user.uid);
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()){
        document.getElementById("userEmail").innerText =
          docSnap.data().email;
      } else {
        document.getElementById("userEmail").innerText = user.email;
      }

    } catch(err){
      console.log(err);
    }
  }
});

/////////////////////////////////////////////////////////
// LOGOUT
/////////////////////////////////////////////////////////
window.logout = async function(){
  await signOut(auth);
  window.location.href = "index.html";
}