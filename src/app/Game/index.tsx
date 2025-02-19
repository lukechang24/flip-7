'use client'
import { useState, useEffect } from "react"
import originalDeck from "../deck"

export default function Game() {
    const [deck, setDeck] = useState([...originalDeck])
    const shuffle = () => {
        const shuffledDeck = deck.sort(() => Math.random() - 0.5)
        setDeck(shuffledDeck);
    }
    useEffect(() => {
        shuffle()
    }, [])
    return (
        "hi"
    )
}
