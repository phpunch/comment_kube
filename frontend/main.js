const updateCommentList = commentList => {
  const boxes = document.querySelector(".boxes");
  boxes.innerHTML = "";
  commentList.forEach(comment => {
    const box = document.createElement("div");
    box.className = "box";

    box.innerHTML = `<div class="name">${comment.name}</div><div class="msg"><p>${comment.msg}</p></div>`;
    boxes.appendChild(box);
  });

  console.log(commentList);
};

// fetch("data.json")
fetch("http://backend:5000/api/get")
  .then(response => {
    if (response.ok) {
      return response.json();
    }
  })
  .then(({ commentList }) => {
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

  fetch("http://backend:5000/api/post", options)
    .then(res => res.json())
    .then(({ commentList }) => updateCommentList(commentList));

  //   fetch("data2.json")
  //     .then(res => res.json())
  //     .then(({ commentList }) => updateCommentList(commentList));
});
