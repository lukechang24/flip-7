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
    top: ${props => props.position === "bottom1" || props.position === "bottom2" ? "calc(750px - 250px)" : props.position === "top1" || props.position === "top2" ? 0 : props.position === "left1" || props.position === "left2" || props.position === "right1" || props.position === "right2" ? "calc(calc((750px - 250px)/2))" : 0};
    left: ${props => props.position === "bottom" || props.position === "top" ? "calc((750px - 250px)/2)" : props.position === "left" ? 0 : props.position === "right" ? "calc(750px - 250px)" : 0};
    width: 250px;
    height: 250px;
    display: flex;
    flex-direction: ${props => props.position === "bottom" ? "column-reverse" : "column"};
    justify-content: center;
    align-items: center;
    background-color: lightblue;
    border: 5px solid white;
    &.highlight {
        border: 5px solid greenyellow;
    }
`


export default S