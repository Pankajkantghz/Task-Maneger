document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromLocalStorage();

  document.querySelectorAll(".task-list").forEach((list) => {
    list.addEventListener("dragover", (e) => e.preventDefault());
    list.addEventListener("drop", handleDrop);
  });

  // Delegate delete event to task container
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-task")) {
      const taskId = e.target.closest(".task-card").id;
      deleteTask(taskId);
    }
  });
});

function handleDrop(e) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text/plain");
  const taskCard = document.getElementById(taskId);
  const newColumnId = e.currentTarget.closest(".task-column").id;

  e.currentTarget.appendChild(taskCard);
  updateTaskColumn(taskId, newColumnId);
}

function showAddTaskForm(columnId) {
  const modal = document.getElementById("add-task-modal");
  modal.style.display = "flex";
  modal.dataset.columnId = columnId;
}

function addTask() {
  const modal = document.getElementById("add-task-modal");
  const columnId = modal.dataset.columnId;
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-desc").value;
  const priority = document.getElementById("task-priority").value;

  if (title && description) {
    const taskCard = createTaskCard(title, description, priority, columnId);
    document
      .getElementById(columnId)
      .querySelector(".task-list")
      .appendChild(taskCard);

    saveTaskToLocalStorage(taskCard.id, title, description, priority, columnId);

    // Clear input fields and hide modal
    modal.style.display = "none";
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-priority").value = "low";
  }
}

function createTaskCard(
  title,
  description,
  priority,
  columnId,
  taskId = `task-${Date.now()}`
) {
  const taskCard = document.createElement("div");
  taskCard.classList.add("task-card");
  taskCard.draggable = true;
  taskCard.id = taskId;

  taskCard.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", taskCard.id);
  });

  taskCard.innerHTML = `
    <h3>${title}</h3>
    <p>${description}</p>
    <div class="task-info">
      <span class="priority ${priority.toLowerCase()}">${capitalizeFirstLetter(
    priority
  )}</span>
      <span>${new Date().toLocaleDateString()}</span>
    </div>
    <button class="delete-task">×</button>
  `;

  return taskCard;
}

function deleteTask(taskId) {
  document.getElementById(taskId).remove();
  removeTaskFromLocalStorage(taskId);
}

function saveTaskToLocalStorage(
  taskId,
  title,
  description,
  priority,
  columnId
) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ id: taskId, title, description, priority, columnId });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(taskId) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const updatedTasks = tasks.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
}

function updateTaskColumn(taskId, newColumnId) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    task.columnId = newColumnId;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => {
    const taskList = document
      .getElementById(task.columnId)
      .querySelector(".task-list");
    const taskCard = createTaskCard(
      task.title,
      task.description,
      task.priority,
      task.columnId,
      task.id
    );
    taskList.appendChild(taskCard);
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
