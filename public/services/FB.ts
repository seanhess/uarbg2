import app = module('../app')

declare var Firebase;

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
  (gameId:string):IRef;
  apply(cb:IValueCB):IRefCB;
  update(ref:IRef, obj:any);
}


// Functional Style Class: it's the same as the module that you were looking for!
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

app.main.factory('FB', function($rootScope) {
  return new FB($rootScope)
})
