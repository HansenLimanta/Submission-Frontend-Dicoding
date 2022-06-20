const submitForm = document.querySelector(".form");
const notFinBtn = document.querySelector(".submit-not-finished");
const finBtn = document.querySelector(".submit-finished");
const notFinishedList = document.querySelector(".not-finished-container");
const finishedList = document.querySelector(".finished-container");
const searchList = document.querySelector(".search-container");
const editTab = document.querySelector(".edit-tab");
const editForm = document.querySelector(".edit-form");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const title = document.getElementById("title");
const author = document.getElementById("author");
const year = document.getElementById("year");
const newTitle = document.getElementById("new-title");
const newAuthor = document.getElementById("new-author");
const newYear = document.getElementById("new-year");
const insertWrapper = document.querySelector(".wrapper");
const searchWrapper = document.querySelector(".search-wrapper");
const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "RENDER_BOOKS";
const books = [];
let searchedBooks = [];
let editBookTarget;

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

submitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const isComplete = event.submitter;
  const validation = isValidYear(year);

  if (isComplete === notFinBtn && validation) {
    addBook(false);
  } else if (isComplete === finBtn && validation) {
    addBook(true);
  }
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const searchValue = searchInput.value;
  const titleSearch = document.querySelector(".title-search");

  if (searchValue === "") {
    return;
  } else {
    insertWrapper.style.display = "none";
    searchWrapper.style.display = "block";
    searchList.innerHTML = "";
    titleSearch.innerText = `Search result for ${searchValue}:`;

    searchedBooks = filterByValue(books, searchValue);

    const backButton = document.querySelector(".back-button");
    backButton.addEventListener("click", () => {
      insertWrapper.style.display = "flex";
      searchWrapper.style.display = "none";
      searchInput.value = "";
    });

    updateSearchList();
  }
});

const updateSearchList = () => {
  const searchValue = searchInput.value;
  searchedBooks = filterByValue(books, searchValue);
  searchList.innerHTML = "";

  for (const book of searchedBooks) {
    const bookElement = makeBook(book);
    const textIsComplete = document.createElement("h3");

    if (!book.isComplete) {
      textIsComplete.innerText = "Not Finished";
      bookElement.append(textIsComplete);
      searchList.append(bookElement);
    } else {
      textIsComplete.innerText = "Finished";
      bookElement.append(textIsComplete);
      searchList.append(bookElement);
    }
  }
};

const filterByValue = (array, string) => {
  return array.filter((book) =>
    book.title.toLowerCase().includes(string.toLowerCase())
  );
};

document.addEventListener(RENDER_EVENT, () => {
  finishedList.innerHTML = "";
  notFinishedList.innerHTML = "";
  title.value = "";
  author.value = "";
  year.value = "";

  for (const book of books) {
    const bookElement = makeBook(book);
    if (!book.isComplete) notFinishedList.append(bookElement);
    else finishedList.append(bookElement);
  }
});

const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
};

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Yout browser do not support local storage.");
    return false;
  }
  return true;
};

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};

const isValidYear = (year) => {
  const yearNumber = parseInt(year.value);
  if (isNaN(yearNumber)) {
    alert("Year must be a number between 1000 to 2022");
    return false;
  } else if (1000 > yearNumber || yearNumber > 2022) {
    alert("Year must be a number between 1000 to 2022");
    return false;
  } else {
    return true;
  }
};

const addBook = (paramIsComp) => {
  const titleValue = title.value;
  const authorValue = author.value;
  const yearValue = year.value;
  const isComplete = paramIsComp;
  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    titleValue,
    authorValue,
    yearValue,
    isComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const generateId = () => {
  return +new Date();
};

const generateBookObject = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

const makeBook = (bookObject) => {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.append(textTitle, textAuthor, textYear);

  const switchBtn = document.createElement("button");
  switchBtn.classList.add("switch-button");
  switchBtn.innerText = "Switch";
  switchBtn.addEventListener("click", () => {
    switchBookshelf(bookObject);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-button");
  deleteBtn.innerText = "Delete";
  deleteBtn.addEventListener("click", () => {
    removeBook(bookObject.id);
  });

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-button");
  editBtn.innerText = "Edit";
  editBtn.addEventListener("click", () => {
    editBook(bookObject);
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  buttonContainer.append(deleteBtn, editBtn, switchBtn);

  const container = document.createElement("div");
  container.classList.add("book-container", "flex-column");
  container.append(textContainer, buttonContainer);

  return container;
};

const switchBookshelf = (bookObject) => {
  const bookTarget = findBook(bookObject.id);

  if (bookTarget == null) return;

  if (bookObject.isComplete === true) {
    bookTarget.isComplete = false;
  } else {
    bookTarget.isComplete = true;
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  updateSearchList();
  saveData();
};

const removeBook = (bookId) => {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  updateSearchList();
  saveData();
};

const editBook = (bookObject) => {
  editBookTarget = findBook(bookObject.id);
  newTitle.value = editBookTarget.title;
  newAuthor.value = editBookTarget.author;
  newYear.value = editBookTarget.year;
  editTab.style.display = "block";
};

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  validation = isValidYear(newYear);
  if (validation) {
    editBookTarget.title = newTitle.value;
    editBookTarget.author = newAuthor.value;
    editBookTarget.year = newYear.value;
    editTab.style.display = "none";

    document.dispatchEvent(new Event(RENDER_EVENT));
    updateSearchList();
    saveData();
  }
});

const findBookIndex = (bookId) => {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
};

const findBook = (bookId) => {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
};
