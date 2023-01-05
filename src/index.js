const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: "User not found" });

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = users.find((user) => user.username === username);

  if (!user) {
    const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: [],
    };

    users.push(newUser);

    response.status(201).json(newUser);
  } else {
    response.status(400).json({ error: "User already exists" });
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const task = user.todos.find((task) => task.id === id);

  if (task) {
    task.title = title;
    task.deadline = new Date(deadline);

    return response.status(200).json(task);
  } else {
    return response.status(404).json({ error: "Todo not found" });
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const task = user.todos.find((task) => task.id === id);

  if (task) {
    task.done = true;

    return response.status(200).json(task);
  } else {
    return response.status(404).json({ error: "todo not found" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const taskIndex = user.todos.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    user.todos.splice(taskIndex, 1);

    return response.status(204).json(user.todos);
  } else {
    return response.status(404).json({ error: "Todo not found" });
  }
});

module.exports = app;
