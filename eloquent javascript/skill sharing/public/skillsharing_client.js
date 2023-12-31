function handleAction(state, action) {
  if (action.type == "setUser") {
    localStorage.setItem("userName", action.user);
    return Object.assign({}, state, { user: action.user });
  } else if (action.type == "setTalks") {
    return Object.assign({}, state, { talks: action.talks });
  } else if (action.type == "newTalk") {
    fetchOK(talkURL(action.title), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        presenter: state.user,
        summary: action.summary
      })
    }).catch(reportError);
  } else if (action.type == "deleteTalk") {
    fetchOK(talkURL(action.talk), { method: "DELETE" })
      .catch(reportError);
  } else if (action.type == "newComment") {
    fetchOK(talkURL(action.talk) + "/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: state.user,
        message: action.message
      })
    }).catch(reportError);
  }
  return state;
}

function fetchOK(url, options) {
  return fetch(url, options).then(response => {
    if (response.status < 400) return response;
    else throw new Error(response.statusText);
  });
}

function talkURL(title) {
  return "talks/" + encodeURIComponent(title);
}

function reportError(error) {
  alert(String(error));
}

function renderUserField(name, dispatch) {
  return elt("label", {}, "Your name: ", elt("input", {
    type: "text",
    value: name,
    onchange(event) {
      dispatch({ type: "setUser", user: event.target.value });
    }
  }));
}

function elt(type, props, ...children) {
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

// function renderTalk(talk, dispatch) {
//   return elt(
//     "section", {className: "talk"},
//     elt("h2", null, talk.title, " ", elt("button", {
//       type: "button",
//       onclick() {
//         dispatch({type: "deleteTalk", talk: talk.title});
//       }
//     }, "Delete")),
//     elt("div", null, "by ",
//         elt("strong", null, talk.presenter)),
//     elt("p", null, talk.summary),
//     ...talk.comments.map(renderComment),
//     elt("form", {
//       onsubmit(event) {
//         event.preventDefault();
//         let form = event.target;
//         dispatch({type: "newComment",
//                   talk: talk.title,
//                   message: form.elements.comment.value});
//         form.reset();
//       }
//     }, elt("input", {type: "text", name: "comment"}), " ",
//        elt("button", {type: "submit"}, "Add comment")));
// }

var renderTalk = class renderTalk {
  constructor(talk, dispatch) {
    this.talk = talk;
    this.commentDom = talk.comments.map(renderComment);
    if (this.commentDom.length == 0) this.commentDom = "";
    this.dom = elt(
      "section", { className: "talk", title: talk.title },
      elt("h2", null, talk.title, " ", elt("button", {
        type: "button",
        onclick() {
          dispatch({ type: "deleteTalk", talk: talk.title });
        }
      }, "Delete")),
      elt("div", null, "by ",
        elt("strong", null, talk.presenter)),
      elt("p", null, talk.summary),
      ...this.commentDom,
      elt("form", {
        onsubmit(event) {
          event.preventDefault();
          let form = event.target;
          dispatch({
            type: "newComment",
            talk: talk.title,
            message: form.elements.comment.value
          });
          form.reset();
        }
      }, elt("input", { type: "text", name: "comment" }), " ",
        elt("button", { type: "submit" }, "Add comment")));
  }
  syncState(state) {
    let updatedtalk = state.talks.filter(t => t.title == this.talk.title);
    if (updatedtalk.length == 0) return this.dom = "";
    let newcomments = updatedtalk[0].comments;
    if (newcomments.length == this.talk.comments.length) return this.dom;
    let addedcomments = newcomments.slice(this.talk.comments.length,);
    let form = this.dom.querySelector("form");
    for (let comment of addedcomments) {
      this.dom.insertBefore(comment.map(renderComment), form);
    }
    return this.dom;
  }
}


function renderComment(comment) {
  return elt("p", { className: "comment" },
    elt("strong", null, comment.author),
    ": ", comment.message);
}

function renderTalkForm(dispatch) {
  let title = elt("input", { type: "text" });
  let summary = elt("input", { type: "text" });
  return elt("form", {
    onsubmit(event) {
      event.preventDefault();
      dispatch({
        type: "newTalk",
        title: title.value,
        summary: summary.value
      });
      event.target.reset();
    }
  }, elt("h3", null, "Submit a Talk"),
    elt("label", null, "Title: ", title),
    elt("label", null, "Summary: ", summary),
    elt("button", { type: "submit" }, "Submit"));
}

async function pollTalks(update) {
  let tag = undefined;
  for (; ;) {
    let response;
    try {
      response = await fetchOK("/talks", {
        headers: tag && {
          "If-None-Match": tag,
          "Prefer": "wait=90"
        }
      });
    } catch (e) {
      console.log("Request failed: " + e);
      await new Promise(resolve => setTimeout(resolve, 500));
      continue;
    }
    if (response.status == 304) continue;
    tag = response.headers.get("ETag");
    update(await response.json());
  }
}

var SkillShareApp = class SkillShareApp {
  constructor(state, dispatch) {
    this.dispatch = dispatch;
    this.talkDOM = elt("div", { className: "talks" });
    this.dom = elt("div", null,
      renderUserField(state.user, dispatch),
      this.talkDOM,
      renderTalkForm(dispatch));
    this.syncState(state);
  }

  syncState(state) {
    if (state.talks != this.talks) {
      // this.talkDOM.textContent = "";
      for (let talk of state.talks) {
        if(!this.talks || this.talks.filter(t=>t.title == talk.title).length == 0){
          console.log(`new talk ${talk.title}`);
          let talkcomponent = new renderTalk(talk, this.dispatch);
          this.talkDOM.appendChild(
            // renderTalk(talk, this.dispatch));
            talkcomponent.syncState(state)
          )
        }else{
          console.log(`existed talk ${talk.title}`);
          let originalTalkElement = this.talkDOM.querySelector(`section[title='${talk.title}']`);
          let originalcomments = this.talks.filter(t=>t.title == talk.title)[0].comments;

          if(talk.comments && talk.comments.length>originalcomments.length){
            let addedcomments = talk.comments.slice(originalcomments.length,);
            console.log(addedcomments)
            let form = originalTalkElement.querySelector("form");
            for (let comment of addedcomments) {
              originalTalkElement.insertBefore(renderComment(comment), form);
            }
          }
        }

      }
      if(this.talks){
        for(let talk of this.talks){
          if(state.talks.filter(t=>t.title == talk.title).length==0){
            console.log(`deleted talk ${talk.title}`);
            let originaltalk = this.talkDOM.querySelector(`section[title='${talk.title}']`);
            this.talkDOM.removeChild(originaltalk);
          }
        }
      }

      this.talks = state.talks;
    }
  }
}

function runApp() {
  let user = localStorage.getItem("userName") || "Anon";
  let state, app;
  function dispatch(action) {
    state = handleAction(state, action);
    app.syncState(state);
  }

  pollTalks(talks => {
    if (!app) {
      state = { user, talks };
      app = new SkillShareApp(state, dispatch);
      document.body.appendChild(app.dom);
    } else {
      dispatch({ type: "setTalks", talks });
    }
  }).catch(reportError);
}

runApp();


// given solution
// class Talk {
//   constructor(talk, dispatch) {
//     this.comments = elt("div");
//     this.dom = elt(
//       "section", {className: "talk"},
//       elt("h2", null, talk.title, " ", elt("button", {
//         type: "button",
//         onclick: () => dispatch({type: "deleteTalk",
//                                  talk: talk.title})
//       }, "Delete")),
//       elt("div", null, "by ",
//           elt("strong", null, talk.presenter)),
//       elt("p", null, talk.summary),
//       this.comments,
//       elt("form", {
//         onsubmit(event) {
//           event.preventDefault();
//           let form = event.target;
//           dispatch({type: "newComment",
//                     talk: talk.title,
//                     message: form.elements.comment.value});
//           form.reset();
//         }
//       }, elt("input", {type: "text", name: "comment"}), " ",
//           elt("button", {type: "submit"}, "Add comment")));
//     this.syncState(talk);
//   }

//   syncState(talk) {
//     this.talk = talk;
//     this.comments.textContent = "";
//     for (let comment of talk.comments) {
//       this.comments.appendChild(renderComment(comment));
//     }
//   }
// }

// class SkillShareApp {
//   constructor(state, dispatch) {
//     this.dispatch = dispatch;
//     this.talkDOM = elt("div", {className: "talks"});
//     this.talkMap = Object.create(null);
//     this.dom = elt("div", null,
//                    renderUserField(state.user, dispatch),
//                    this.talkDOM,
//                    renderTalkForm(dispatch));
//     this.syncState(state);
//   }

//   syncState(state) {
//     if (state.talks == this.talks) return;
//     this.talks = state.talks;

//     for (let talk of state.talks) {
//       let cmp = this.talkMap[talk.title];
//       if (cmp && cmp.talk.presenter == talk.presenter &&
//           cmp.talk.summary == talk.summary) {
//         cmp.syncState(talk);
//       } else {
//         if (cmp) cmp.dom.remove();
//         cmp = new Talk(talk, this.dispatch);
//         this.talkMap[talk.title] = cmp;
//         this.talkDOM.appendChild(cmp.dom);
//       }
//     }
//     for (let title of Object.keys(this.talkMap)) {
//       if (!state.talks.some(talk => talk.title == title)) {
//         this.talkMap[title].dom.remove();
//         delete this.talkMap[title];
//       }
//     }
//   }
// }
