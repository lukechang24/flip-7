'use client'
import { useState, useEffect, useRef } from "react"
import { withFirebase } from "../../Firebase"
import S from "./style"
import originalDeck from "../deck"

const Game = ({ gameState, id, checkIfExists, shuffle, isHost, playerTemplate, firebase }) => {
  const { updateRoom } = firebase
  const { deck, discardPile, phase, players, whoseTurn, round, resolveSpecial, gameLog } = gameState
	const [thisPlayer, setThisPlayer] = useState({})
	const gameLogRef = useRef(null)

  const draw = async (i = null) => {
    let updatedDeck = [...deck]
		let updatedDiscardPile = [...discardPile]
    let updatedPlayers = [...players]
    let updatedWhoseTurn = ""
		let updatedResolveSpecial = resolveSpecial
		let updatedGameLog = [...gameLog]
		let message = ""

		let skipSpecial = true

		// If deck is empty, shuffle discard pile and set it to updatedDeck
		if (updatedDeck.length === 0 && updatedDiscardPile.length > 0) {
			updatedDeck = shuffle(updatedDiscardPile)
			updatedDiscardPile = []
		}

		// code is for mock player 3
		i = i ? i : updatedPlayers.findIndex(player => player.id === id)

		const player = updatedPlayers[i]
		const updatedHand = [...player.hand]
		let drawnCard = updatedDeck.pop()
		updatedHand.push(drawnCard)
		player.hand = updatedHand

		message += `${player.name} drew a ${formatMessage(drawnCard)}`

		// just to make it so player3 Cant draw any effect
		// if (i === 2 ) {
		// 	if (drawnCard.effect) {
		// 		drawnCard.effect = "plus2"

		// 	}
		// }
		
		// FIX DOUBLE CHECKING CHECKIFBUST
		if (player.status.indexOf("flipping") >= 0 && !checkIfBust(player, drawnCard, updatedDiscardPile, true)) {
			// if player draws flip3 or freeze during their flip3, resolvespecial is true
			if (player.hand.find(card => card.effect === "flip3" || card.effect === "freeze")) {
				// setResolveSpecial to false if the player has an unresolved special but ends up busting
				updatedResolveSpecial = checkIfBust(player, drawnCard, updatedDiscardPile) ? false : true
			}
			let updatedStatus = "active"

			if (player.status.slice(-1) === "1") {
				// else continue to upNext player
				if (updatedResolveSpecial) {
					skipSpecial = false
				} else {
					updatedStatus = "active" //might not need this
					const unresolvedPlayerIndex = players.findIndex(player => (player.status !== "busted" && player.status !== "stayed") && player.hand.some(card => card.effect === "flip3" || card.effect === "freeze"))
					if (unresolvedPlayerIndex === -1) {
						const nextPlayer = updatedPlayers.find(player => player.upNext)
						nextPlayer.upNext = false
						updatedWhoseTurn = nextPlayer.id
					}
				}
			} else {
				updatedStatus = `flipping${player.status.slice(-1) - 1}`
				updatedWhoseTurn = player.id
			}
			player.status = updatedStatus
		} else {
			updatedWhoseTurn = nextTurnId(updatedPlayers, i)
		}

		if (["secondChance", "flip3", "freeze"].includes(drawnCard.effect)) {
			let specialPhase = handleSpecial(player, drawnCard, updatedPlayers, i, updatedDiscardPile, updatedResolveSpecial)
			//if phase is changed to selecting, player is selecting a person to play an effect card so stop code here
			if (specialPhase) {
				message += " and is selecting a player"
				updatedGameLog.push(message)
				await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, phase: specialPhase, gameLog: updatedGameLog })
				return
			}
		}
		// If player didn't draw any other effect card and they busted
		else if (!drawnCard.effect && checkIfBust(player, drawnCard, updatedDiscardPile)) {
			// If busted player is admist flipping, stop flipping phase and move to next person
			if (player.status.indexOf("flipping") >= 0) {
				player.status = "busted"
				const nextPlayer = updatedPlayers.find(player => player.upNext)
				if (nextPlayer) {
					nextPlayer.upNext = false
					// If nextplayer and flipping player were the same person
					if (nextPlayer.status === "busted") {
						updatedWhoseTurn = nextTurnId(updatedPlayers, i)
					} else {
						updatedWhoseTurn = nextPlayer.id
					}
				}
			}
			bustPlayer(player)
			message += " and busted"
		}

		calculatePoints(updatedPlayers)

		// Updating turn to next player, this time including busted players
		const isWinner = checkIfWin(player)
		if (isWinner) {
			// End the round
			addPointsToTotal(updatedPlayers)
			message += " and flipped 7 point cards! Awarded an extra +15 points"
			updatedGameLog.push(message)
			await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, phase: "roundEnd", whoseTurn: updatedWhoseTurn, resolveSpecial: false, gameLog: updatedGameLog })
			return
		}

		// if theres a special to resolve, after drawing last flip3 card, resolve special
		if (updatedResolveSpecial && !skipSpecial) {
			updatedResolveSpecial = false
			const specialCard = player.hand.find(card => card.effect === "flip3" || card.effect === "freeze")
			const specialPhase = handleSpecial(player, specialCard, updatedPlayers, i, updatedDiscardPile, updatedResolveSpecial, skipSpecial)
			await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, phase: specialPhase, resolveSpecial: updatedResolveSpecial, gameLog: updatedGameLog })
			return
		}
		updatedGameLog.push(message)
    await updateRoom("room", { deck: updatedDeck, discardPile: updatedDiscardPile, players: updatedPlayers, whoseTurn: updatedWhoseTurn, resolveSpecial: updatedResolveSpecial, gameLog: updatedGameLog })
		checkIfAllBust(updatedPlayers, updatedGameLog)
  }


	const handleSpecial = (player, card, players, currIndex, discardPile, resolveSpecial, skip = true) => {
		// If they drew a second chance, set it true
		if (card.effect === "secondChance") {
			if (player.secondChance) {
				let secondChanceIndex = player.hand.findIndex(card => card.effect === "secondChance")
				discardPile.push(...player.hand.splice(secondChanceIndex, 1))
			} else {
				player.secondChance = true
			}
			return false
		} else {
			// if theres a special to resolve, don't do these.
			if (resolveSpecial) return false

			// else they drew freeze or flip3
			// distinguishing so handleSelect() can tell what to do after selection
			if (card.effect === "flip3") {
				const nextId = players[wrapIndex(currIndex + 1, players)] ? players[wrapIndex(currIndex + 1, players)].id : ""
				let savedNextPlayer = players.find(player => player.id === nextId)

				// if player pulls flip3 during their flip3, don't save "upNext"
				if (skip) {
					savedNextPlayer.upNext = true
				}
			}
			player.isSelecting = true
			let updatedPhase = card.effect === "flip3" ? "selectingFlip3" : "selectingFreeze"
			return updatedPhase
		}
	}

	const handleSelect = async (id) => {
		let updatedPlayers = [...players]
		let selectorIndex = updatedPlayers.findIndex(player => player.isSelecting)
		let targetedPlayer = updatedPlayers.find(player => player.id === id)
		let updatedDiscardPile = [...discardPile]
		let updatedPhase = ""
		let updatedWhoseTurn = ""
		const specialCardIndex = updatedPlayers[selectorIndex].hand.findIndex(card => card.effect === "freeze" || card.effect === "flip3")

		updatedPlayers[selectorIndex].isSelecting = false
		updatedDiscardPile.push(...updatedPlayers[selectorIndex].hand.splice(specialCardIndex, 1))

		// find player who got freezed and force them to stay
		if (phase === "selectingFreeze") {

			targetedPlayer.status = "stayed"
			targetedPlayer.upNext = false

			// if an upNext player exists, their turn will be next, otherwise continue turn order normally
			let upNextPlayer = updatedPlayers.find(player => player.upNext)

			// for two unresolved specials in a row
			const unresolvedPlayerIndex = players.findIndex(player => (player.status !== "busted" && player.status !== "stayed") && player.hand.some(card => card.effect === "flip3" || card.effect === "freeze"))

			if (upNextPlayer && unresolvedPlayerIndex === -1) {
				updatedWhoseTurn = upNextPlayer.id
				upNextPlayer.upNext = false
			} else {
				updatedWhoseTurn = nextTurnId(updatedPlayers, selectorIndex)
			}
	
			// If selected player is the selector themselves, end game
			if (updatedPlayers[selectorIndex].status === "stayed" && updatedWhoseTurn === id) {
				addPointsToTotal(updatedPlayers)
				updatedPhase = "roundEnd"
			} else {
				// else continue playing
				updatedPhase = "playing"
			}
		} else {
			// phase is selectingFlip3
			updatedWhoseTurn = id
			updatedPlayers.find(player => player.id === id).status = "flipping3"
			updatedPhase = "playing"
		}
		await updateRoom("room", { discardPile: updatedDiscardPile, players: updatedPlayers, whoseTurn: updatedWhoseTurn, phase: updatedPhase})
	}

	const stay = async () => {
		const updatedGameLog = [...gameLog]
		if (id !== whoseTurn) return
		const updatedPlayers = [...players]
		const i = updatedPlayers.findIndex(player => player.id === id)

		updatedPlayers[i].status = "stayed"
		let updatedWhoseTurn =  nextTurnId(updatedPlayers, i)
		//implement if last person decides to stay and end the round
		
		updatedGameLog.push(`${updatedPlayers[i].name} has decided to stay for this round`)
		await updateRoom("room", { players: updatedPlayers, whoseTurn: updatedWhoseTurn, gameLog: updatedGameLog })
		checkIfAllBust(updatedPlayers, updatedGameLog)
	}

	const bustPlayer = async (player) => {
		player.status = "busted"
		player.points = 0
		player.isSelecting = false
		player.secondChance = false
		player.upNext = false
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

	const addPointsToTotal = async (players) => {
		for (let i = 0; i < players.length; i++) {
			const player = players[i]
			player.totalPoints += player.points
			player.points = 0
		}
	}

	const checkIfWin = (player) => {
		let totalNum = 0
		player.hand.forEach(card => {
			if (card.value !== null) {
				totalNum++
			}
		})
		if (totalNum === 7 && player.status !== "busted") {
			player.status = "flip7"
			player.points += 15
			return true
		}
		return false
	}

  const checkIfBust = (player, card, discarded, skip = false) => {
		const hand = player.hand
    for (let i = 0; i < hand.length - 1; i++) {
      if ((hand[i].value === card.value) && !card.effect) {
				if (player.secondChance) {
					player.secondChance = false
					
					// just because we checkifbust twice
					if (skip) {
						player.secondChance = true
					} else {
						const secondChanceIndex = hand.findIndex(card => card.effect === "secondChance")
						discarded.push(...hand.splice(secondChanceIndex, 1))
						discarded.push(player.hand.pop())
					}
					return false
				}
        return true
      }
    }
    return false
  }

	const checkIfAllBust = async (players, gameLog = []) => {
		if (players.every(player => player.status === "busted" || player.status === "stayed") && players.length !== 0) {
			// let updatedWhoseTurn = nextTurnId(players, currIndex)
			// await updateRoom("room", { phase: "roundEnd", whoseTurn: updatedWhoseTurn })
			addPointsToTotal(players)
			gameLog.push(`Everyone has busted or stayed. End of round ${round}`)
			await updateRoom("room", { players, phase: "roundEnd", gameLog })
			return true
		}
		return false
	}

  const startNextRound = async () => {
		const updatedGameLog = [...gameLog]
		const updatedPlayers = [...players]
		const currIndex = updatedPlayers.findIndex(player => player.id === whoseTurn)
		let discardedCards = [...discardPile]
		for (let i = 0; i < updatedPlayers.length; i++) {
			const player = updatedPlayers[i]
			discardedCards.push(...player.hand)
			player.points = 0
			player.hand = []
			player.status = "active"
			player.secondChance = false
			player.remainingDraws = 0
			player.upNext = false
		}
		const updatedWhoseTurn = nextTurnId(updatedPlayers, currIndex)

		updatedGameLog.push(`Round ${round + 1}`)
		await updateRoom("room", { discardPile: discardedCards, players: updatedPlayers, phase: "playing", whoseTurn: updatedWhoseTurn, round: round + 1, gameLog: updatedGameLog })
  }

	const checkEndGame = () => {
		const updatedPlayers = [...players]
		const sortedPlayers = [...players].sort((a, b) => b.totalPoints - a.totalPoints)
		const isWinCondition = updatedPlayers.some(player => player.totalPoints >= 200)
		if (isWinCondition) {
			const updatedGameLog = [...gameLog]

			const winner = sortedPlayers[0]
			const winnerIndex = updatedPlayers.findIndex(player => player.id === winner.id)
			updatedPlayers[winnerIndex].status = "won"
			updatedGameLog.push(`${updatedPlayers[winnerIndex].name} is the winner!`)
			updateRoom("room", { players: updatedPlayers, gameLog: updatedGameLog })
		}
	}

	//implement to make setting whoseturn less chunky
	const nextTurnId = (players, index) => {
		return players[wrapIndex(index + 1, players)] ? players[wrapIndex(index + 1, players)].id : ""
	}

  const wrapIndex = (index, arr, counter = 0) => {
		// making sure counter doesnt loop too many times
    if (counter >= arr.length) return null

    let newIndex = ((index % arr.length) + arr.length) % arr.length  
		
    const isBustedOrStayed = arr[newIndex].status === "busted" || arr[newIndex].status === "stayed"  
    const noFlip7 = !arr.some(player => player.status === "flip7") 
    const roundNotOver = !arr.every(player => player.status === "busted" || player.status === "stayed")
		
		// meaning everyone had busted or stayed, just return whoever's turn it was initially
		if (!roundNotOver) {
			return index - 1
		}

    if (isBustedOrStayed && noFlip7 && roundNotOver) {
        return wrapIndex(index + 1, arr, counter + 1)  
    }  

    return newIndex  
	}

	const formatMessage = (card) => {
		if (card.effect) {
			switch(card.effect) {
				case "flip3":
					return "Flip-3"
				case "freeze":
					return "Freeze"
				case "secondChance":
					return "Revive"
				case "times2":
					return "point modifier (x2)"
				default:
					return `point modifier (+${card.effect.substring(4)})`
			}
		} else if (card.value === 0) {
			return "0"
		} else {
			return card.value
		}
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

	const addFlip3 = async () => {
		let updatedDeck = [...deck]
		updatedDeck[deck.length - 1] = { value: null, effect: "flip3" }
		await updateRoom("room", { deck: updatedDeck })
	}

	const addFreeze = async () => {
		let updatedDeck = [...deck]
		updatedDeck[deck.length - 1] = { value: null, effect: "freeze" }
		await updateRoom("room", { deck: updatedDeck })
	}

	// Keeping this player object constantly updated for ease of access
	useEffect(() => {
		setThisPlayer({...findPlayerById(players, id)})
	}, [players])

	useEffect(() => {
		// purpose is to catch any unresolved special cards and deal with them accordingly
		const unresolvedPlayerIndex = players.findIndex(player => (player.status !== "busted" && player.status !== "stayed") && player.hand.some(card => card.effect === "flip3" || card.effect === "freeze"))
		const flippingPlayer = players.find(player => player.status.indexOf("flipping") >= 0)
		if (unresolvedPlayerIndex >= 0 && !flippingPlayer) {
			// find who still has a special in their hand and play it sequentially
			const handleUnresolvedSpecial = async () => {
				const updatedPlayers = [...players]
				const updatedDeck = [...deck]
				const updatedDiscardPile = [...discardPile]
				const updatedResolveSpecial = resolveSpecial

				const unresolvedPlayer = updatedPlayers[unresolvedPlayerIndex]
				const specialCard = unresolvedPlayer.hand.find(card => card.effect === "flip3" || card.effect === "freeze")
	
				const specialPhase = handleSpecial(unresolvedPlayer, specialCard, updatedPlayers, unresolvedPlayerIndex, updatedDiscardPile, updatedResolveSpecial, false)
				
				await updateRoom("room", { deck: updatedDeck, players: updatedPlayers, phase: specialPhase, whoseTurn: unresolvedPlayer.id})
			}
			handleUnresolvedSpecial()
		}
	}, [whoseTurn])

	useEffect(() => {
		if (phase === "roundEnd") {
			checkEndGame()
		}
	}, [phase])

	useEffect(() => {
		if (gameLogRef.current) {
			gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight
		}
	}, [gameLog])

  const playerList = players ? rotateIds(id, players).map((player, i) => {
		const regularHandList = player.hand.map((hand, j, arr2) => {
			const animate = j === arr2.length - 1;
			const duplicate = arr2.findIndex(card => card.value === hand.value) !== arr2.findLastIndex(card => card.value === hand.value)
			if (hand.value !== null) return <S.Card key={j} animate={animate} duplicate={duplicate}>{hand.value}</S.Card> 
    })
		const specialHandList = player.hand.map((hand, j, arr2) => {
			const animate = j === arr2.length - 1;
			if (hand.effect) {
				let modEffect = hand.effect
				let smaller = true
				if (modEffect.indexOf("plus") !== -1) {
					smaller = false
					modEffect = "+" + modEffect.substring(4)
				} else if (modEffect.indexOf("times") !== -1) {
					smaller = false
					modEffect = "x" + modEffect.substring(5)
				} else if (modEffect === "flip3") {
					modEffect = "flip-3"
				} else if (modEffect === "secondChance") {
					modEffect = "revive"
				}
				return <S.Card key={j} animate={animate} smaller={smaller}>{modEffect}</S.Card>
			}
		})
    return (
      <S.PlayerContainer className={player.id === whoseTurn && phase !== "roundEnd" ? "highlight" : ""} position={i === 0 ? "bottom-left" : i === 1 ? "bottom-right" : i === 2 ? "right-center" : i === 3 ? "top-right" : i === 4 ? "top-left" : "left-center" } busted={player.status === "busted"} stayed={player.status === "stayed"}>
        <S.HandContainer>{regularHandList}</S.HandContainer>
				<S.HandContainer>{specialHandList}</S.HandContainer>
        <S.Points>{player.points}</S.Points>
        <S.Name>{player.name}</S.Name>
				<S.TotalPoints>{player.totalPoints}</S.TotalPoints>
				{
					player.isSelecting
						?
							<S.Banner>selecting player...</S.Banner>
						:
					player.status.indexOf("flipping") !== -1
						?
							<S.Banner>remaining cards to flip: {player.status[player.status.length - 1]}</S.Banner>
						:
					player.upNext && whoseTurn !== player.id
						?
							<S.Banner>this player's turn next</S.Banner>
						:
					player.status === "flip7"
						?
							<S.Banner>flipped 7!</S.Banner>
						:
							null
				}
      </S.PlayerContainer>
    )
  }) : null

	// when cards run out and discard pile gets merged with deck, leave the last element of discard in the pile still
	// add message of discard being rehuffled, also indicator of how many cards are left

	const selectList = players ? players.map((player, i) => {
		// make sure players who busted or stayed don't show up in the list
		if (player.status !== "busted" && player.status !== "stayed" ) return <S.SelectName key={i} onClick={() => handleSelect(player.id)}>{player.name}</S.SelectName>
	}) : null

	const messageList = gameLog ? gameLog.map((message, i) => {
		const name = message.split(" ")[0]
		const restOfMessage = message.split(" ").slice(1).join(" ")
		return <S.Message><S.Bold>{name}</S.Bold> {restOfMessage}</S.Message>
	}) : null

  return (
    (!players || !id)
      ?
        <p>loading</p>
      :

      <S.Container1>
				{playerList}
				<S.Container2>
					<S.GameLog ref={gameLogRef}>{messageList}</S.GameLog>
					<S.Container3>
						<S.Action onClick={() => draw()} disabled={id !== whoseTurn || thisPlayer.status === "busted" || phase !== "playing"}>draw</S.Action>
						{/* <button onClick={() => draw(2)} disabled={phase !== "playing"}>drawMock1</button>
						<button onClick={() => draw(3)} disabled={phase !== "playing"}>drawMock2</button> */}
						<S.Action onClick={stay} disabled={thisPlayer.points <= 0 || whoseTurn !== id ||thisPlayer.status !== "active" || phase !== "playing"}>stay</S.Action>
					</S.Container3>
					<S.NextRound onClick={startNextRound} show={phase === "roundEnd"} disabled={!isHost()}>next round</S.NextRound>
					{/* <button onClick={addFlip3}>Add Flip3</button>
					<button onClick={addFreeze}>Add Freeze</button> */}
				</S.Container2>
				<S.SelectContainer show={thisPlayer.isSelecting}>
					<S.SpecialTitle>{phase === "selectingFreeze" ? "Give this freeze card to: " : "Give this flip-3 card to: "}</S.SpecialTitle>
					{selectList}
				</S.SelectContainer>
      </S.Container1>
  )
}

export default withFirebase(Game)
