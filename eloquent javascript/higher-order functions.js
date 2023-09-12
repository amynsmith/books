// flattening
let arrays = [[1, 2, 3], [4, 5], [6]];
console.log(arrays.flat())
let res = arrays.reduce((x,y)=> x.concat(y), [])
console.log(res)

// your own loop
function loop(x, func1, func2, func3){
    while(func1(x)){
        func3(x);
        x=func2(x);
    }
}

loop(3, n => n > 0, n => n - 1, console.log);

// everything
function every(array, test){
    return (array.filter(test)).length === array.length;
}

console.log(every([1, 3, 5], n => n < 10));
console.log(every([2, 4, 16], n => n < 10));
console.log(every([], n => n < 10));

// dominant writing direction
import {SCRIPTS} from './modules/scripts.js';

function charDirection(code){
    for (let script of SCRIPTS){
        let inrange = script.ranges.some(([from,to])=>{return code>=from && code < to;})
        if(inrange){return script.direction;}
    }
    return null;
}

function dominantDirection(text){  
    let direcdict={};
    for (let t of text){
        let direc = charDirection(t.codePointAt(0));
        if(!direcdict[direc]){direcdict[direc]=0;}
        direcdict[direc]++;
    }
    let ind=Object.values(direcdict).indexOf(Math.max(...Object.values(direcdict)));
    return Object.keys(direcdict).at(ind)
}

console.log(dominantDirection("Hello!"));
console.log(dominantDirection("Hey, مساء الخير"));