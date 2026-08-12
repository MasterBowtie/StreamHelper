import { MyGraphics, MyElements } from "./objects.js";

MyGraphics.matrix = (function() {

    
    function add(a, b) {
        if (a.length != b.length) {
            return undefined;
        }  else if (a[0].length != b[0].length) {
            return undefined;
        }
        c = [a.length][a[0].length];
        for (i = 0; i < a.length; i++) {
            for (j = 0; j < a[0].length; j++) {
                c[i][j] = a[i][j] + b[i][j];
            }
        }
        return c;
    }

    function multiply(num, a) {
        if (!Array.isArray(a) && !Array.isArray(a[0]) && typeof(num) == "number") {
            return undefined;
        }
        let c = new Array(a.length);
        
        for (let i = 0; i < a.length; i++) {
            c[i] = new Array(a[0].length);
            for (let j = 0; j < a[0].length; j++) {
                c[i][j] = num * a[i][j];
            }
        }
        return c;
    }
    
    function dotProduct(a, b) {
        if (!Array.isArray(a) && !Array.isArray(a[0]) && !Array.isArray(b) && !Array.isArray(b[0])) {
            return undefined;
        }
        //console.log(`a:${a.length}, a[0]:${a[0].length}`);
        //console.log(`b:${b.length}, b[0]:${b[0].length}`);
        if (a[0].length != b.length) {
            return undefined;
        }
        
        let c = new Array(a.length);
        for (let i = 0; i < a.length; i++) {
            c[i] = new Array(b[0].length);
        }
        // console.log(`c:${c[0].length}x${c.length}`);
        
        for (let i = 0; i < c.length; i++) {
            // console.log(`i:${i}`);
            // c row
            for (let j = 0; j < c[0].length; j++) {
                // console.log(`  j:${j}`);
                // c column
                c[i][j] = 0;
                for (let k = 0; k < a[0].length; k++) {
                    // console.log(`    k:${k}`);
                    // console.log(a[i][k] + "*" +  b[k][j] + "=" + a[i][k] * b[k][j]);
                    c[i][j] += a[i][k] * b[k][j];
                }
                // Use Whole Numbers;
                // c[i][j] = Math.round(c[i][j])
            }
        }
        
        return c;
    }

    function transpose(a) {
        if (!Array.isArray(a) && !Array.isArray(a[0])) {
            return undefined;
        }
        console.log(`a:${a[0].length}x${a.length}`);
        let c = new Array(a[0].length);
        for (let i = 0; i < c.length; i++) {
            c[i] = new Array(a.length);
        }
        console.log(`c:${c[0].length}x${c.length}`);
        
        for (let i = 0; i < c.length; i++) {
            //console.log(`i:${i}`);
            // c column
            for (let j = 0; j < c[0].length; j++) {
                c[i][j] = a[j][i]
            }
        }
        return c;
    }


    function reduceEchelon(a) {
        if (!Array.isArray(a) && !Array.isArray(a[0])) {
            return undefined;
        }
        let r = new Array(a[0].length);
        
        let min = a[0].length;
        if (a.length < a[0].length) {
            min = a.length;
            //TODO: reduce row by row;
        }
        
        for (let i = 0; i < min; i++) {
            console.log(`${i}: ${a[i][i]}`);
        }
        return r;
    }  
                
    let api = {
        add: add,
        dotProduct: dotProduct,
        multiply: multiply,
    }

    return api;
}())


// Notes for Graphics Transformations

    // Rotatate "In Place"
        // Translate    
        // Rotate
        // Translate Back

    // Inverse
        // Translate Back
        // Rotate
        // Translate



// Run using node to test


// let x = 50
// let y = 50
// let w = 100
// let h = 100
// let rotation = 4 * Math.PI/180;

// let translate2 = [[1, 0, x+w/2], 
//             [0, 1, y+h/2], 
//             [0, 0, 1]]
// let rotate = [[Math.cos(rotation), -Math.sin(rotation), 0],
//             [Math.sin(rotation), Math.cos(rotation), 0],
//             [0, 0, 1]]
// let translate = [[1, 0, -x-w/2], 
//             [0, 1, -y-h/2], 
//             [0, 0, 1]]


// let a = [[55], [49], [1]];
// let b = [[x], [y], [1]];

// console.log("original: " + b);

// let b_t = MyGraphics.matrix.dotProduct(translate, b);
// b_t = MyGraphics.matrix.dotProduct(rotate, b_t);
// b_t = MyGraphics.matrix.dotProduct(translate2, b_t);

// console.log("Tranformed: " + b_t)
// rotate = [[Math.cos(-rotation), -Math.sin(-rotation), 0],
//             [Math.sin(-rotation), Math.cos(-rotation), 0],
//             [0, 0, 1]];

// a_t = MyGraphics.matrix.dotProduct(translate, a);
// a_t = MyGraphics.matrix.dotProduct(rotate, a_t);
// a_t = MyGraphics.matrix.dotProduct(translate2, a_t);

// console.log("Returned: " + a_t);