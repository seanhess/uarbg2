///<reference path="../def/angular.d.ts"/>
///<reference path="../def/underscore.d.ts"/>

// TODO switch to firebase.d.ts
declare var Firebase;

module firebase {

  export interface IRef {
    child(name:string);
    val();
    on(event:string, cb:IRefCB);
    set(val:any);
    removeOnDisconnect();
  }

  export interface IRefCB {
    (ref:IRef);
  }

  export interface IValueCB {
    (val:any);
  }

  export interface IFB {
    game(gameId:string):IRef;
    apply(cb:IValueCB):IRefCB;
    update(ref:IRef, obj:any);
  }


  // Functional Style Class: it's the same as the module that you were looking for!
  // wait, this sucks. To call other functions in the module, you have to use this
  // oh, it's not that bad

  // KEEP AROUND: as an example of the class function method
  // plus: you can define all the typing inline
  // minus: you have to use "this" for all dependencies
  // minus: can lose this pointer
  // minus: you should be using an interface type, so you have to define the interface twice anyway

  export class FB {

    constructor(
        private $rootScope:ng.IRootScopeService
    ) { }

    game(gameId:string):IRef {
      var ref = new Firebase("https://seanhess.firebaseio.com/uarbg2/" + gameId)
      return ref
    }

    apply(f:IValueCB):IRefCB {
      return (ref:IRef) => {
        if ((<any>this.$rootScope).$$phase)
          return f(ref.val())
        this.$rootScope.$apply(function() {
          f(ref.val())
        })
      }
    }

    update(ref:IRef, obj:any) {
      for (var key in obj) {
        if (obj[key] === undefined)
          delete obj[key]
      }

      ref.set(_.omit(obj, "$$hashKey"))
    }
  }
}

angular.module('services').factory('FB', function($rootScope) {
  return new firebase.FB($rootScope)
})
