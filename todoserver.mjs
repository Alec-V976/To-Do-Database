// SWE2511 - Todo List Server

// Task Object
// - ID - number
// - task - string
// - owner - string
// - completed - boolean
// - created - date

// Read - GET
//   No parameters

// Create - POST - task, owner required
//   completed - false
//   created - now

// Update - PATCH - ID required
//   task - string
//   owner - string
//   completed - boolean
//   can't change creation date

// Remove - DELETE - ID is required
//   No additional parameters

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// Connect to mongoose todolist database
//   NOTE: Requires mongod.exe to be running
try {
    await mongoose.connect("mongodb://127.0.0.1:27017/todolist");
} catch (error) {
    console.log(`Unable to connect to mongodb: ${error}`);
    process.exit();
}

// Create a schema for todo item
const todo_schema = mongoose.Schema({
    task: String,
    owner: String,
    completed: Boolean,
    creation_date: Date
});

// Connect my schema to a collection - todos
const todo_model = mongoose.model("todos", todo_schema);

const app = new express();

// Use JSON Middleware to interpret request body as JSON
app.use(express.json());
app.use(cors());
// Use static middleware for static front-end hosting
app.use(express.static("public", { index: "home.html" }));

// Helper functions for parameter validation
/*
 * Checks if a value is defined
 */
const isDefined = (value) => (
    value !== undefined && value !== null && typeof(value) !== 'undefined'
);

/*
 * Checks if value is defined, is a string, and has a length > 0
 */
const isNonEmptyString = (value) => (
    isDefined(value) && typeof(value) === "string" && value.length > 0
);

/*
 * Checks if a value is defined and is a number
 */
const isInteger = (value) => (
    isDefined(value) !== undefined && !isNaN(value) && Number.isInteger(parseFloat(value))
);

/*
 *  GET /todos endpoint - retrieves the list of todo items
 */
app.get("/todos", async (request, response) => {
    // Find all todo items in the database collection
    try {
        const todo_items = await todo_model.find();
        response.json(todo_items);
    } catch (error) {
        response.json({
            status: "error",
            message: `Database Error: ${error.message}`
        });
    }

    // todo_model.find()
    //     .then((todo_items) => {
    //         response.json(todo_items);
    //     })
    //     .catch((error) => {
    //         response.json({
    //             status: "error",
    //             message: `Database Error: ${error.message}`
    //         });
    //     });
});

/*
 * POST /create endpoint - creates a new todo
 *      Requires task name and owner as query parameter strings
 */
app.post('/create', async (request, response) => {
    // Task is required
    if(!isNonEmptyString(request.query.task)) {
        response.json({
            status: "error",
            message: "Task must be a non-empty string"
        });
        return;
    }
    // Owner is required
    if(!isNonEmptyString(request.query.owner)) {
        response.json({
            status: "error",
            message: "Owner must be a non-empty string"
        });
        return;
    }

    try {
        // Create the todo item
        const newTodo = new todo_model({
            task: request.query.task,
            owner: request.query.owner,
            completed: false,
            creation_date: Date.now(),
        });

        // Save the document
        await newTodo.save();

        // Return the new todo item
        response.json({
            status: "success",
            todo: newTodo
        });
    } catch(error) {
        response.json({
            status: "error",
            message: `Database Error: ${error.message}`
        });
    }
});

/*
 * PATCH /todo endpoint - updates a todo item
 *       Requires ID as query parameter number
 *       Updates to make are set via body parameters
 */
app.patch('/todo', async (request, response) => {
    // ID is required
    if(!isNonEmptyString(request.query.id)) {
        response.json({
            status: "error",
            message: "ID is required"
        });
        return;
    }

    // Validate update to make
    const updateToMake = request.body;
    if(isDefined(updateToMake.task) && !isNonEmptyString(updateToMake.task)) {
        response.json({
            status: "error",
            message: "Task must be a non-empty string"
        });
        return;
    }
    if(isDefined(updateToMake.owner) && !isNonEmptyString(updateToMake.owner)) {
        response.json({
            status: "error",
            message: "Owner must be a non-empty string"
        });
        return;
    }
    if(isDefined(updateToMake.completed) && typeof(updateToMake.completed) !== 'boolean') {
        response.json({
            status: "error",
            message: "Completed must be a boolean value"
        });
        return;
    }

    try {
        // Find the element to update
        const todoToUpdate = await todo_model.findById(request.query.id);
        if(!isDefined(todoToUpdate)) {
            response.json({
                status: "error",
                message: "Todo not found"
            });
            return;
        }

        // Make the update
        if(isDefined(updateToMake.task)) {
            todoToUpdate.task = updateToMake.task;
        }
        if(isDefined(updateToMake.owner)) {
            todoToUpdate.owner = updateToMake.owner;
        }
        if(isDefined(updateToMake.completed)) {
            todoToUpdate.completed = updateToMake.completed;
        }

        // Save the changes
        await todoToUpdate.save();

        // Return the updated todo item
        response.json({
            status: "success",
            todo: todoToUpdate
        });
    } catch(error) {
        response.json({
            status: "error",
            message: `Database Error: ${error.message}`
        });
    }
});

/*
 * DELETE /todo endpoint - deletes a todo by ID
 *        Requires ID as query parameter number
 *        No other required parameters
 */
app.delete("/todo", async (request, response) => {
    // ID is required
    if(!isNonEmptyString(request.query.id)) {
        response.json({
            status: "error",
            message: "ID is required"
        });
        return;
    }

    // Find the element and delete it
    try {
        const deleted_todo = await todo_model.findByIdAndDelete(request.query.id);
        if(!isDefined(deleted_todo)) {
            response.json({
                status: "error",
                message: "Todo not found"
            });
        } else {
            response.json({
                status: "success"
            });
        }
    } catch(error) {
        response.json({
            status: "error",
            message: `Database Error: ${error.message}`
        });
    }
});

app.listen(3000, () => {
    console.log("listening on http://localhost:3000");
});