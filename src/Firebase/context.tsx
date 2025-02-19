import React from 'react'
import { FirebaseApp } from "firebase/app"

interface FirebaseContextType {
  firebase: FirebaseApp;
}

const FirebaseContext = React.createContext<FirebaseContextType>(null)

export const withFirebase = Component => props => (
  <FirebaseContext.Consumer>
    {firebase => <Component {...props} firebase={firebase} />}
  </FirebaseContext.Consumer>
)

export default FirebaseContext;
