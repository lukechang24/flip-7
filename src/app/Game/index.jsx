'use client'
import { useState, useEffect } from "react"
import { withFirebase } from "../../Firebase"
import S from "./style"
import originalDeck from "../deck"

const Game = ({ gameState, id, checkIfExists, firebase }) => {
  const { findRoom, updateRoom } = firebase
  const { deck, phase, players, whoseTurn, isAllBust, round } = gameState
  const draw = async () => {
    const updatedDeck = [...deck]
    const updatedPlayers = [...players]
    let updatedWhoseTurn = ""
    for (let i = 0; i < players.length; i++) {
      if (id === players[i].id) {
        const updatedHand = [...players[i].hand]
        let drawnCard = updatedDeck.pop()
        updatedHand.push(drawnCard)
        updatedPlayers[i].hand = updatedHand
				
        calculatePoints(updatedPlayers)
				
        if (!drawnCard.effect && checkIfBust(players[i].hand, drawnCard)) {
					updatedPlayers[i].isBust = true
          updatedPlayers[i].points = 0
        }
				checkIfWin(updatedPlayers[i])
				updatedWhoseTurn = updatedPlayers[wrapIndex(i + 1, updatedPlayers)] ? updatedPlayers[wrapIndex(i + 1, updatedPlayers)].id : ""
      }
    }
    await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, whoseTurn: updatedWhoseTurn })
  }

  const drawMock = async () => {
    const updatedDeck = [...deck]
    const updatedPlayers = [...players]
    let updatedWhoseTurn = ""

		const i = 2
		const updatedHand = [...players[i].hand]
		let drawnCard = updatedDeck.pop()
		updatedHand.push(drawnCard)
		updatedPlayers[i].hand = updatedHand
		
		calculatePoints(updatedPlayers)
		
		if (!drawnCard.effect && checkIfBust(players[i].hand, drawnCard)) {
			updatedPlayers[i].isBust = true
			updatedPlayers[i].points = 0
		}
		checkIfWin(updatedPlayers[i])
		updatedWhoseTurn = updatedPlayers[wrapIndex(i + 1, updatedPlayers)] ? updatedPlayers[wrapIndex(i + 1, updatedPlayers)].id : ""

    await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, whoseTurn: updatedWhoseTurn })
  }

  const calculatePoints = (arr) => {
    arr.forEach((player, i) => {
      let points = 0
      let isDouble = false
      player.hand.forEach(card => {
        if (card.value) {
          points += card.value
        } else if (card.effect.includes("plus")) {
          points += extractNumber(card.effect)
        } else if (card.effect === "times2") {
          isDouble = true
        }
      })
      arr[i].points = isDouble ? points * 2 : points
    })
  }

	const handleCard = () => {

	}

	const checkIfWin = async (player) => {
		const totalNum = 0
		player.hand.forEach(card => {
			if (card.value) {
				totalNum++
			}
		})
		if (totalNum === 7) {
			await updateRoom("room", { phase: "intersession" })
		}
	}

  const checkIfBust = (hand, card) => {
    for (let i = 0; i < hand.length - 1; i++) {
      console.log(hand[i], card)
      if (hand[i].value === card.value) {
        return true
      }
    }
    return false
  }

  const startNextRound = () => {

  }
  
  const rotateIds = (id, arr) => {
    if (!id || !arr[0]) return []
    let updatedArr = [...arr]
    if (checkIfExists(id, updatedArr)) {
      while (updatedArr[0].id !== id) {
        updatedArr.unshift(updatedArr.pop())
      }
    }
    return updatedArr
  }

  const wrapIndex = (index, arr, counter = 0) => {
    if (counter >= arr.length) {
      console.log("did this!")
      return null
    }
    console.log("running this")
    let newIndex = ((index % arr.length) + arr.length) % arr.length
    if (arr[newIndex].isBust) {
      return wrapIndex(index + 1, arr, counter + 1)
    }
    return newIndex
  }

  const findPlayerById = (playerList, playerId) => {
    if (!playerList || playerList.length === 0 || !playerId) return null;
    return playerList.find(player => player.id === playerId);
  }

  const extractNumber = (str) => {
    const match = str.match(/\d+/)
    return match ? parseInt(match[0], 10) : null
  }

  useEffect(() => {
    const checkIfAllBust = async () => {
      if (players.every(player => player.isBust) && players.length !== 0) {
        console.log("diong this")
        await updateRoom("room", { whoseTurn: "" })
        return true
      }
      return false
    }
    checkIfAllBust()
  }, [players])

  const playerList = players ? rotateIds(id, players).map((player, i, arr) => {
    const handList = player.hand.map((hand, i) => {
      return <S.Card>{hand.value ? hand.value : hand.effect}</S.Card>
    })
    return (
      <S.PlayerContainer className={player.id === whoseTurn ? "highlight" : ""} position={i === 0 ? "bottom-left" : i === 1 ? "bottom-right" : i === 2 ? "right-center" : i === 3 ? "top-right" : i === 4 ? "top-left" : "left-center" } grayout={player.isBust}>
        <S.HandContainer>{handList}</S.HandContainer>
        <S.Points>{player.points}</S.Points>
        <S.Name>{player.name}</S.Name>
      </S.PlayerContainer>
    )
  }) : null
  return (
    (!players || !id)
      ?
        <p>loading</p>
      :

      <S.Container1>
        <button onClick={draw} disabled={id !== whoseTurn || findPlayerById(players, id).isBust}>draw</button>
        <button onClick={drawMock}>drawMock</button>
        {playerList}
        <button onClick={startNextRound} disabled={!isAllBust || !round}>next round</button>
      </S.Container1>
  )
}

export default withFirebase(Game)
