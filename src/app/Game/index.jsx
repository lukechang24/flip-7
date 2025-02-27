'use client'
import { useState, useEffect } from "react"
import { withFirebase } from "../../Firebase"
import S from "./style"
import originalDeck from "../deck"

const Game = ({ gameState, id, checkIfExists, firebase }) => {
  const { findRoom, updateRoom } = firebase
  const { deck, phase, players, whoseTurn, round } = gameState
	const [thisPlayer, setThisPlayer] = useState({})
  const draw = async () => {
    const updatedDeck = [...deck]
    const updatedPlayers = [...players]
    let updatedWhoseTurn = ""
		const i = updatedPlayers.findIndex(player => player.id === id)

		const player = updatedPlayers[i]
		const updatedHand = [...player.hand]
		let drawnCard = updatedDeck.pop()
		updatedHand.push(drawnCard)
		player.hand = updatedHand
		
		// If player didn't draw an effect card and they busted
		if (!drawnCard.effect && checkIfBust(player.hand, drawnCard)) {
			player.status = "busted"
			player.points = 0

		}

		calculatePoints(updatedPlayers)

		// Updating turn to next player, this time including busted players
		const isWinner = checkIfWin(player)
		if (isWinner) {
			let updatedWhoseTurn = updatedPlayers[wrapIndex(i + 1, players)] ? players[wrapIndex(i + 1, players)].id : ""
			await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, phase: "roundEnd", whoseTurn: updatedWhoseTurn })
			return
		}

		updatedWhoseTurn = updatedPlayers[wrapIndex(i + 1, updatedPlayers)] ? updatedPlayers[wrapIndex(i + 1, updatedPlayers)].id : ""

    await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, whoseTurn: updatedWhoseTurn })
		checkIfAllBust(updatedPlayers)
  }

  const drawMock = async () => {
    const updatedDeck = [...deck]
    const updatedPlayers = [...players]
    let updatedWhoseTurn = ""
		const i = 2

		const player = updatedPlayers[i]
		const updatedHand = [...player.hand]
		let drawnCard = updatedDeck.pop()
		updatedHand.push(drawnCard)
		player.hand = updatedHand
		
		// If player didn't draw an effect card and they busted
		if (!drawnCard.effect && checkIfBust(player.hand, drawnCard)) {
			player.status = "busted"
			player.points = 0

		}

		calculatePoints(updatedPlayers)

		// Updating turn to next player, this time including busted players
		const isWinner = checkIfWin(player)
		if (isWinner) {
			let updatedWhoseTurn = updatedPlayers[wrapIndex(i + 1, players)] ? players[wrapIndex(i + 1, players)].id : ""
			await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, phase: "roundEnd", whoseTurn: updatedWhoseTurn })
			return
		}

		updatedWhoseTurn = updatedPlayers[wrapIndex(i + 1, updatedPlayers)] ? updatedPlayers[wrapIndex(i + 1, updatedPlayers)].id : ""

    await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, whoseTurn: updatedWhoseTurn })
		checkIfAllBust(updatedPlayers)
  }

	const handleCard = () => {

	}

	const stay = async () => {
		if (id !== whoseTurn) return
		const updatedPlayers = [...players]
		const i = updatedPlayers.findIndex(player => player.id === id)

		updatedPlayers[i].status = "stayed"
		let updatedWhoseTurn =  nextTurnId(updatedPlayers, i)

		await updateRoom("room", { players: updatedPlayers, whoseTurn: updatedWhoseTurn })
	}

	//implement to make setting whoseturn less chunky
	const nextTurnId = (players, index) => {
		return players[wrapIndex(index + 1, players)] ? players[wrapIndex(index + 1, players)].id : ""
	}
	
  const calculatePoints = (arr) => {
    arr.forEach((player, i) => {
			if (player.status === "busted") return
      let points = 0
      let isDouble = false
      player.hand.forEach(card => {
        if (card.value || card.value === 0) {
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

	const checkIfWin = (player) => {
		let totalNum = 0
		player.hand.forEach(card => {
			if (card.value) {
				totalNum++
			}
		})
		if (totalNum === 7 && player.status !== "busted") {
			player.status = "flip7"
			player.points += 15
			return true
			// playing, flip7, roundEnd
		}
		return false
	}

  const checkIfBust = (hand, card) => {
    for (let i = 0; i < hand.length - 1; i++) {
      if (hand[i].value === card.value) {
        return true
      }
    }
    return false
  }

	const checkIfAllBust = async (players) => {
		if (players.every(player => player.status === "busted" || player.status === "stayed") && players.length !== 0) {
			const currIndex = players.findIndex((player) => player.id === id)
			let updatedWhoseTurn = players[wrapIndex(currIndex + 1, players)] ? players[wrapIndex(currIndex + 1, players)].id : ""
			console.log("ALL BUSTED")
			await updateRoom("room", { phase: "roundEnd", whoseTurn: updatedWhoseTurn })
			return true
		}
		return false
	}

  const startNextRound = async () => {
		const updatedPlayers = [...players]
		let discardedCards = []
		for (let i = 0; i < updatedPlayers.length; i++) {
			const player = updatedPlayers[i]
			discardedCards = [...discardedCards, ...player.hand]
			player.totalPoints += player.points
			player.points = 0
			player.hand = []
			player.status = "active"
		}
		await updateRoom("room", { discardPile: discardedCards, players: updatedPlayers, phase: "playing", round: round + 1 })
  }

  const wrapIndex = (index, arr, counter = 0) => {
    if (counter >= arr.length) {
      return null
    }
    let newIndex = ((index % arr.length) + arr.length) % arr.length

		// Make sure not to skip over busted players when the round is already over
    if ((arr[newIndex].status === "busted" || arr[newIndex].status === "stayed") && !arr.find((player => player.status === "flip7")) && !arr.every(player => player.status === "busted")) {
      return wrapIndex(index + 1, arr, counter + 1)
    }
    return newIndex
  }

	//Makes everyone see themselves as the first player on the bottom
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

  const findPlayerById = (playerList, playerId) => {
    if (!playerList || playerList.length === 0 || !playerId) return null
    return playerList.find(player => player.id === playerId)
  }

  const extractNumber = (str) => {
    const match = str.match(/\d+/)
    return match ? parseInt(match[0], 10) : null
  }

	// Keeping this player object constantly updated for ease of access
	useEffect(() => {
		setThisPlayer({...findPlayerById(players, id)})
	}, [players])

  const playerList = players ? rotateIds(id, players).map((player, i, arr) => {
    const handList = player.hand.map((hand, i) => {
      return <S.Card>{hand.value ? hand.value : hand.effect}</S.Card>
    })
    return (
      <S.PlayerContainer className={player.id === whoseTurn && phase === "playing" ? "highlight" : ""} position={i === 0 ? "bottom-left" : i === 1 ? "bottom-right" : i === 2 ? "right-center" : i === 3 ? "top-right" : i === 4 ? "top-left" : "left-center" } busted={player.status === "busted"} stayed={player.status === "stayed"}>
        <S.HandContainer>{handList}</S.HandContainer>
        <S.Points>{player.points}</S.Points>
        <S.Name>{player.name}</S.Name>
				<S.TotalPoints>{player.totalPoints}</S.TotalPoints>
      </S.PlayerContainer>
    )
  }) : null
  return (
    (!players || !id)
      ?
        <p>loading</p>
      :

      <S.Container1>
        <button onClick={draw} disabled={id !== whoseTurn || thisPlayer.status === "busted" || phase ==="roundEnd"}>draw</button>
        <button onClick={drawMock} disabled={phase ==="roundEnd" || phase === "waiting"}>drawMock</button>
				<button onClick={stay} disabled={thisPlayer.points <= 0 || whoseTurn !== id}>stay</button>
        {playerList}
        <button onClick={startNextRound} disabled={phase !== "roundEnd" || !round}>next round</button>
      </S.Container1>
  )
}

export default withFirebase(Game)
