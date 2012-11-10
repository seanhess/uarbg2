///<reference path="../def/angular.d.ts"/>

function PaymentCtrl($scope, $routeParams, $location) {
  if ($routeParams.unpaid) {
    console.log("set unpaid")
    localStorage.setItem("payment_status","unpaid");
  } else {
    console.log("set paid")
    localStorage.setItem("payment_status","paid");
  }
  return $location.path("/identify");

}
