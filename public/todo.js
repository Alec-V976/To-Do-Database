// SWE2511 - Todo List client code

/**
 * Error message handling functions, set and clear the error message displayed to the user
 */
const displayError = (message) => {
    const errorMessage = document.getElementById("errormsg");
    errorMessage.innerText = message;
    errorMessage.classList.remove("visually-hidden");
};
const clearError = () => {
    const errorMessage = document.getElementById("errormsg");
    errorMessage.innerText = "";
    errorMessage.classList.add("visually-hidden");
};

/**
 * doDoneClick - handler for clicking on a row's checkbox
 */
const doDoneClick = async (e) => {
    const checkTarget = e.target;
    const done = checkTarget.checked;

    clearError();
    try {
        await markTodo(checkTarget.todoId, done);
    } catch (error) {
        checkTarget.checked = !done;
        displayError(`Unexpected error: ${error.name}: ${error.message}`);
    }
};

/**
 * doAddRow - Adds a row to the to do table and sets appropriate actions
 */
const doAddRow = (id, date, task, owner, done) => {
    // Add the row to the table
    //   Use unique identifiers based on the todo identifier
    const tableBody = document.getElementById("todostable");
    const newRow = tableBody.insertRow();
    newRow.id = `row${id}`;
    newRow.className = "todo";

    // Add a cell for the date
    const dateCell = newRow.insertCell();
    dateCell.className = "shrink";
    dateCell.innerText = date.toLocaleString("en-US");

    // Add a cell for the owner text
    const ownerCell = newRow.insertCell();
    ownerCell.className = "shrink";
    ownerCell.innerText = owner;

    // Add a cell for the task text
    const taskCell = newRow.insertCell();
    taskCell.innerText = task;

    // Add the check element
    const checkCell = newRow.insertCell();
    checkCell.className = "text-center";
    const checkElement = document.createElement("input");

    // task: create a special attribute to store the ID
    checkElement.todoId = id;
    checkElement.id = `check${id}`;
    checkElement.className = "form-check-input";
    checkElement.type = "checkbox";
    checkElement.checked = done;
    checkElement.onclick = doDoneClick;
    checkCell.appendChild(checkElement);
};

/**
 * doLoadToDos - Loads all to do tasks from the server
 */
const doLoadToDos = async () => {

    try {
        // Load the todolist items
        const results = await getTodos();

        // Show the results
        results.forEach((entry) => {
            // NOTE update the call to doAddRow to use _id instead of id to use the identifier generated by MongoDB
            doAddRow(entry._id, new Date(entry.creation_date), entry.task, entry.owner, entry.completed);
        });
    } catch (error) {
        // Error handler
        displayError(`Unexpected error: ${error.name}: ${error.message}`);
    }
};

/**
 * doAddToDo - Adds a new "to do" task
 */
const doAddToDo = async () => {

    const taskElement = document.getElementById("taskinput");
    const ownerElement = document.getElementById("ownerinput");

    // Hide the error message if it's displayed
    clearError();

    // Retrieve the user input and make sure it is not blank
    const taskText = taskElement.value;
    if(taskText.length === 0) {
        displayError("Task cannot be blank");
        return;
    }
    const ownerText = ownerElement.value;
    if(ownerText.length === 0) {
        displayError("Owner cannot be blank");
        return;
    }

    try {
        // Disable the input
        document.getElementById("taskinput").disabled = true;
        document.getElementById("ownerinput").disabled = true;
        document.getElementById("addtodo").disabled = true;

        // request a new todo be created
        const results = await createTodo(taskText, ownerText);

        // Add the row to the table
        document.getElementById("taskinput").disabled = false;
        document.getElementById("ownerinput").disabled = false;
        document.getElementById("addtodo").disabled = false;

        // NOTE update the call to doAddRow to use _id instead of id to use the identifier generated by MongoDB
        doAddRow(results._id, new Date(results.creation_date), results.task, results.owner, results.completed);
    } catch (error) {
        document.getElementById("taskinput").disabled = false;
        document.getElementById("ownerinput").disabled = false;
        document.getElementById("addtodo").disabled = false;
        displayError(`Unexpected error: ${error.name}: ${error.message}`);
    }
};

window.onload = () => {
    document.getElementById("addtodo").onclick = doAddToDo;
    doLoadToDos();
};
