import React, { FC } from "react";
import { db } from "./dexie";
import styled from "styled-components";
import Button from "@mui/material/Button";

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  color: white;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const App: FC = () => {
  return (
    <OuterContainer className="App">
      <InnerContainer>
        <Button
          onClick={() =>
            db.users.add({
              id: `user_${Date.now()}`,
              name: `user_${Date.now()}`,
            })
          }
          variant="contained"
        >
          Add User
        </Button>
        <Button onClick={() => db.users.toArray()} variant="contained">
          Get All Users
        </Button>
        <Button
          onClick={() => {
            db.transaction("rw", db.users, async () => {
              await db.users.add({
                id: `user_${Date.now()}`,
                name: `user_${Date.now()}`,
              });
              await db.users.add({
                id: `user_${Date.now()}`,
                name: `user_${Date.now()}`,
              });
            });
          }}
          variant="contained"
        >
          Run Transaction #1
        </Button>
        <Button
          onClick={() => {
            db.transaction("rw", db.users, async () => {
              const id = `user_${Date.now()}`;
              await db.users.add({
                id,
                name: `user_${Date.now()}`,
              });
              await db.users.get(id);
              await db.users.delete(id);
            });
          }}
          variant="contained"
        >
          Run Transaction #2
        </Button>
        <Button
          onClick={() => db.users.clear()}
          variant="contained"
          color="warning"
        >
          Clear All Users
        </Button>
      </InnerContainer>
    </OuterContainer>
  );
};

export default App;
