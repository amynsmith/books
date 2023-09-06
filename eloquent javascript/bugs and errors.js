// Retry
class MultiplicatorUnitFailure extends Error { };

function primitiveMultiply(x, y) {
    let r = Math.random();
    if (r <= 0.2) {
        return x * y;
    } throw new MultiplicatorUnitFailure();
}

function loopPrimitiveMultiply(x, y) {
    for (; ;) {
        try {
            return primitiveMultiply(x, y);
        } catch (e) {
            if (e instanceof MultiplicatorUnitFailure) {
                console.log("MultiplicatorUnitFailure encountered.")
            } else {
                throw e;
            }
        }
    }
}

console.log(loopPrimitiveMultiply(2, 3));

// The locked box
const box = {
    locked: true,
    unlock() { this.locked = false; },
    lock() { this.locked = true; },
    _content: [],
    get content() {
        if (this.locked) throw new Error("Locked!");
        return this._content;
    }
};

function withBoxUnlocked(body) {
    let boxlocked=box.locked
    try {
        box.unlock();
        body();
    } finally {
        if(boxlocked){box.lock();}
    }
}

withBoxUnlocked(function () {
    box.content.push("gold piece");
});

try {
    withBoxUnlocked(function () {
        throw new Error("Pirates on the horizon! Abort!");
    });
} catch (e) {
    console.log("Error raised: " + e);
}

console.log(box.locked); // true