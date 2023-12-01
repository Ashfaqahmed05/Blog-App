import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js'
import {
  getFirestore, getDocs, doc,
  collection, addDoc, setDoc, getDoc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { getStorage, ref , uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js";




import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";

 const firebaseConfig = {
   apiKey: "AIzaSyAdn2KiZPiWunNDbHJRxITscrnKHPEjqjs",
   authDomain: "new-blogapp.firebaseapp.com",
   projectId: "new-blogapp",
   storageBucket: "new-blogapp.appspot.com",
   messagingSenderId: "756635446405",
   appId: "1:756635446405:web:0c1cc485d664574f204dec",
   measurementId: "G-B44GHHP2LM"
 };

 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 const auth = getAuth(app)
 const db = getFirestore(app);
 const storage = getStorage(app);



const todosCollectionRef = collection(db, 'todos')




const registerForm = document.getElementById('register-form')
const loginForm = document.getElementById('login-form')
let logout = document.getElementById('logout')
let blog = document.getElementById('blog')
let desc = document.getElementById('desc')
let level = document.getElementsByName('level')
let addInfo = document.getElementById('addinfo')
let todosContainer = document.getElementById('todosContainer')
let userInfoForm = document.getElementById('user-info')
let profile = document.getElementById('profile')
let userImg = document.getElementById('userImg')
let userFullname = document.getElementById('userFullname')
let userEmail = document.getElementById('userEmail')
let userphone = document.getElementById('userphone')
let about = document.getElementById('about')
let homeprofile = document.getElementById('homeProfilePicture')


let userInfo;
let uid = '';

onAuthStateChanged(auth, (user) => {
  if (user) {
    uid = user.uid;
    
    console.log('logged in')
    getTodos()
    if(window.location.href.includes('index.html')){
      window.location.assign('home.html')   
      
    }
    getUserInfo()

    // ...
  } else {
    // User is signed out
    if (window.location.href.includes('home.html')) {
      window.location.assign('index.html')
    }
    // ...
  }
});

registerForm?.addEventListener('submit', e => {
  e.preventDefault()
  console.log(e)
  const userInfo = {
    fullname: e.target[0].value,
    email: e.target[1].value,
    password: e.target[2].value
  }
  createUserWithEmailAndPassword(auth, userInfo.email, userInfo.password)
    .then(async userCredential => {
      // Signed up
      const user = userCredential.user
      console.log('user->', user)
      alert('Congtulations, Your account registered your Uid ' + user.uid)
      const userref = doc(db, 'User', user.uid)
      await setDoc(userref, userInfo)
      window.location.href = 'index.html'

      // ...
    })
    .catch(error => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log('errorMessage->', errorMessage)
      alert('Please try again' + errorMessage)

      // ..
    })
})
loginForm?.addEventListener('submit', e => {
  console.log('login form', e)
  e.preventDefault()
  const userInfo = {
    email: e.target[0].value,
    password: e.target[1].value
  }
  signInWithEmailAndPassword(auth, userInfo.email, userInfo.password)
    .then(userCredential => {
      // Signed up
      const user = userCredential.user
      console.log('user logged in->', user)
      alert('Congratulations, Your Account logged in')
      window.location.assign('home.html')
      // ...

    })
    .catch(error => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log('errorMessage user not logged in->', errorMessage)
      alert('Sorry' + errorMessage)
      // ..
    })
})

logout?.addEventListener('click', () => {
  signOut(auth).then(() => {
    // Sign-out successful. 
    console.log('signedout')
    // window.location.assign('index.html')
  }).catch((error) => {
    // An error happened.
    console.log('signedout', error)

  });
})




addInfo?.addEventListener('click', async () => {
  if (!blog.value) return alert('Please add todo')
  if (!desc.value) return alert('Please add Description')

  let userlevel;
  document.getElementsByName('level').forEach((data) => {
    if (data.checked) {
      userlevel = data.value
    }
  })
  const blogobj = {
    todo: blog.value,
    description: desc.value,
    Level: userlevel,
    user: uid
  }
  try {
    const docAdded = await addDoc(todosCollectionRef, blogobj);
    blog.value = ''
    desc.value = ''
    level.value = ''
    console.log("Document written with ID: ", docAdded);
    getTodos()
  } catch (e) {
    console.error("Error adding document: ", e);
  }
})

async function getTodos() {

  const querySnapshot = await getDocs(todosCollectionRef);
  querySnapshot.forEach(async (todoDoc) => {
    if(todosContainer){
      todosContainer.innerHTML = null

    }
    let todoObj = todoDoc.data()
    const userref = doc(db, 'User', todoObj.user)
    const userInfo = await getDoc(userref)
    todoObj.userInfo = userInfo.data()
    const {todo, description, Level,userInfo: { fullname } } = todoObj
    const div = document.createElement('div')
    div.className = 'todo-div'
    const username = document.createElement('h2')
    username.innerText = `Blog by ${fullname}`
    const span = document.createElement('span')
    span.innerText = `Title : ${todoObj.todo}`
    const descpt = document.createElement('h5')
    descpt.innerText = `Description : ${todoObj.description}`
    const inlevel = document.createElement('h5')
    inlevel.innerText = `For : ${todoObj.Level}`
    
    div.appendChild(username)
    div.appendChild(span)
    div.appendChild(descpt)
    div.appendChild(inlevel)
    todosContainer?.appendChild(div)

  });
}
async function getUserInfo(){
      const userDocRef = doc(db, 'User', uid)
      const user = await getDoc(userDocRef)
        userInfo = user.data()
        userFullname.value = userInfo.fullname
        userEmail.value = userInfo.email
        userphone.value = userInfo.phone || ''
        about.value = userInfo.about || ''
        if(userInfo.profileImg){
          userImg.src = userInfo.profileImg
          homeprofile.src = userInfo.profileImg
        }
      }


userInfoForm?.addEventListener('submit' ,async (e)=>{
e.preventDefault()
try {
  let userInfo = {
    fullname: e.target[1].value,
    email: e.target[2].value,
    phone: e.target[3].value,
    about: e.target[4].value,
  }
  console.log(userInfo)
  await updateDoc(doc(db, 'User', uid), userInfo)
  alert('Update done')
} catch (error) {
  console.log(error)
  alert('Update not done')
}
})
profile?.addEventListener('change', async function(){
  console.log(this.files[0])
  const profileref = ref(storage, `users/${uid}`)
  try {
    await uploadBytes(profileref, this.files[0]).then(async (snapshot)=>{
      console.log('file uploaded!')
      getDownloadURL(profileref)
  .then(async(url) => {
    console.log(url)
  await updateDoc(doc(db, 'User', uid), {profileImg: url} )
  userImg.src = url
  }).catch((err) => console.log(err))
    })
  } catch (error) {
    console.log(error)
  }
})