// Dom7
var $$ = Dom7;

// localStorage.setItem('lastOpened', new Date().getTime());
// localStorage.setItem('RegId', 'eAqzZwYCbrk:APA91bFvOWcMy4NdUhtJpWH3alwDvshxMOj_QMQ0updhsZN5MiThYVBj_ZUChpMQV3IVnILXmwyyGmWoA4I-BUuPTTgv2NNLsqAlOAYGvaExW_8ZbLaWtGBzwGHSFcYFYizIUhijntPY');

var la = localStorage.getItem('lastOpened');
// console.log('la: ', la)

var ca = new Date().getTime();
// console.log('ca: ', ca)

var msec = ca - la;
var mins = Math.floor(msec / 60000);

// Framework7 App main instance
var app  = new Framework7({
  root: '#app', // App root element
  id: 'io.framework7.kop-pds', // App bundle ID
  name: 'Pundi Dana Sejahtera', // App name
  theme: 'auto', // Automatic theme detection
  init: true,
  initOnDeviceReady: true,
  
  touch: {
    disableContextMenu: false,
  },
  
  // App root data
  data: function () {
    return {
      endpoint: 'http://212.24.111.23/kop-pds/',
      // endpoint: 'http://212.24.111.23/redagro/',
      db: null,
      bLogedIn: false,
      mbrid: null,
      // nohp: '',
      pin: '',
      saldo: 0,
      poin: 0,
      bonus: 0,
      currentDate: null,
      token: 'c95ac0819eb63a346af25c4258626ea5',
      push: null,
    };
  },
  // App root methods
  methods: {
    // helloWorld: function () {
      // app.dialog.alert('Hello World!');
    // },
  },
  on: {

    init: function () { // sama dengan onDeviceReady

      //*
      function copyDatabaseFile(dbName) {

        var sourceFileName = cordova.file.applicationDirectory + 'www/' + dbName;
        var targetDirName = cordova.file.dataDirectory;

        return Promise.all([
          new Promise(function (resolve, reject) {
            resolveLocalFileSystemURL(sourceFileName, resolve, reject);
          }),
          new Promise(function (resolve, reject) {
            resolveLocalFileSystemURL(targetDirName, resolve, reject);
          })
        ]).then(function (files) {
          var sourceFile = files[0];
          var targetDir = files[1];
          return new Promise(function (resolve, reject) {
            targetDir.getFile(dbName, {}, resolve, reject);
          }).then(function () {
            console.log("file already copied");
          }).catch(function () {
            console.log("file doesn't exist, copying it");
            return new Promise(function (resolve, reject) {
              sourceFile.copyTo(targetDir, dbName, resolve, reject);
            }).then(function () {
              console.log("database file copied");
            });
          });
        });
      }

      copyDatabaseFile('data.db').then(function () {
        // success! :)
        app.data.db = window.sqlitePlugin.openDatabase({name: 'data.db'});
        
        var db = app.data.db;
        
        if (db) {
  
          var now = new Date()-3;
          var date = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate();
  
          db.transaction(function(tx) {
            tx.executeSql('delete from notifikasi where read = "Y" and tgl < ?;', [date]);
          }, function(error) {
            app.dialog.alert('delete error: ' + error.message);
          });
        }
      }).catch(function (err) {
        // error! :(
        console.log(err);
      });
    
      // if (mins > 5) {

      //   // jika lebih 8 jam, setup info login terakhir kali
      //   $$('#my-login-screen [name="mbrid"]').val(localStorage.getItem('mbrid'));
      //   $$('#my-login-screen [name="nohp"]').val(localStorage.getItem('nohp'));

      // } else {

      //   var mbrid = localStorage.getItem('mbrid');
      //   var nohp  = localStorage.getItem('nohp');
      //   var pin   = localStorage.getItem('pin');
      //   var gcmid = localStorage.getItem('RegId');

      //   this.data.mbrid = mbrid;
      //   this.data.nohp = nohp;
      //   this.data.pin = pin;

      //   var formData = {};
      //   formData.mbrid = mbrid;
      //   formData.nohp  = nohp;
      //   formData.pin   = pin;
      //   formData.gcmid = gcmid;
  
      //   this.preloader.show();

      //   this.request.post( app.data.endpoint + 'api/v1/auth/login', formData, function (res) {
    
      //     app.preloader.hide();
      //     var data = JSON.parse(res);
      
      //     if (data.status) {
      //       console.log('Direct login sukses!')
      //       app.request.setup({
      //         headers: {
      //           'Token': data.token
      //         }
      //       });
      //       console.log(data.token)

      //       // set data token
      //       app.data.bLogedIn = true;
      //       app.data.mbrid = mbrid;
      //       app.data.token = data.token;
            
      //       // ambil informasi saldo member
      //       // app.request.get( app.data.endpoint + 'api/v1/member/saldo/'+mbrid, function (res) {
                
      //       //   var data = JSON.parse(res);
          
      //       //   if (data.status) {
      //       //     $$('.saldo').text(parseInt(data.saldo).toLocaleString('ID'));
      //       //     app.data.saldo = parseInt(data.saldo);
      //       //   } else {
      //       //     app.dialog.alert(data.message);
      //       //   }
      //       // });

      //     } else {
      //       // delete histori
      //       localStorage.removeItem('lastOpened');
      //       localStorage.removeItem('nohp');
      //       localStorage.removeItem('pin');
      //       navigator.app.exitApp();
      //     }
      //   });
      // }
    
      this.data.push = PushNotification.init({
        "android": {},
        "browser": {
          "pushServiceURL": "http://push.api.phonegap.com/v1/push"
        },
        "ios": {
            "sound": true,
            "vibration": true,
            "badge": true
        },
        "windows": {}
      });

      var push = this.data.push;

      push.on('registration', function(data) {

        var oldRegId = localStorage.getItem('RegId');
        if (oldRegId !== data.registrationId) {
            // Save new registration ID
            localStorage.setItem('RegId', data.registrationId);
            // Post registrationId to your app server as the value has changed
            // app.dialog.alert('Registrasi Id berhasil!');
        }
      });

      push.on('notification', function(data) {
        
        var db = app.data.db;
    
        if (db) {
          
          var now  = new Date();
          var date = now.getFullYear()+'/'+(now.getMonth()+1)+'/'+now.getDate();
          var time = now.getHours() + ":" + now.getMinutes()
          
          db.transaction(function(tx) {
            
            tx.executeSql('insert into notifikasi (tgl, jam, info) values (?, ?, ?);', [date, time, data.message]);

            tx.executeSql('select count(*) as total from notifikasi where read = "N";', [], function(ignored, res) {
              $$('.badge.notif').text(res.rows.item(0).total);
              $$('.badge.notif').css("display", "block");
            });
          }, function(error) {
            app.dialog.alert('insert error: ' + error.message);
          });
        }
      
        // show message
        app.dialog.alert(data.message, data.title);
        
        // update info saldo
        // setTimeout(function () {

        //   // http://212.24.111.23/
        //   app.request.get( app.data.endpoint + 'api/v1/member/saldo/'+ app.data.mbrid, function (res) {
          
        //     var data = JSON.parse(res);
        
        //     if (data.status) {
        //       $$('.saldo').text(parseInt(data.saldo).toLocaleString('ID'));
        //       app.data.saldo = parseInt(data.saldo);
        //       app.data.bonus = parseInt(data.bonus);
        //     } else {
        //       app.dialog.alert(data.message, 'Redagro');
        //     }
        //   });
        // }, 1000);
      }); //*/

      var nohp = localStorage.getItem('nohp');

      if (nohp) {

        // console.log('Direct login!')
        var pin   = localStorage.getItem('pin');
        var gcmid = localStorage.getItem('RegId');

        var formData = {};
        formData.identity = nohp;
        formData.password = pin;
        formData.gcmid    = gcmid;
        formData.token    = this.data.token;
  
        this.preloader.show();

        this.request.post(this.data.endpoint + 'api/v1/auth/login', formData, function (res) {
    
          app.preloader.hide();
          app.data.bLogedIn = true;

          var data = JSON.parse(res);
          // console.log(data)

          if (data.status) {
            console.log('Direct login sukses!')
            app.request.setup({
              headers: {
                'Token': data.token //Authorization
              }
            });
            console.log(data.token)

            app.data.mbrid = data.mbrid;
            // app.data.nonsb = data.nonsb;
            // app.data.saldo = parseFloat(data.saldo);
            // $$('span.saldo').text(app.methods.formatNumber(data.saldo));
            // console.log(app.methods.formatNumber(data.saldo))

          } else {
            // localStorage.setItem('nohp', '');
            app.preloader.hide();
            app.dialog.alert(data.message);
            app.loginScreen.open('#my-login-screen');
          }
        });
      } else {
        this.loginScreen.open('#my-login-screen');
      }
    },     
  },
  // App routes
  routes: routes,
  // Enable panel left visibility breakpoint
  panel: {
    leftBreakpoint: 960,
  },
});


// Init/Create main view
var mainView = app.views.create('.view-main', {
  url: '/'
});

var swiper = app.swiper.create('.swiper-container', {
    speed: 400,
    //slidesPerView: auto,
    loop: true,
    //autoHeight: true,
    shortSwipes: false,
    longSwipes: false,
    //effect:'fade'
    //spaceBetween: 100
});

// swiper.autoplay.start();

// cek selisih waktu, jika lebih tampilkan form login
// if (mins > 5) {

//   var ls = app.loginScreen.create({ el: '#my-login-screen' });
//   ls.open(false);
// }


// Login Screen
$$('#my-login-screen .login-button').on('click', function () {
  
  var mbrid = 1; //$$('#my-login-screen [name="mbrid"]').val();
  // if (mbrid === '') {
  //     app.dialog.alert('Masukkan ID member anda.', 'Login Member');
  //     return;
  // }
  
  var nohpx = $$('#my-login-screen [name="identity"]').val();
  if (nohpx === '') {
      app.dialog.alert('Masukkan nomor handphone anda.', 'Login Member');
      return;
  }

  var rgx_nohp = /[08][0-9]{9,}/;
  var nohp = nohpx.trim().match(rgx_nohp);
  if (!nohp) {
      app.dialog.alert('Input data nomor handphone belum benar.', 'Login Member');
      return;
  }

  var pin = $$('#my-login-screen [name="password"]').val();
  if (pin === '') {
      app.dialog.alert('Masukkan nomor PIN atau password anda.', 'Login Member');
      return;
  }
  
  app.preloader.show();

  var formData = app.form.convertToData('.login-form');

  var regId = localStorage.getItem('RegId');
  formData.gcmid = regId;
  formData.mbrid = mbrid;
  formData.mobile = 1;
  formData.token  = app.data.token;

  
  app.request.post(app.data.endpoint + 'api/v1/auth/login', formData, function (res) {
    
    app.preloader.hide();
    app.data.bLogedIn = true;

    var data = JSON.parse(res);
    console.log(data)

    if (data.block) {
      app.dialog.alert(data.message, 'Login Member');
      return;
    }

    if (data.status) {
      
      app.request.setup({
        headers: {
          'Token': data.token
        }
      });

      // console.log('login sukses!')
      localStorage.setItem('nohp', nohp);
      localStorage.setItem('pin', pin);

      // tutup & kosongkan isian nomor pin
      app.loginScreen.close('#my-login-screen');
      $$('#my-login-screen [name="password"]').val('');
      
      app.data.mbrid = mbrid;
      // app.data.nohp = nohp;
      app.data.pin = pin;
      // app.data.token = data.token;
      
      // app.request.get( app.data.endpoint + 'api/v1/member/saldo/'+mbrid, function (res) {
          
      //   var data = JSON.parse(res);
    
      //   if (data.status) {
      //     $$('.saldo').text(parseInt(data.saldo).toLocaleString('ID'));
      //     app.data.saldo = parseInt(data.saldo);
      //     app.data.bonus = parseInt(data.bonus);
      //   } else {
      //     app.dialog.alert(data.message, 'Akun Saya');
      //   }
      // });

    } else {
      app.dialog.alert(data.message, 'Login Member');
    }
  });
});

$$('a.label-register').on('click', function () {
  // Close login screen
  app.loginScreen.close('#my-login-screen');
  app.loginScreen.open('#my-reg-screen');
});


// Registrasi member
$$('#my-reg-screen .register-button').on('click', function () {
  
  var nama = $$('#my-reg-screen [name="nama"]').val();
  if (nama === '') {
      app.dialog.alert('Masukkan nama lengkap anda.', 'Registrasi Member');
      return;
  }
  
  var rgx_nama = /^[a-zA-Z]'?([a-zA-Z]|\,|\.| |-)+$/;
  var namax = nama.trim().match(rgx_nama);
  if (!namax) {
    app.dialog.alert('Input data nama belum benar.', 'Registrasi Member');
    return;
  }

  var nohpx = $$('#my-reg-screen [name="nohp"]').val();
  if (nohpx === '') {
      app.dialog.alert('Masukkan nomor handphone.', 'Registrasi Member');
      return;
  }

  var rgx_nohp = /[08][0-9]{9,}/;
  var nohp = nohpx.trim().match(rgx_nohp);
  if (!nohp) {
    app.dialog.alert('Input data nomor handphone belum benar.', 'Registrasi Member');
    return;
  }

  app.preloader.show();
  
  var regId = localStorage.getItem('RegId');
  var formData = app.form.convertToData('.register-form');

  // formData.mbrid = 1; cause wrong result
  formData.gcmid = regId;

  app.request.post(app.data.endpoint + 'api/v1/member', formData, function (res) {
    
    app.preloader.hide();
    
    var data = JSON.parse(res);

    if (data.status) {
      
      // console.log('Registrasi sukses!')
      // simpan data nomor handphone
      // localStorage.setItem('mbrid', data.mbrid);
      localStorage.setItem('nohp', nohp);

      // app.data.mbrid = data.mbrid;
      // app.data.nohp = data.nohp;

      // set data ke form login
      // $$('#my-login-screen [name="mbrid"]').val(data.mbrid);
      $$('#my-login-screen [name="identity"]').val(nohp);

      app.loginScreen.close('#my-reg-screen');
      app.loginScreen.open('#my-login-screen');
    
      // setTimeout(function () {
        app.dialog.alert(data.message, 'Registrasi Member');
      // }, 2000);

    } else {
      app.dialog.alert(data.message, 'Registrasi Member');
    }
  });
});

$$('a.label-login').on('click', function () {
  // Close register screen
  app.loginScreen.close('#my-reg-screen');
  app.loginScreen.open('#my-login-screen');
});

$$('#my-login-screen').on('loginscreen:opened', function (e, loginScreen) {
  // set data ke form login
  // $$('#my-login-screen [name="mbrid"]').val(localStorage.getItem('mbrid'));
  $$('#my-login-screen [name="identity"]').val(localStorage.getItem('nohp'));
});

// ganti pin
$$('#ganti-pin .btnGanti').on('click', function () {
  
  var pinlama = $$('#ganti-pin [name="pinlama"]').val();
  var pinbaru = $$('#ganti-pin [name="pinbaru"]').val();
  
  if (pinlama == '') {
      app.dialog.alert('Masukkan nomor PIN atau password yang lama.', 'Ganti PIN');
      return;
  } else
  if (pinbaru == '') {
      app.dialog.alert('Masukkan nomor PIN atau password yang baru.', 'Ganti PIN');
      return;
  }
  
  app.preloader.show();

  var formData = app.form.convertToData('.ganti-pin');
  
  app.request.post( app.data.endpoint + 'api/v1/member/gantipin', formData, function (res) {
    
    app.preloader.hide();
    
    var data = JSON.parse(res);

    if (data.status) {

      app.request.setup({
        headers: {
          'Token': data.token
        }
      });

      // app.data.pin = pinbaru;
      localStorage.setItem('pin', pinbaru);

      $$('#ganti-pin [name="pinlama"]').val('');
      $$('#ganti-pin [name="pinbaru"]').val('');
      
      app.popup.close($$('.page[data-name="ganti-pin"]').parents(".popup"));
      app.dialog.alert(data.message, 'Ganti PIN');
    } else {
      app.dialog.alert(data.message, 'Ganti PIN');
    }
  });
});

$$('#ganti-pin').on('popup:closed', function (e, popup) {
  $$('#ganti-pin [name="pinlama"]').val('');
  $$('#ganti-pin [name="pinbaru"]').val('');
});


$$(document).on('backbutton', function (e) {

  e.preventDefault();

  // for example, based on what and where view you have
  var leftp  = app.panel.left && app.panel.left.opened;
  var rightp = app.panel.right && app.panel.right.opened;
  
  if (leftp || rightp) {

      app.panel.close();
      return false;
  } else
  // if ($$('.modal-in').length > 0) {

  //     app.dialog.close();
  //     app.popup.close();
  //     return false;
  // } else
  
  if (app.views.main.router.url == '/') {
    
    if (app.data.bLogedIn) {
      // catat waktu terakhir pemakaian
      var dateEnd = new Date().getTime();
      localStorage.setItem('lastOpened', dateEnd);
    }

    navigator.app.exitApp();
  } else {
    mainView.router.back();
  }
});

$$('#my-login-screen').on('loginscreen:close', function (e, loginScreen) {

  $$('#my-login-screen [name="pin"]').val('');
});

app.on('pageInit', function (page) {

  $$('input').on('focus', function () {
    
    $$('.kb').css('height', '280px');
    //var limit = $$(window).height() - 280;

    if ($$(this).offset().top > 280) {
      $$('.page-content').scrollTop($$(this).offset().top-168);
    }
  });

  $$('input').on('blur', function () {
    $$('.kb').css('height', '0px');
  });
});
