const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDHbDfqa-LdsbbtNg0QUr7rSeXomqx6n-c",
    authDomain: "tlemons-46212.firebaseapp.com",
    databaseURL: "https://tlemons-46212-default-rtdb.firebaseio.com/",
    projectId: "tlemons-46212"
};

class FirebaseService {
    constructor() {
        this.db = null;
        this.sitesRef = null;
    }

    async init() {
        if (typeof firebase === 'undefined') {
            await this.loadFirebaseSDK();
        }
        
        firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.database();
        this.sitesRef = this.db.ref('sites');
    }

    async loadFirebaseSDK() {
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js'
        ];

        for (const src of scripts) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }

    onSitesChange(callback) {
        return this.sitesRef.on('value', (snapshot) => {
            callback(snapshot.val() || {});
        });
    }

    async addSite(siteId, siteData) {
        return this.sitesRef.child(siteId).set(siteData);
    }

    async updateSiteStatus(siteId, status) {
        return this.sitesRef.child(siteId).child('status').set(status);
    }

    async deleteSite(siteId) {
        return this.sitesRef.child(siteId).remove();
    }

    offSitesChange() {
        this.sitesRef.off();
    }
}

export default FirebaseService;