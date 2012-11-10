var Henry;
(function (Henry) {
    Henry.woot = "hello";
})(Henry || (Henry = {}));

console.log("INSIDE!");
var Blah;
(function (Blah) {
    Blah.woot = "henry";
})(Blah || (Blah = {}));







