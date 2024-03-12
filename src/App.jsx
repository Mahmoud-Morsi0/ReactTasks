import { useState, useEffect } from "react";
import {
  getDaysInMonth,
  getDate,
  getMonth,
  getYear,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import {
  addDoc,
  collection,
  Timestamp,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./services/firebase.js";
import { useSelector } from "react-redux";
import { GoTrash } from "react-icons/go";

function App() {
  const [tasks, setTasks] = useState();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [tasksAndDates, setTasksAndDates] = useState();
  const today = new Date();
  const currentDay = getDate(today);
  const currentYear = getYear(today);
  const currentMonth = getMonth(today) + 1;
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const daysInMonth = getDaysInMonth(selectedDay);
  const userInfo = useSelector((state) => state.user.userInfo);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState();
  const [taskStatus, setTaskStatus] = useState();

  const ArrayOfDays = eachDayOfInterval({
    start: new Date(selectedYear, selectedMonth - 1, 1),
    end: new Date(selectedYear, selectedMonth - 1, daysInMonth),
  });

  const goToNextMonth = () => {
    const newMonthDate = addMonths(selectedDay, 1);
    const newMonth = getMonth(newMonthDate) + 1;
    setSelectedDay(newMonthDate);
    setSelectedMonth(newMonth);
    setSelectedYear(getYear(newMonthDate));
  };

  const goToPreviousMonth = () => {
    const newMonthDate = subMonths(selectedDay, 1);
    const newMonth = getMonth(newMonthDate) + 1;
    setSelectedDay(newMonthDate);
    setSelectedMonth(newMonth);
    setSelectedYear(getYear(newMonthDate));
  };

  const mergeTasksToDates = () => {
    let daysAndTasks = [];
    for (let day of ArrayOfDays) {
      let dayTasks = [];
      for (let task of tasks) {
        if (isSameDay(day, task.createdAtDate)) {
          dayTasks.push(task);
        }
      }
      daysAndTasks.push({
        day,
        tasks: dayTasks,
      });
    }
    setTasksAndDates(daysAndTasks);
  };

  const addOrEditTaskHandler = async () => {
    if (editMode) {
      console.log({ selectedTask });
      await updateDoc(doc(db, "tasks", selectedTask.id), {
        title: taskTitle,
        status: taskStatus,
      });
    } else {
      await addDoc(collection(db, "tasks"), {
        createdBy: userInfo.email,
        createdById: userInfo.id,
        createdAt: Timestamp.fromDate(new Date(taskDate)),
        status: "pending",
        teamID: "",
        title: taskTitle,
      });
    }
    document.getElementById("add_task_modal").close();
    callTasksHandler();
  };

  const deleteTaskHandler = async () => {
    await deleteDoc(doc(db, "tasks", selectedTask.id));
    document.getElementById("add_task_modal").close();
    callTasksHandler();
  };

  const callTasksHandler = async () => {
    let _tasks = [];
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach((doc) => {
      _tasks.push({
        id: doc.id,
        ...doc.data(),
        createdAtDate: doc.data().createdAt.toDate(),
      });
      setTasks(_tasks);
    });
  };

  useEffect(() => {
    callTasksHandler();
  }, []);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      mergeTasksToDates();
    }
  }, [tasks, selectedMonth]);

  const getStatusColors = (status) => {
    switch (status) {
      case "in-progress":
        return "bg-[#EA80FC]";
      case "pending":
        return "bg-[#FED653]";
      case "done":
        return "bg-[#4BD963]";
    }
  };

  return (
    <>
      <dialog id="add_task_modal" className="modal">
        <div className="modal-box">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">
              {selectedTask ? selectedTask.title : "Add new task!"}
            </h3>
            {editMode && (
              <button
                className="btn btn-error btn-outline"
                onClick={deleteTaskHandler}
              >
                Delete
                <GoTrash />
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Drink water..."
            className="input input-bordered input-primary w-full max-w-xs mt-4"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          {editMode && (
            <select
              className="select select-primary w-full max-w-xs mt-4"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
            >
              <option disabled selected>
                Task Status
              </option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          )}

          <div className="modal-action">
            <button className="btn btn-primary" onClick={addOrEditTaskHandler}>
              {editMode ? "Edit" : "Add"}
            </button>
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="flex justify-center items-center gap-4">
        <span
          className="text-blue-500 cursor-pointer"
          onClick={goToPreviousMonth}
        >
          <GoArrowLeft />
        </span>
        <span>
          {format(
            new Date(`${selectedYear}, ${selectedMonth}, ${currentDay}`),
            "MMMM yyyy"
          )}
        </span>
        <span className="text-blue-500 cursor-pointer" onClick={goToNextMonth}>
          <GoArrowRight />
        </span>
      </div>
      <div className="flex gap-2 flex-wrap mt-4 justify-center">
        {tasksAndDates &&
          tasksAndDates.length > 0 &&
          tasksAndDates.map(({ day, tasks }, index) => {
            return (
              <div
                key={index}
                className={`w-[400px] min-h-[200px] border font-bold cursor-pointer p-2 ${
                  isSameDay(day, today)
                    ? "border-blue-900 bg-green-500 text-black"
                    : "border-white text-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskTitle("");
                  setTaskDate(day);
                  setEditMode(false);
                  setSelectedTask(null);
                  document.getElementById("add_task_modal").showModal();
                }}
              >
                {format(new Date(day), "dd")}
                {tasks &&
                  tasks.length > 0 &&
                  tasks.map((task) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditMode(true);
                        setTaskDate(day);
                        setTaskTitle(task.title);
                        setSelectedTask(task);
                        setTaskStatus(task.status);
                        document.getElementById("add_task_modal").showModal();
                      }}
                      key={task.id}
                      className={`p-2 my-2 rounded-full shadow-sm shadow-purple-400 ${getStatusColors(
                        task.status
                      )}`}
                    >
                      {task.title}
                    </div>
                  ))}
                <div className="text-right">
                  <button
                    className="btn btn-primary m-auto"
                    onClick={() => {
                      setEditMode(false);
                      setTaskTitle("");
                      setTaskDate(day);
                      setSelectedTask(null);
                      document.getElementById("add_task_modal").showModal();
                    }}
                  >
                    Add task
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}

export default App;
