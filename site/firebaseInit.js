
const firebaseConfig = {
  apiKey: "AIzaSyCsWu4t47rI1uOYFdixQzk8wbfMrD3cNvk",
  authDomain: "faceauthentication-24e77.firebaseapp.com",
  projectId: "faceauthentication-24e77",
  storageBucket: "faceauthentication-24e77.appspot.com",
  messagingSenderId: "271802522128",
  appId: "1:271802522128:web:c5fba87ebd114df0584895",
  measurementId: "G-N6D068Q96Y"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  console.log("Initial")
const db = firebase.firestore();
