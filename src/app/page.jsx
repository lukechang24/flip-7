'use client'
import { useState, useEffect } from "react"
import { withFirebase } from "../Firebase"
import Game from "./Game"
import deck from "./deck"

const Home = ({ firebase }) => {
  const [gameState, setGameState] = useState({ deck: [], phase: "", players: [], whoseTurn: "" })
  const [id, setId] = useState(null)

  const shuffle = () => deck.sort(() => Math.random() - 0.5)
  const generateRandomId = () => {
    let randomId = localStorage.getItem("id") ? localStorage.getItem("id") : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return randomId
  }
  const checkIfExists = (id, arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        return true;
      }
    }
    return false;
  }
  const addPlayer = async () => {

    const roomData = await firebase.findRoom("room")
    if (checkIfExists(id, roomData.players)) return
    const newPlayer = {
      id,
      name: `player${roomData.players.length + 1}`,
      hand: [],
      isSelecting: false
    }

    await firebase.updateRoom("room", {
      players: [...roomData.players, newPlayer]
    })
  }
  const resetGame = async () => {
    const cleanGame = {
      players: [],
      deck: [...shuffle()],
      whoseTurn: "",
      phase: "",
    }
    await firebase.updateRoom("room", cleanGame)
  }

  useEffect(() => {
    const id = window.localStorage.getItem('id') ? window.localStorage.getItem('id') : generateRandomId()
    window.localStorage.setItem("id", id)
    setId(id)

    const unsubscribe = firebase.listenToRoom("room", (newData) => {
      if (newData) {
        setGameState(newData)
      }
    })
    return () => unsubscribe()
  }, [])
  return (
    <div>
      <Game gameState={gameState} id={id} />
      {gameState.players.find(player => player.id === id)
        ?
        null
        :
        <button onClick={addPlayer}>add player</button>
      }
      <button onClick={resetGame}>reset lobby</button>
    </div>
  );
}

export default withFirebase(Home)