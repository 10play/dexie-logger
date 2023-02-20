import React, { FC } from "react";
import { db } from "./dexie";
import styled from "styled-components";

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  color: white;
`;

const App: FC = () => {
  return (
    <OuterContainer className="App">
      <button
        onClick={() =>
          db.users.add({
            id: `user_${Date.now()}`,
            name: `user_${Date.now()}`,
          })
        }
      >
        add user
      </button>
    </OuterContainer>
  );
};

export default App;
