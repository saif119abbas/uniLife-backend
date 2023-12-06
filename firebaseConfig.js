const { initializeApp } = require("firebase/app");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { Buffer } = require("buffer");
const fs = require("fs");
const keyFile = require("./keyFile.json");
const { Storage } = require("@google-cloud/storage");
const {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} = require("firebase/firestore");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
//const serviceAccount = require("./serviceAccountKey.json");

const admin = require("firebase-admin");
const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
  appId: process.env.FIREBASE_APPID,
  measurementId: process.env.FIREBASE_MEASUREMENTID,
};
let App;
let firestoreDB;
let storage;
let bucket;
const initializeFirebaseApp = () => {
  try {
    App = initializeApp(firebaseConfig);
    firestoreDB = getFirestore();
    storage = getStorage();
    return App;
  } catch (err) {
    return err;
  }
};
const uploadProcessData = async (dataToUpload) => {
  /*const dataToUpload = {
    key1: "test",
    key2: 123,
    key3: new Date(),
  };*/
  try {
    const document = doc(firestoreDB, "receipts", "OaVcxB5Uo5ytQwoIisZB");
    let dataUpdated = await setDoc(document, dataToUpload);
    return dataUpdated;
  } catch (err) {
    return err;
  }
};
const getData = async (to, from) => {
  try {
    const collectionRef = collection(firestoreDB, "receipts");
    const finalData = [];
    const q = query(collectionRef);
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      finalData.push(doc.data());
    });
    //for (let doc of snapData) finalData.push(doc.data());
    //finalData.push(snapData.data());
    console.log("final data: ", finalData);
    return finalData;
  } catch (err) {
    return err;
  }
};
const UploadFile = async (file, nameImage) => {
  console.log("from upload file myfile", file);
  console.log("my storage", storage);
  const fileBuffer = fs.readFileSync(file.path);
  const storageRef = ref(storage, nameImage);
  const metadata = {
    contentType: "image/jpeg",
  };

  await uploadBytes(storageRef, fileBuffer, metadata);
};
const getURL = async (nameImage) => {
  const pathReference = ref(storage, nameImage);
  const URL = await new Promise((resolve, reject) => {
    getDownloadURL(pathReference).then((url) => resolve(url));
  });
  console.log("URL: ", URL);
  return URL;
};
const uploadFileFormAdmin = (bucket, nameImage) => {};
const getFiles = async (URL) => {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.responseType = "blob";
  xmlhttp.onload = (event) => {
    const blob = xmlhttp.response;
    console.log(blob);
  };
  xmlhttp.onreadystatechange = myfunction();
  xmlhttp.open("GET", URL, true);
  xmlhttp.send();

  function myfunction() {
    let y = "";
    if (xmlhttp.readyState == 0) {
      //window.alert("Uninitialized");
      y = "Uninitialized";
    }
    if (xmlhttp.readyState == 1) {
      //window.alert("loading");
      y = "loading";
    }
    if (xmlhttp.readyState == 2) {
      //window.alert("loaded");
      y = "loaded";
    }
    if (xmlhttp.readyState == 3) {
      // window.alert("waiting");
      y = "waiting";
    }
    if (xmlhttp.readyState == 4) {
      // window.alert("completed");
      y = JSON.parse(xmlhttp.responseText);
    }
    console.log(y);
  }
};
const getFirebaseApp = () => App;
const getMyStoarge = () => storage;
module.exports = {
  initializeFirebaseApp,
  getFirebaseApp,
  uploadProcessData,
  getData,
  getMyStoarge,
  UploadFile,
  getURL,
  getFiles,
};
