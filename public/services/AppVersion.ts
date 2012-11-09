import app = module("../app")

export interface IAppVersion {
  num: string;
}

app.main.factory('AppVersion', function($rootScope) {
  return {num: "1.1"}
})
