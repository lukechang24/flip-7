'use client'
import { useState, useEffect } from "react"
import { withFirebase } from "../Firebase"
import Game from "./Game"

const Home = ({ firebase }) => {
  const [gameState, setGameState] = useState({})
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
    const randomId = localStorage.getItem("id") ? localStorage.getItem("id") : generateRandomId()
    localStorage.setItem("id", randomId)
    const roomData = await firebase.findRoom("room")
    if (checkIfExists(randomId, roomData.players)) return
    const newPlayer = {
      id: randomId,
      name: `player${roomData.players.length + 1}`,
      hand: []
    }

    await firebase.updateRoom("room", {
      players: [...roomData.players, newPlayer]
    })
  }
  const resetGame = async () => {
    const cleanGame = {
      players: [...gameState.players],
      deck: [],
      whoseTurn: "",
      phase: ""
    }
    await firebase.updateRoom("room", cleanGame)
  }

  useEffect(() => {
    addPlayer()
    const unsubscribe = firebase.listenToRoom("room", (newData) => {
      if (newData) {
        setGameState(newData)
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <div>
      <Game />
      <button onClick={resetGame}>hi</button>
    </div>
  );
}

export default withFirebase(Home)