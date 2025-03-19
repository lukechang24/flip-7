import styled from "styled-components"

const S = {}

S.ButtonContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
`

S.AddForm = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: ${props => props.show ? "flex" : "none"};
	flex-direction: column;
`

S.FormTitle = styled.h3`
	
`

S.NameInput = styled.input`

`

S.AddButton = styled.button`

`


export default S