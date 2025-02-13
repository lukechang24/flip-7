'use client'
import { useEffect } from "react"
// import { auth } from "./firebase"

import Game from "./Game"

export default function Home() {
//   useEffect(() => {
//     auth.onAuthStateChanged((user) => {
//         if (user) {
//             console.log(user)
//         } else {
//             console.log("no user")
//         }
//     })
// }, [])
  return (
    <div>
      <Game />
    </div>
  );
}
