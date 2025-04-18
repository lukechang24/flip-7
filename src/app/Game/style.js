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
		props.position === "top-left" || props.position === "bottom-left" ? "calc(22vw)" :
		props.position === "top-right" || props.position === "bottom-right" ? "calc(100vw - 22vw - var(--box-width))" :
		props.position === "left-center" ? "0" :
		props.position === "right-center" ? "calc(100vw - var(--box-width))" :
		"0"};
	width: var(--box-width);
	height: var(--box-height);
	display: flex;
	flex-direction: column;
	border: 5px solid white;
	background-color: ${props => props.busted ? "grey" : props.stayed ? "#1976D2" : "lightblue"};
	box-sizing: border-box;
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
	width: 35px;
	height: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: ${props => props.smaller ? "12px" : "16px"};
	border: ${props => props.duplicate ? "1px solid red" : "1px solid black"};
  margin: 2.5px;
	text-align: center;

  transition: opacity 1s ease-in;
  animation: ${props => props.animate ? "fadeIn 0.3s forwards" : "none"};
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

S.Points = styled.p`
	position: absolute;
	bottom: 0;
	left: 0;
	margin-left: 5px;
`

S.TotalPoints = styled.p`
	position: absolute;
	bottom: 0;
	right: 0;
	margin-right: 5px;
`

S.Banner = styled.div`
	position: absolute;
	bottom: 30px;
	width: 100%;
	background-color: #333333;
	color: white;
	text-align: center;
`

S.SelectContainer = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 175px;
	display: ${props => props.show ? "flex" : "none"};
	flex-direction: column;
	background-color: rgba(0, 0, 0, 0.8);
	color: white;
	padding: 10px;
  border: 1px solid #444; /* Slightly darker border */
	border-radius: 12px;
	box-sizing: border-box;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`

S.SpecialTitle = styled.p`

`

S.SelectName = styled.button`
	font-size: 16px;
	background-color: rgba(255, 255, 255, 0.2); /* Slightly dark background */
	color: white;
	padding: 8px;
  border: none;
  border-radius: 8px;
	margin: 5px 0;
  font-weight: lighter;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3); /* Lighter on hover */
    transform: scale(1.05); /* Slightly enlarge on hover */
  }

`

S.Container2 = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
`

S.GameLog = styled.div`
  width: 350px;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 14px;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	overflow-y: auto;
	scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`

S.Message = styled.div`
	font-size: 16px;
	background-color: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 5px;
	font-weight: lighter;
  line-height: 1.4;
`

S.Bold = styled.span`
	color: #ffd700;
	font-weight: bolder;
`

S.Container3 = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-around;
`

S.Action = styled.button`
	width: 100px;
	padding: 10px;
	border: none;
  border-radius: 8px;
	margin-top: 20px;
	transition: background-color 0.3s, transform 0.1s;
  text-transform: uppercase;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`

S.NextRound = styled.button`
	width: 100px;
	visibility: ${props => props.show ? "visible" : "hidden"};
	padding: 10px;
	border: none;
  border-radius: 8px;
	margin-top: 20px;
	transition: background-color 0.3s, transform 0.1s;
  text-transform: uppercase;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`

export default S
