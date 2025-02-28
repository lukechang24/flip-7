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
  // opacity: 0;
  transition: opacity 1s ease-in;
  animation: ${props => props.highlight ? "fadeIn 0.3s forwards" : "none"};

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
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

export default S
