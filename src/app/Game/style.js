import styled from "styled-components"

const S = {}

S.Container1 = styled.div`
	position: relative;
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	overflow-x: hidden;
	overflow-y: hidden;
`

S.PlayerContainer = styled.div`
	position: absolute;
	top: ${props =>
		props.position === "top-left" || props.position === "top-right" ? "0" :
		props.position === "bottom-left" || props.position === "bottom-right" ? "calc(100vh - var(--box-height))" :
		props.position === "left-center" || props.position === "right-center" ? "calc((100vh - var(--box-height)) / 2)" :
		"0"};
	left: ${props =>
		props.position === "top-left" || props.position === "bottom-left" ? "calc(25vw)" :
		props.position === "top-right" || props.position === "bottom-right" ? "calc(100vw - 25vw - var(--box-width))" :
		props.position === "left-center" ? "0" :
		props.position === "right-center" ? "calc(100vw - var(--box-width))" :
		"0"};
	width: var(--box-width);
	height: var(--box-height);
	display: flex;
	// flex-direction: ${props => props.position === "bottom" ? "column-reverse" : "column"};
	flex-direction: column;
	background-color: ${props => props.busted ? "grey" : props.stayed ? "#1976D2" : "lightblue"};
	border: 5px solid white;
	&.highlight {
		border: 5px solid greenyellow;
	}
`

S.Name = styled.h3`
	position: absolute;
	bottom: 0;
	width: 100%;
	text-align: center;
`

S.HandContainer = styled.div`
	display: flex;
`

S.Card = styled.div`
  margin: 0 2.5px;
  transition: opacity 1s ease-in;
  animation: ${props => props.animate ? "fadeIn 0.3s forwards" : "none"};
	border: ${props => props.duplicate ? "1px solid red" : "1px solid transparent"};
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

S.DiscardPile = styled.div`
	position: relative;
`

S.DiscardCard = styled.div`
		position: absolute;
		left: ${props => props.shift ? `${props.shift * 10}px` : "0"};
		top: ${props => props.shift ? `${props.shift * 10}px` : "0"};
`

S.Points = styled.p`
	position: absolute;
	bottom: 0;
	left: 0;
`

S.TotalPoints = styled.p`
	position: absolute;
	bottom: 0;
	right: 0;
`

S.SelectContainer = styled.div`
	position: absolute;
	top: calc((100vh / 2) - 50px);
	left: calc((100vw / 2) - 75px);
	width: 150px;
	height: 100px;
	display: ${props => props.show ? "flex" : "none"};
	flex-direction: column;
	background-color: grey;
	opacity: 60%;
`

S.SelectName = styled.button`

`

export default S
