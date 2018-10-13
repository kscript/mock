var store = {
  token: "token",
  appKey: "appKey"
}
function LocalStorage(){
}
LocalStorage.prototype = {
  constructor: LocalStorage,
  getItem: function (key){
    return store[key] || null;
  }
}
module.exports = new LocalStorage();