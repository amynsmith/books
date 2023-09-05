import * as Robot from "./modules/robot.js";

var state = Robot.VillageState.random(3)
// Robot.runRobot(state, Robot.randomRobot)
// Robot.runRobot(state, Robot.routeRobot, [])
Robot.runRobot(state, Robot.goalOrientedRobot, [])

function countRobot(state, robot, memory) {
  for (let count = 0; ; count++) {
    if (state.parcels.length == 0) {
      return count;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
  }
}

function compareRobots(robot1, memory1, robot2, memory2) {
  let count1 = 0, count2 = 0;
  for (let i = 0; i < 100; i++) {
    var state = Robot.VillageState.random()
    count1 += countRobot(state, robot1, memory1);
    count2 += countRobot(state, robot2, memory2);
  }
  console.log(`robot1 average count: ${count1 / 100}`);
  console.log(`robot2 average count: ${count2 / 100}`)
}

// compareRobots(Robot.routeRobot, [], Robot.goalOrientedRobot, []);
// compareRobots(Robot.goalOrientedRobot, [], optimizedRobot, []);

function optimizedRobot({ place, parcels }, route) {
  let finalroute = [];
  for (let i = 0; i < parcels.length; i++) {
    let parcel = parcels[i];
    if (parcel.place != place) {
      route = Robot.findRoute(Robot.roadGraph, place, parcel.place);
    } else {
      route = Robot.findRoute(Robot.roadGraph, place, parcel.address);
    }
    if (i == 0 || route.length < finalroute.length) { finalroute = route; }
  }
  return { direction: route[0], memory: route.slice(1) };
}

// Robot.runRobot(state, optimizedRobot, [])

// given solution
function lazyRobot({ place, parcels }, route) {
  if (route.length == 0) {
    // Describe a route for every parcel
    let routes = parcels.map(parcel => {
      if (parcel.place != place) {
        return {
          route: Robot.findRoute(Robot.roadGraph, place, parcel.place),
          pickUp: true
        };
      } else {
        return {
          route: Robot.findRoute(Robot.roadGraph, place, parcel.address),
          pickUp: false
        };
      }
    });

    // This determines the precedence a route gets when choosing.
    // Route length counts negatively, routes that pick up a package
    // get a small bonus.
    function score({ route, pickUp }) {
      return (pickUp ? 0.5 : 0) - route.length;
    }
    route = routes.reduce((a, b) => score(a) > score(b) ? a : b).route;
  }

  return { direction: route[0], memory: route.slice(1) };
}

compareRobots(optimizedRobot, [], lazyRobot, []);