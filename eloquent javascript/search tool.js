import { readFile, stat, readdir } from 'node:fs/promises';
import { join } from 'node:path';

let grepstr = process.argv[2];
const regex = new RegExp(grepstr);

async function listallfiles(pathlist) {
    let stats, filelist = [];
    while (pathlist.length > 0) {
        let path = pathlist[0];
        try {
            stats = await stat(path);
        } catch (error) {
            if (error.code != "ENOENT") throw error;
            else { console.log(path + " File not found"); }
        }

        if (stats.isFile()) {
            filelist.push(path);
            pathlist.shift();
        }
        else {
            let list = await readdir(path);
            pathlist.shift();
            pathlist = pathlist.concat(list.map(l => join(path, l)));
        }
    }
    return filelist;
}


let filelist = await listallfiles(process.argv.slice(3,));
for (let f of filelist){
    let text = await readFile(f, { encoding: 'utf8' });
    if(regex.test(text))console.log(f);
}


// given solution
// const {statSync, readdirSync, readFileSync} = require("fs");

// let searchTerm = new RegExp(process.argv[2]);

// for (let arg of process.argv.slice(3)) {
//   search(arg);
// }

// function search(file) {
//   let stats = statSync(file);
//   if (stats.isDirectory()) {
//     for (let f of readdirSync(file)) {
//       search(file + "/" + f);
//     }
//   } else if (searchTerm.test(readFileSync(file, "utf8"))) {
//     console.log(file);
//   }
// }