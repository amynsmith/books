import * as Robot from "./modules/robot.js";

var state = Robot.VillageState.random(3)
// Robot.runRobot(state, Robot.randomRobot)
// Robot.runRobot(state, Robot.routeRobot, [])
Robot.runRobot(state, Robot.goalOrientedRobot, [])

function countRobot(state, robot, memory){
    for (let turn = 0;; turn++) {
        if (state.parcels.length == 0) {
          return turn;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
      }
}

function compareRobots(robot1, memory1, robot2, memory2){
    let count1=0,count2=0;
    for (let i=0;i<100;i++){
        var state = Robot.VillageState.random()
        count1+=countRobot(state, robot1, memory1)
        count2+=countRobot(state, robot2, memory2)
    }
    console.log(`robot1 average count: ${count1 / 100}`);
    console.log(`robot2 average count: ${count2 / 100}`);
}

compareRobots(Robot.routeRobot, [], Robot.goalOrientedRobot, []);