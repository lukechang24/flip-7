'use client'

import { useState, useEffect } from "react";
import { withFirebase } from "../Firebase";
import Game from "./Game";
import S from "./style"
import deck from "./deck";

const Home = ({ firebase }) => {
	const { findRoom, updateRoom, listenToRoom } = firebase

	const shuffle = (cards) => cards.sort(() => Math.random() - 0.5);
	const gameTemplate = {
		deck: [...shuffle(deck)],
		discardPile: [],
		players: [],
		phase: "waiting",
		whoseTurn: "",
		// isAllBust: false,
		round: 0,
		resolveSpecial: false
	}

	const playerTemplate = {
		id: "",
		name: "",
		hand: [],
		points: 0,
		totalPoints: 0,
		status: "active",
		isSelecting: false,
		secondChance: false,
		upNext: false
	}

	const [gameState, setGameState] = useState(gameTemplate)
	const [id, setId] = useState(null)
	const [showForm, setShowForm] = useState(false)
	const [name, setName] = useState("")

	const handleInput = (e) => {
		setName(e.target.value)
	}

	const addPlayer = async () => {
		if (!name) return
		if (gameState.players.find(player => player.name === name)) return false
		if (checkIfExists(id, gameState.players)) return
		setShowForm(false)
		const newPlayer = {
			...playerTemplate,
			id,
			name: name
		}

		await updateRoom("room", {
			players: [...gameState.players, newPlayer],
		})
	}

	const startGame = async () => {
		const randomNum = Math.floor(Math.random() * (gameState.players.length))
		await updateRoom("room", { phase: "playing", whoseTurn: gameState.players[randomNum].id, round: 1})
	}

	const resetGame = async () => {
		await updateRoom("room", gameTemplate);
	};

	const populateGame = async () => {
		if (gameState.players.length > 5) return
		const dummies = []
		for (let i = 0; i < 1; i++) {
			const player = {
				...playerTemplate,
				id: generateRandomId(),
				name: `player${gameState.players.length + 1}`
			}
			dummies.push(player)
		}
		await updateRoom("room", { players: [...gameState.players, ...dummies] })
	}

	const generateRandomId = () => {
		let randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
		return randomId
	}

	const checkIfExists = (id, arr) => {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].id === id) {
				return true
			}
		}
		return false
	}

	const isHost = () => gameState.players[0] ? gameState.players[0].id == id : false

	useEffect(() => {
		const id = window.localStorage.getItem("id")
			? window.localStorage.getItem("id")
			: generateRandomId();
		window.localStorage.setItem("id", id);
		setId(id);

		const unsubscribe = listenToRoom("room", async (newData) => {
			if (Object.keys(newData).length === 0) {
				await updateRoom("room", gameTemplate)
			}
			if (newData) {
				setGameState(newData);
			}
		});
		return () => unsubscribe();
	}, [])

	return (
		<div>
			<Game gameState={gameState} id={id} checkIfExists={checkIfExists} shuffle={shuffle} isHost={isHost} playerTemplate={playerTemplate}/>
			<S.ButtonContainer>
				{gameState.players.find((player) => player.id === id) 
					? 
						null 
					: 
						<button onClick={() => setShowForm(true)}>join game</button>
				}
				{isHost()
					?	
						<>
							<button onClick={startGame}>start game</button>
							{gameState.players[0] 
								?
									<button onClick={resetGame}>reset lobby</button>
								:
					 				null
							}
							<button onClick={populateGame}>populate game</button>
						</>
					:
						null

				}
			</S.ButtonContainer>
			<S.AddForm show={showForm}>
				<S.FormTitle>Player name: </S.FormTitle>
				<S.NameInput onChange={handleInput}></S.NameInput>
				<S.AddButton onClick={addPlayer}>Join Game</S.AddButton>
			</S.AddForm>
		</div>
	);
};

export default withFirebase(Home);
