// a vector type
class Vec{
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
    plus(v){
        return new Vec(this.x+v.x, this.y+v.y)
    }
    minus(v){
        return new Vec(this.x-v.x, this.y-v.y)
    }
    get length(){
        return Math.sqrt(this.x ** 2+this.y ** 2)
    }
}

let v1= new Vec(0,1)
let v2= new Vec(3,4)
console.log(v1.plus(v2))
console.log(v1.minus(v2))
console.log(v2.length)

// groups
class Group extends Array{
    constructor(){
       super();
    }
    add(v){
        if (this.includes(v) === false){
            this.push(v);
        }
    }
    delete(v){
        if (this.includes(v)){
            this.splice(this.indexOf(v),1);
        }
    }
    has(v){
        if (this.includes(v)){
            return true;
        }else{return false;}
    }
    static from(o){
        const res=new Group();
        o.forEach(element => {
            res.add(element)
        });
        return res;
    }
}

let g=new Group()
let s=new Set([...Array(5).keys(),4,2])
console.log(g)
console.log(s)
g=Group.from([...Array(5).keys(),4,2])
console.log(g)
g.add(4)
console.log(g)
console.log(g.values() === s.values())
g.delete(6)
g.delete(4)
console.log(g)
console.log(g.has(0))


class GroupIterator{
    constructor(group){
        this.index=0;
        this.group=group;
    }
    next(){
        if (this.index >= this.group.length){
            return {done:true}
        } 
        let value=this.group.at(this.index).toString()+"...";
        this.index++;
        return { value, done:false };   
    }
}

Group.prototype[Symbol.iterator]=function(){
    return new GroupIterator(this);
}

for(let v of g){console.log(v);}

// borrowing a method
let map1={"hasOwnProperty":"blahblahblah", "name":"abc", "age":80};
console.log(Map.prototype.hasOwnProperty.call(map1, "hasOwnProperty"))

// chapter 5
// Persistent group
class PGroup{
    static empty= new PGroup([]);
    constructor(member){
        this.member=member;
    }

    add(v){
        if(this.has(v)){return new PGroup(this.member)}
        return new PGroup(this.member.concat([v]))
    }

    delete(v){
        if(this.has(v)){return new PGroup(this.member.filter(e=> e!==v));}
        return new PGroup(this.member);
    }

    has(v){
        return this.member.includes(v);
    }
}


let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.log(b.has("b")); //true
console.log(a.has("b")); //false
console.log(b.has("a")); //false
