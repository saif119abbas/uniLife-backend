const { initializeApp } = require("firebase/app");
const keyFile = require("./keyFile.json");
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
  deleteObject,
  listAll,
  list,
} = require("firebase/storage");
//const serviceAccount = require("./serviceAccountKey.json");

const admin = require("firebase-admin");
const { resolve } = require("path");
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
    bucket = storage.bucket();
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
  //const fileBuffer = file.buffer;
  const storageRef = ref(storage, nameImage);
  const metadata = {
    contentType: "image/png",
  };

  await uploadBytes(storageRef, file, metadata);
};
const getURL = async (nameImage) => {
  const pathReference = ref(storage, nameImage);
  const URL = await new Promise((resolve, reject) => {
    getDownloadURL(pathReference).then((url) => resolve(url));
  });
  console.log("URL: ", URL);
  return URL;
};
const deleteFile = async (nameImage) => {
  const storageRef = ref(storage, nameImage);
  //const fileRef = storage.refFromURL(URL);

  await deleteObject(storageRef);
};
/*const listFiles = async (Folder, id) => {
  const listRef = ref(storage, Folder);
  const filName = await new Promise((resolve, reject) => {
    listAll(listRef)
      .then((res) => {
        res.items.forEach((itemRef) => {
          console.log("location:", itemRef._location.path_);
          const filName = itemRef._location.path_.split("/")[1];
          if (filName.startWith(`${id}_`)) resolve(filName);
        });
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
      });
  });
  console.log("fileName", filName);
  return filName;
};*/
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
  deleteFile,
};
