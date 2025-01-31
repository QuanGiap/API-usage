//get component from html
const arr_update_show = [];
const url = "http://localhost:3000";
const tab_log_in = document.getElementById("tab_log_in");
const tab_sign_up = document.getElementById("tab_sign_up");
const log_in_form = document.getElementById("log_in_form");
const log_in_button = document.getElementById("log_in_button");
const sign_up_button = document.getElementById("sign_up_button");
const add_task_button = document.getElementById("add_task_button");
const task_title_edit_input = document.getElementById("edit_task_title");
const task_description_edit_input = document.getElementById("edit_task_description");
const task_title_create_input =  document.getElementById('task_title');
const task_description_create_input =  document.getElementById('task_description');
const task_container = document.getElementById("task_container");
const task_list = document.getElementById("task_list");
const auth_container = document.getElementById("auth_container");
const logout_button = document.getElementById("logout_button");
const sign_up_form = document.getElementById("sign_up_form");
const edit_task_modal = document.getElementById("edit_task_modal");
const close_edit_task_modal = document.getElementById("close_edit_task_modal");
const edit_task_form = document.getElementById("edit_task_form");
//add event
logout_button.addEventListener("click", logout);
log_in_form.addEventListener("submit", signIn);
sign_up_form.addEventListener("submit", signUp);
add_task_button.addEventListener('click',createTask);
window.addEventListener('beforeunload',saveState);
//close edit modal when click exit button
close_edit_task_modal.addEventListener("click", () => {
    isEditTask.current = false;
    clearEditInput()
    updateUI();
});
//close edit modal when click outside of edit container
window.addEventListener("click", (event) => {
    if (event.target == edit_task_modal) {
        isEditTask.current=false;
        clearEditInput()
        updateUI();
    }
});
//update task when click update button
edit_task_form.addEventListener("submit", (event) => {
    updateTask(event,current_edit_task_id);
    isEditTask.current = false;
    updateUI();
});
//change to login form when click
tab_log_in.addEventListener("click", () => {
  isSignUp.current = false;
  updateUI();
});
//change to sign_up form when click
tab_sign_up.addEventListener("click", () => {
  isSignUp.current = true;
  updateUI();
});

let finished_tasks = [];
let unfinish_tasks = [];
let current_edit_task_id = null;
let title_text_create = ''; 
let description_text_create = '';
let title_text_edit = ''; 
let description_text_edit = ''; 
let isSignUp = { current: false };
let isAuthSection = { current: true };
let isEditTask = { current: false };
let token = getCookie("auth_token");

//add event when to login section or signup section
arr_update_show.push(() =>
  updateUIShow(log_in_form, isSignUp, (v) => !v.current)
);
arr_update_show.push(() => updateUIShow(sign_up_form, isSignUp));
//add event when to choose auth section or task list section
arr_update_show.push(() =>
  updateUIShow(task_container, isAuthSection, (v) => !v.current)
);
arr_update_show.push(() =>
  updateUIShow(auth_container, isAuthSection, (v) => v.current)
);
//add event when edit_task container should show up
arr_update_show.push(() => updateUIShow(edit_task_modal, isEditTask));

// if no token exist go to auth section
if (token) {
  //token exist, get user task data
  isAuthSection = { current: false };
  getTasks();
}
//check if text input exist in local storage
checkPrevState();
updateUI();


/**
 * Handles the sign-in process.
 * Prevents the default form submission, retrieves the username and password,
 * sends a POST request to the server, and handles the response.
 *
 * @param {Event} event - The event object.
 */
async function signIn(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(url + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if(data.error){
        alert(data.error);
        return;
      }
      setToken("auth_token", data.token);
      token = data.token;
      isAuthSection.current = false;
      getTasks();
      updateUI();
    })
    .catch((error) => console.error("Error:", error));
}

/**
 * Handles the sign-up process.
 * Prevents the default form submission, retrieves the new username, password,
 * and confirm password, validates the passwords, sends a POST request to the server,
 * and handles the response.
 *
 * @param {Event} event - The event object.
 */
async function signUp(event) {
  event.preventDefault();
  const newUsername = document.getElementById("new_username").value;
  const newPassword = document.getElementById("new_password").value;
  const confirmPassword = document.getElementById("confirm_password").value;

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  fetch(url + "/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: newUsername, password: newPassword }),
  })
    .then((response) => response.json())
    .then((data) => {
    if(data.error){
        alert(data.error);
        return;
        }
      setToken("auth_token", data.token);
      token = data.token;
      isAuthSection.current = false;
      getTasks();
      updateUI();
    })
    .catch((error) => console.error("Error:", error));
}

/**
 * Updates the UI display of an element based on a comparison function.
 *
 * @param {HTMLElement} el - The element to update.
 * @param {Object} val - The value object containing the current state.
 * @param {Function} [cmpFn=(v) => v.current] - The comparison function to determine the display state.
 * @param {string} [init_display="block"] - The initial display style.
 * @throws Will throw an error if the value object does not have a current property.
 */
function updateUIShow(
  el,
  val,
  cmpFn = (v) => v.current,
  init_display = "block"
) {
  if (val === undefined || val.current === undefined)
    throw new Error("Update UI error, current not found");
  el.style.display = cmpFn(val) ? init_display : "none";
}

/**
 * Updates the UI by calling all functions in the arr_update_show array.
 */
function updateUI() {
  arr_update_show.forEach((fn) => fn());
}

/**
 * Get value cookie from name
 */
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}
/**
 * Set token to cookie
 */
function setToken(cname, cvalue, exdays = 1) {
    if(!cvalue) return;
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
/**
 * Get tasks for user
 */
function getTasks() {
  fetch(url + "/todos", {
    headers: { authorization: "Bearer " + token },
  })
    .then((response) => response.json())
    .then((data) => {
        finished_tasks = data.filter((val)=>val.completed);
        unfinish_tasks = data.filter((val)=>!val.completed);
        renderTasks()
    })
    .catch((err) => {
      console.log(err);
    });
}
/**
 * Renders the task list to the UI.
 */
function renderTasks() {
    task_list.innerHTML = "";
    const allTasks = [...unfinish_tasks,...finished_tasks];
    allTasks.forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.className = "task";
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>Completed: ${task.completed}</p>
            <button onclick="editTask(${task.id})">Edit</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
            <button onclick="markTask(${task.id}, ${!task.completed})">
                Mark as ${task.completed ? "Incomplete" : "Complete"}
            </button>
        `;
        task_list.appendChild(taskElement);
    });
}

/**
 * Creates a new task.
 */
function createTask(event) {
    event.preventDefault();
    const title = task_title_create_input.value;
    const description = task_description_create_input.value;
    fetch(url + "/todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + token,
        },
        body: JSON.stringify({ title, description }),
    })
        .then((response) => response.json())
        .then((data) => {
            if(data.error){
              alert(data.error);
              return;
            }
            clearCreateInput();
            unfinish_tasks.push(data);
            renderTasks();
        })
        .catch((error) => console.error("Error:", error));
}

/**
 * Updates an existing task.
 */
function updateTask(event,id) {
    event.preventDefault();
    const title = task_title_edit_input.value;
    const description = task_description_edit_input.value;
    fetch(url + `/todos/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + token,
        },
        body: JSON.stringify({ title, description }),
    })
        .then((response) => response.json())
        .then((data) => {
            if(data.error){
              alert(data.error);
              return
            }
            const taskIndex = unfinish_tasks.findIndex((task) => task.id === id);
            if (taskIndex !== -1) {
                unfinish_tasks[taskIndex] = data;
            } else {
                const finishedTaskIndex = finished_tasks.findIndex((task) => task.id === id);
                if (finishedTaskIndex !== -1) {
                    finished_tasks[finishedTaskIndex] = data;
                }
            }
            clearEditInput()
            renderTasks();
        })
        .catch((error) => console.error("Error:", error));
}

/**
 * Deletes a task.
 */
function deleteTask(id) {
    fetch(url + `/todos/${id}`, {
        method: "DELETE",
        headers: {
            authorization: "Bearer " + token,
        },
    })
        .then(() => {
            unfinish_tasks = unfinish_tasks.filter((task) => task.id !== id);
            finished_tasks = finished_tasks.filter((task) => task.id !== id);
            renderTasks();
        })
        .catch((error) => console.error("Error:", error));
}

/**
 * Marks a task as completed or not completed.
 */
function markTask(id, completed) {
    fetch(url + `/todos/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + token,
        },
        body: JSON.stringify({ completed }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (completed) {
                unfinish_tasks = unfinish_tasks.filter((task) => task.id !== id);
                finished_tasks.push(data);
            } else {
                finished_tasks = finished_tasks.filter((task) => task.id !== id);
                unfinish_tasks.push(data);
            }
            renderTasks();
        })
        .catch((error) => console.error("Error:", error));
}

/**
 * Logs out the user by clearing the cookies and updating the UI.
 */
function logout() {
    clearCookies();
    isAuthSection.current = true;
    localStorage.clear();
    updateUI();
}

/**
 * Clears all cookies.
 */
function clearCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
}
/**
 * Show up edit task box on click
 */
function editTask(id) {
    const task = unfinish_tasks.find(task => task.id === id) || finished_tasks.find(task => task.id === id);
    if (!task) return;
    current_edit_task_id = id;
    task_title_edit_input.value = task.title;
    task_description_edit_input.value = task.description;
    isEditTask.current = true;
    updateUI();
}
/**
 * Check if previous text input was saved
 */
function checkPrevState(){
  const task_edit_title = localStorage.getItem('task_edit_title')||'';
  const task_edit_desciption = localStorage.getItem('task_edit_desciption')||'';
  current_edit_task_id = localStorage.getItem('current_edit_task_id')||null;
  task_title_create_input.value = localStorage.getItem('task_create_title')||'';;
  task_description_create_input.value = localStorage.getItem('task_create_desciption')||'';;
  task_title_edit_input.value = task_edit_title;
  task_description_edit_input.value = task_edit_desciption;
  if(task_edit_title!==''||task_edit_desciption!==''){
    isEditTask.current = true;
  }
}

/**
 * save current text input to local storage
 */
function saveState(){
  localStorage.setItem('task_create_title',task_title_create_input.value||'')
  localStorage.setItem('task_create_desciption',task_description_create_input.value||'');
  localStorage.setItem('task_edit_title',task_title_edit_input.value||'');
  localStorage.setItem('task_edit_desciption',task_description_edit_input.value||'');
  localStorage.setItem('current_edit_task_id',current_edit_task_id||null);
}

function clearEditInput(){
  current_edit_task_id = null;
  task_description_edit_input.value = '';
  task_title_edit_input.value = '';
}

function clearCreateInput(){
  task_title_create_input.value = '';
  task_description_create_input.value = '';
}
console.log(token)