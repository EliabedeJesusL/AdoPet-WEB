  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBRVmQSKkQ2uyM-wqhHwQTcZVreNRk3u9w",
    authDomain: "adopet-pi.firebaseapp.com",
    projectId: "adopet-pi",
    storageBucket: "adopet-pi.firebasestorage.app",
    messagingSenderId: "797305766384",
    appId: "1:797305766384:web:46beb3e1346878df149d35",
    measurementId: "G-0HP9DHD1ZF"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

// inputs
const email = document.getElementById('email').value;
const password = document.getElementById('senha').value;

//submit button
const submit = document.getElementById('submit');
submit.addEventListener("click", function (event) {
   event.preventDefault()
   alert(5)
})
