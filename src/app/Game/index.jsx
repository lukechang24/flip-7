'use client'
import { useState, useEffect } from "react"
import { withFirebase } from "../../Firebase"
import S from "./style"
import originalDeck from "../deck"

const Game = ({ gameState, id, firebase }) => {
    const { deck, phase, players, whoseTurn } = gameState
    const draw = async () => {
        const updatedDeck = [...deck]
        const updatedPlayers = [...players]
        for (let i = 0; i < players.length; i++) {
            if (id === players[i].id) {
                const updatedHand = [...players[i].hand]
                let drawnCard = updatedDeck.pop()
                updatedHand.push(drawnCard)
                updatedPlayers[i].hand = updatedHand
            }
        }
        await firebase.updateRoom("room", { deck: updatedDeck, players: updatedPlayers })
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

    const checkIfExists = (id, arr) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === id) {
                return true;
            }
        }
        return false;
    }

    const playerList = players ? rotateIds(id, players).map((player, i, arr) => {
        const handList = player.hand.map((hand, i) => {
            return <p>{hand.value ? hand.value : hand.effect}</p>
        })

        return (
            <S.PlayerContainer position={i === 0 ? "bottom1" : i === 1 ? "bottom2" : i === 2 ? "right1" : i === 3 ? "right2" : i === 4 ? "top1" : i === 5 ? "top2" : i === 6 ? "left1" : "left2"}>
                <p>{player.id}</p>
                <div>{handList}</div>
            </S.PlayerContainer>
        )
    }) : null
    return (
        <S.Container1>
            <button onClick={draw}>draw</button>
            {playerList}
        </S.Container1>
    )
}

export default withFirebase(Game)
