const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;
const initializer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3009, () =>
      console.log("Sever is running at http://localhost:3009/")
    );
  } catch (e) {
    console.log(`DB error${e.message}`);
    process.exit(1);
  }
};
initializer();

const convertObj = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};

//API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team`;

  const playersArray = await db.all(getPlayersQuery);
  //response.send(playersArray);
  response.send(playersArray.map((eachPlayer) => convertObj(eachPlayer)));
  //console.log(playersArray);
});

//api 2
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
   INSERT INTO
   cricket_team (player_name, jersey_number, role )
   VALUES
   ('${playerName}',${jerseyNumber},'${role}'
   ) `;
  const playerCrateResponse = await db.run(addPlayerQuery);

  response.send("Player Added to Team");
});
//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE 
    player_id = ${playerId};`;
  const getPlayerResponse = await db.get(getPlayerQuery);
  response.send(convertObj(getPlayerResponse));
});

//API 4

app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const { playerName, jerseyNumber, role } = request.body;
    const updatePlayerQuery = ` UPDATE cricket_team SET 
    player_name= '${playerName}', jersey_number= ${jerseyNumber},
    role= '${role}' WHERE player_id= ${playerId};
   `;
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
});

// //API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
     DELETE FROM cricket_team WHERE player_id= ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
