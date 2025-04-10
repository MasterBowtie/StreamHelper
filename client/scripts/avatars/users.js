
/** Users 
 * @key     string      name
 * @key     int         r
 * @key     int         g
 * @key     int         b
 * @key     int         x
 * @key     int         y
*/


MyCanvas.users = (function() {

    var users = [];
    console.log("Users Initialized...")

    //width 103
    //height 68

    function addUser(data) {
        let newUser = {name: data.user, r: 0, g: 0, b: 0}

        console.log(data.text);

        newUser.x = Math.random() * (1870-50) + 50;
        newUser.y = Math.random() * (400-200) + 200;

 
        let found = false;
        for (u in users) {
            if (u.name !== name) {
                newList.push(u)
            } else {
                found = true;
                u.r = r;
                u.g = g;
                u.b = b;
                newList.push(u);
            }
        }
        if (!found) {
            newList.push(newUser);
        }
        users = newList;
    }

    function removeUser(name) {
        let list = [];
        for (u of users) {
            if (u.name !== name) {
                list.push(u);
            }
        }
        users = list;
    }

    function getUsers() {
        return users;
    }


    api = {
        add: addUser,
        remove: removeUser,
        get: getUsers,
    }

    return api;
}())