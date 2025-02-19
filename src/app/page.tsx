'use client'
import { useEffect } from "react"
import { withFirebase } from "../Firebase"
import Game from "./Game"

const Home = ({ firebase }) => {
  //   useEffect(() => {
  //     auth.onAuthStateChanged((user) => {
  //         if (user) {
  //             console.log(user)
  //         } else {
  //             console.log("no user")
  //         }
  //     })
  // }, [])
  { console.log(firebase) }
  return (
    <div>
      <Game />
    </div>
  );
}

export default withFirebase(Home)