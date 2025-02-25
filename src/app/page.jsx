'use client'

import { useState, useEffect } from "react";
import { withFirebase } from "../Firebase";
import Game from "./Game";
import deck from "./deck";

const Home = ({ firebase }) => {
	const { findRoom, updateRoom, listenToRoom } = firebase
	const [gameState, setGameState] = useState({
		deck: [],
		players: [],
		phase: "",
		whoseTurn: "",
		isAllBust: false,
		round: 0
	});
	const [id, setId] = useState(null);

	const shuffle = () => deck.sort(() => Math.random() - 0.5);

	const generateRandomId = () => {
		let randomId = Math.random().toString(36).substring(2, 15) +
			  Math.random().toString(36).substring(2, 15);
		return randomId;
	};

	const checkIfExists = (id, arr) => {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].id === id) {
				return true;
			}
		}
		return false;
	};

	const addPlayer = async () => {
		const roomData = await findRoom("room");
		if (checkIfExists(id, roomData.players)) return;

		const newPlayer = {
			id,
			name: `player${roomData.players.length + 1}`,
			hand: [],
			points: 0,
			totalPoints: 0,
			isBust: false,
			isSelecting: false,
		};

		await updateRoom("room", {
			players: [...roomData.players, newPlayer],
		});
	}

	const startGame = async () => {
		const randomNum = Math.floor(Math.random() * (gameState.players.length))
		console.log(randomNum)
		await updateRoom("room", { whoseTurn: gameState.players[randomNum].id, round: 1})
	}

	const resetGame = async () => {
		const cleanGame = {
			deck: [...shuffle()],
			players: [],
			phase: "",
			whoseTurn: "",
			isAllBust: false,
			round: 0
		}
		await updateRoom("room", cleanGame);
	};

	const populateGame = async () => {
		if (gameState.players.length > 5) return
		const dummies = []
		for (let i = 0; i < 1; i++) {
			const person = {
				id: generateRandomId(),
				name: `player${gameState.players.length + 1}`,
				hand: [],
				points: 0,
				totalPoints: 0,
				isBust: false,
				isSelecting: false,
			}
			dummies.push(person)
		}
		await updateRoom("room", { players: [...gameState.players, ...dummies] })
	}

	useEffect(() => {
		const id = window.localStorage.getItem("id")
			? window.localStorage.getItem("id")
			: generateRandomId();
		window.localStorage.setItem("id", id);
		setId(id);

		const unsubscribe = listenToRoom("room", async (newData) => {
			if (Object.keys(newData).length === 0) {
				const cleanGame = {
					deck: [...shuffle()],
					players: [],
					phase: "",
					whoseTurn: "",
					isAllBust: false,
					round: 0
				};
				await updateRoom("room", cleanGame)
			}
			if (newData) {
				setGameState(newData);
			}
		});
		return () => unsubscribe();
	}, []);

	return (
		<div>
			<Game gameState={gameState} id={id} checkIfExists={checkIfExists} />
			{gameState.players.find((player) => player.id === id) ? null : (
				<button onClick={addPlayer}>add player</button>
			)}
			<button onClick={startGame}>start game</button>
			<button onClick={resetGame}>reset lobby</button>
			<button onClick={populateGame}>populate game</button>
		</div>
	);
};

export default withFirebase(Home);
