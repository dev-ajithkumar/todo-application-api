const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3").verbose();
let app = express();
app.use(express.json());
let database = null;
const port = 3000;
let dbFilePath = path.join(__dirname, "./todoApplication.db");

// const db = new sqlite3.Database(dbFilePath);
// db.run(`CREATE TABLE IF NOT EXISTS todo (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   todo TEXT,
//   priority TEXT,
//   status TEXT
// )`);

const connectDatabaseWithServer = async () => {
  try {
    database = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server Started...!`);
    });
  } catch (error) {
    console.log(`Connection Failed : ${error.message}   `);
  }
};

connectDatabaseWithServer();

app.get("/todos/", async (req, res) => {
  const { status = "", priority = "", search_q = "" } = req.query;
  let getAllTodosQuery = `SELECT * FROM todo WHERE  todo like '%${search_q}%' AND status like '%${status}%' AND priority like '%${priority}%'`;

  let dbResponse = await database.all(getAllTodosQuery);
  res.send(dbResponse);
});

app.get("/todos/:todoId", async (req, res) => {
  let { todoId } = req.params;
  let getTodoQuery = `SELECT * FROM todo WHERE id = '${todoId}'`;
  let dbResponse = await database.get(getTodoQuery);
  res.send(dbResponse);
});

app.post("/todos/", async (req, res) => {
  let createNewTodo = req.body;
  let { todo, priority, status } = createNewTodo;
  let createQuery = `INSERT INTO todo (todo,priority,status) VALUES('${todo}','${priority}','${status}')`;
  let dbResponse = await database.run(createQuery);
  res.send(`Todo Successfully Added`);
});

app.put("/todos/:todoId", async (req, res) => {
  let result = null;
  let { todoId } = req.params;
  let { todo, priority, status } = req.body;
  if (todo) {
    let updateQuery = `UPDATE todo SET todo = '${todo}' WHERE id = '${todoId}'`;
    let dbResponse = await database.run(updateQuery);
    result = `Todo Updated`;
  } else if (priority) {
    let updateQuery = `UPDATE todo SET priority = '${priority}' WHERE id = '${todoId}'`;
    let dbResponse = await database.run(updateQuery);
    result = `Priority Updated`;
  } else if (status) {
    let updateQuery = `UPDATE todo SET priority = '${status}' WHERE id = '${todoId}'`;
    let dbResponse = await database.run(updateQuery);
    result = `Status Updated`;
  } else {
    res.send(`Not Updated`);
  }
  res.send(result);
});

app.delete("/todos/:todoId", async (req, res) => {
  let { todoId } = req.params;
  let deleteQuery = `DELETE FROM todo WHERE id = '${todoId}'`;
  await database.run(deleteQuery);
  res.send(`Todo Deleted`);
});

module.exports = app;
