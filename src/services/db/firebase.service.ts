import firebase from 'firebase-admin';

export function initFirebase() {
    if (!process.env.FIREBASE_PROJECT_ID)
        throw new Error('FIREBASE_PROJECT_ID environment variable is missing!');
    if (!process.env.FIREBASE_CLIENT_EMAIL)
        throw new Error('FIREBASE_CLIENT_EMAIL environment variable is missing!');
    if (!process.env.FIREBASE_PRIVATE_KEY)
        throw new Error('FIREBASE_PRIVATE_KEY environment variable is missing!');

    firebase.initializeApp({
        credential: firebase.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
        } as firebase.ServiceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebase.io`
    });

    const firestoreSettings = {
        ignoreUndefinedProperties: true
    } as FirebaseFirestore.Settings;
    firebase.firestore().settings(firestoreSettings);
}
