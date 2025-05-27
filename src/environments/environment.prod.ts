
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment } from './environment.model';
export const environment = {
  production: false,
  firebase: {  // <-- Nom de propriété important
    apiKey: "AIzaSyC0LWFdP8STa8sXEVBfz1zL9Tv_PAzdFuU",
  authDomain: "weatherapp-a4506.firebaseapp.com",
  databaseURL: "https://weatherapp-a4506-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "weatherapp-a4506",
  storageBucket: "weatherapp-a4506.firebasestorage.app",
  messagingSenderId: "781832787375",
  appId: "1:781832787375:web:f1a228d7350b2fef0b4b5a",
  measurementId: "G-4FCD0WBYH5"
  }
} 



