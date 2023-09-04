import * as Robot from "./modules/robot.js";

var state = Robot.VillageState.random(3)
// Robot.runRobot(state, Robot.randomRobot)
// Robot.runRobot(state, Robot.routeRobot, [])
// Robot.runRobot(state, Robot.goalOrientedRobot, [])


function compareRobots(robot1, memory1, robot2, memory2){

}

compareRobots(Robot.routeRobot, [], Robot.goalOrientedRobot, []);