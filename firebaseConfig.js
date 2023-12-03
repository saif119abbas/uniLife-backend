const { initializeApp } = require("firebase/app");
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
const UploadFile = async (file) => {
  console.log("myfile", file);
  console.log("my storage", storage);
  const nameImage = `foodItem 40`;
  const storageRef = ref(storage, nameImage, "foodItem");
  await uploadBytes(storageRef, file);
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
};
