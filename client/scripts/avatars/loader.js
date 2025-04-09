var js_path = 'scripts/avatars/';
var debug_all = true

function loadScripts(array, callback) {
    if (array.length !== 0) {
        debug_all && console.log(array[0])
        let script = document.createElement("script")
        
        script.onload = script.onreadystatechange = () => {
            script.onreadystatechange = script.onload = null;
            loadScripts(array, callback);
        }

        script.src = array.shift();
        let head = document.getElementsByTagName("head")[0];
        (head || document.body).appendChild(script);
    } else {
        callback && callback();
    }
}

window.onload = loadScripts([
    `${js_path}graphics.js`,
    `${js_path}driver.js`
], () => { 
    debug_all && console.log("All scripts have been loaded")
    // MyCanvas.main();
}) 