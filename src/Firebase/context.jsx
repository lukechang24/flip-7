import React from 'react'
import { FirebaseApp } from "firebase/app"

const FirebaseContext = React.createContext(null)

export const withFirebase = Component => props => (
  <FirebaseContext.Consumer>
    {firebase => <Component {...props} firebase={firebase} />}
  </FirebaseContext.Consumer>
)

export default FirebaseContext;
