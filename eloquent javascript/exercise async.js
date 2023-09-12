import * as Async from "./modules/async.js";

// Async.findInStorage(Async.bigOak, "food caches").then(console.log);

// Async.bigOak.send("Butcher Shop","note","...",console.log)
// Async.request(Async.bigOak, "Butcher Shop", "note", "...") 
// Async.request(Async.bigOak, "Butcher Shop", "gossip", "...") 

// console.log(Async.bigOak.state.connections.get("Big Oak"))
// console.log(Async.bigOak.neighbors.includes("Butcher Shop"))

// delay to propagate network information
// setTimeout(() => {
//   Async.routeRequest(Async.bigOak, "Chateau", "note", "Incoming jackdaws!");
// }, 500);

// setTimeout(() => {
//   let via = Async.findRoute(Async.bigOak.name, "Chateau", Async.bigOak.state.connections)
//   // let via = Async.findRoute(Async.bigOak.name, "Butcher Shop", Async.bigOak.state.connections)
//   console.log(via)
// }, 500);

async function locateScalpel(nest) {
  let scalpel = await Async.storage(nest, "scalpel");
  let name = nest.name;
  while (name != scalpel) {
    name = scalpel;
    scalpel = await Async.anyStorage(nest, scalpel, "scalpel");
  }
  return scalpel;
}

function locateScalpel2(nest) {
  f(nest, nest.name).then(console.log)
}

function f(nest, scalpel) {
  let name = scalpel
  return Async.anyStorage(nest, name, "scalpel").then((scalpel) => {
    if (name != scalpel) return f(nest, scalpel);
    return name;
  })
}

// locateScalpel(Async.bigOak).then(console.log); //Butcher Shop
// locateScalpel2(Async.bigOak)

//////////////////////////////////////////////////////////////
// given solution
async function locateScalpel3(nest) {
  let current = nest.name;
  for (; ;) {
    let next = await anyStorage(nest, current, "scalpel");
    if (next == current) return current;
    current = next;
  }
}

function locateScalpel4(nest) {
  function loop(current) {
    return anyStorage(nest, current, "scalpel").then(next => {
      if (next == current) return current;
      else return loop(next);
    });
  }
  return loop(nest.name);
}


/////////////////////////////////////////////////////////////////////
// given solution
function Promise_all(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length == 0) resolve([]);
    else {
      let output = [], count = promises.length;
      let pending = promises.length;
      for (let i = 0; i < count; i++) {
        promises[i].then(result => {
          output[i]=result;
          pending--;
          if (pending == 0) resolve(output);
        }).catch(reject);
      }
    }
  })
}



// Test code
Promise_all([]).then(array => {
  console.log("This should be []:", array);
});
function soon(val) {
  return new Promise(resolve => {
    setTimeout(() => resolve(val), Math.random() * 500);
  });
}
Promise_all([soon(1), soon(2), soon(3)]).then(array => {
  console.log("This should be [1, 2, 3]:", array);
});
Promise_all([soon(1), Promise.reject("X"), soon(3)])
  .then(array => {
    console.log("We should not get here");
  })
  .catch(error => {
    if (error != "X") {
      console.log("Unexpected failure:", error);
    }
  });