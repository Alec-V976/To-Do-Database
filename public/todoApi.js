// SWE2511 - Todo List Server
//
//  Todo client API functions

const getToDosURL = "http://localhost:3000/todos";
const createToDoURL = "http://localhost:3000/create";
const updateToDoURL = "http://localhost:3000/todo";

/*
 * getTodos - Calls GET todos endpoint to retrieve current todos
 */
const getTodos = async () => {

    // Request the todolist items
    const response = await fetch(getToDosURL);

    // Check for a valid HTTP response
    if(response.ok !== true) {
        throw new Error(response.statusText);
    }

    // Retrieve the todolist items
    const results = await response.json();
    if(results.status === "error") {
        throw new Error(results.message);
    }

    // Return the results
    return results;
};

/*
 * createTodo - Calls POST create endpoint to create a new todo item
 */
const createTodo = async (task, owner) => {

    // Request the new todo
    const response = await fetch(`${createToDoURL}?task=${task}&owner=${owner}`, {
        method: 'POST'
    });

    // Check for a valid HTTP response
    if(response.ok !== true) {
        throw new Error(response.statusText);
    }

    // Retrieve the new todo
    const results = await response.json();
    if(results.status === "error") {
        throw new Error(results.message);
    }

    // Return the new todo
    return results.todo;
};

/*
 * Calls the PATCH todo endpoint to mark it completed (or not)
 */
const markTodo = async (id, completed) => {

    // Request the update
    const response = await fetch(`${updateToDoURL}?id=${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        // Send the id and completed value to the server
        body: JSON.stringify({
            completed: completed,
        })
    });

    // Check for a valid HTTP response
    if(response.ok !== true) {
        throw new Error(response.statusText);
    }

    // Make sure the update was made correctly
    const results = await response.json();
    if(results.status === "error") {
        throw new Error(results.message);
    }

    // Return the updated todo
    return results.todo;
};