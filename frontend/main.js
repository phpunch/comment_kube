const updateCommentList = commentList => {
  const boxes = document.querySelector(".boxes");
  boxes.innerHTML = "";
  commentList.forEach(comment => {
    const box = document.createElement("div");
    box.className = "box";
    box.setAttribute("id", comment._id);
    box.innerHTML = `<div class="name">${comment.name}</div><div class="close-btn">X</div><div class="msg"><p>${comment.msg}</p></div>`;
    boxes.appendChild(box);
    addBoxListener();
  });
};

fetch("http://localhost:5000/api/get")
  .then(response => {
    if (response.ok) {
      return response.json();
    }
  })
  .then(commentList => {
    updateCommentList(commentList);
  })
  .catch(err => console.error(err));

const submitBtn = document.querySelector(".submit-btn");
submitBtn.addEventListener("click", () => {
  const msgTextArea = document.querySelector("textarea[name=msg]");
  const nameInput = document.querySelector("input[name=name]");
  const msg = msgTextArea.value;
  const name = nameInput.value;
  msgTextArea.value = "";
  nameInput.value = "";

  const comment = {
    name: name,
    msg: msg
  };

  const options = {
    method: "POST",
    body: JSON.stringify(comment),
    headers: {
      "Content-Type": "application/json"
    }
  };

  fetch("http://localhost:5000/api/post", options)
    .then(res => res.json())
    .then(commentList => updateCommentList(commentList));
});

const addBoxListener = () => {
  const boxes = document.querySelectorAll(".box");

  boxes.forEach(box => {
    const closeBtn = box.querySelector(".close-btn");

    closeBtn.addEventListener("click", () => {
      const options = {
        method: "DELETE"
      };

      fetch(
        `http://localhost:5000/api/delete/${box.getAttribute("id")}`,
        options
      )
        .then(res => res.json())
        .then(commentList => updateCommentList(commentList));
    });
  });
};
