// Global Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJgv2Ltzm5ZMdgKNUcs8stCTJ9lHgFxBQ",
    authDomain: "jibler-37339.firebaseapp.com",
    databaseURL: "https://jibler-37339-default-rtdb.firebaseio.com",
    projectId: "jibler-37339",
    storageBucket: "jibler-37339.firebasestorage.app",
    messagingSenderId: "874793508550",
    appId: "1:874793508550:web:1e16215a9b53f2314a41c7",
    measurementId: "G-6NWSEM7BK9"
};

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    console.log("Firebase Initialized Successfully");
} catch (e) {
    console.error("Firebase Initialization Error:", e);
}

// Global Google Login Flow
window.googleLogin = function () {
    if (!firebase.auth) {
        console.error("Firebase Auth SDK not loaded.");
        return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    const btn = document.querySelector('.btn-google');
    const originalHtml = btn ? btn.innerHTML : 'Google';

    console.log("Starting Google Login...");
    if (btn) btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';

    firebase.auth().signInWithPopup(provider).then((result) => {
        const user = result.user;
        console.log("Google Auth Success:", user.email);
        
        const providerData = user.providerData && user.providerData.length > 0 ? user.providerData.find(p => p.providerId === 'google.com') || user.providerData[0] : null;
        const externalId = providerData ? providerData.uid : user.uid;

        const formData = new FormData();
        formData.append('AccountType', 'Google');
        formData.append('SocialID', externalId);
        formData.append('name', user.displayName || 'User');
        formData.append('Email', user.email);
        formData.append('Photo', user.photoURL || '');
        formData.append('UserFirebaseToken', '');

        fetch('LogOrSign.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    if (btn) btn.innerHTML = '<i class="fa-solid fa-check"></i> Welcome!';
                    const urlP = new URLSearchParams(window.location.search);
                    const rTo = urlP.get('return_to');
                    setTimeout(() => {
                        if (rTo) window.location.href = rTo;
                        else location.reload();
                    }, 1000);
                } else {
                    if (btn) btn.innerHTML = originalHtml;
                    alert('Backend Error: ' + (json.message || 'Unknown error'));
                }
            })
            .catch(err => {
                if (btn) btn.innerHTML = originalHtml;
                console.error("Fetch Error:", err);
                alert("Could not connect to server.");
            });
    }).catch((error) => {
        if (btn) btn.innerHTML = originalHtml;
        console.error("Firebase Login Error:", error.code, error.message);
        if (error.code === 'auth/unauthorized-domain') {
            alert("Error: This domain is not authorized in Firebase Console. Add your localhost/domain to 'Authorized Domains' in Firebase Authentication settings.");
        } else {
            alert("Google Login failed: " + error.message);
        }
    });
};

// Global Apple Login Flow
window.appleLogin = function () {
    if (!firebase.auth) {
        console.error("Firebase Auth SDK not loaded.");
        return;
    }
    const provider = new firebase.auth.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    
    const btn = document.querySelector('.btn-apple');
    const originalHtml = btn ? btn.innerHTML : 'Apple';

    console.log("Starting Apple Login...");
    if (btn) btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';

    firebase.auth().signInWithPopup(provider).then((result) => {
        const user = result.user;
        console.log("Apple Auth Success:", user.email);

        const providerData = user.providerData && user.providerData.length > 0 ? user.providerData.find(p => p.providerId === 'apple.com') || user.providerData[0] : null;
        const externalId = providerData ? providerData.uid : user.uid;

        const formData = new FormData();
        formData.append('AccountType', 'Apple');
        formData.append('SocialID', externalId); // Backend reads $_POST['SocialID']
        formData.append('name', user.displayName || 'Apple User');
        formData.append('Email', user.email || (user.uid + '@apple.com'));
        formData.append('Photo', user.photoURL || '');
        formData.append('UserFirebaseToken', '');

        fetch('LogOrSign.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    if (btn) btn.innerHTML = '<i class="fa-solid fa-check"></i> Welcome!';
                    const urlP = new URLSearchParams(window.location.search);
                    const rTo = urlP.get('return_to');
                    setTimeout(() => {
                        if (rTo) window.location.href = rTo;
                        else location.reload();
                    }, 1000);
                } else {
                    if (btn) btn.innerHTML = originalHtml;
                    alert('Backend Error: ' + (json.message || 'Unknown error'));
                }
            })
            .catch(err => {
                if (btn) btn.innerHTML = originalHtml;
                console.error("Fetch Error:", err);
                alert("Could not connect to server.");
            });
    }).catch((error) => {
        if (btn) btn.innerHTML = originalHtml;
        console.error("Firebase Apple Login Error:", error.code, error.message);
        alert("Apple Login failed: " + error.message);
    });
};
