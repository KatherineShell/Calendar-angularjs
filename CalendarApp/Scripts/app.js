
var app = angular.module('calendar', ['ngRoute', 'LocalStorageModule', 'ui.calendar']);

app.config(['$routeProvider', function( $routeProvider) {

        //$locationProvider.hashPrefix('!');
    $routeProvider.when('/calendar',
         {
             templateUrl: 'pages/calendar.html',
             controller: 'StoreController'
         }).when('/register',
         {
             templateUrl: 'pages/register.html',
             controller: 'RegisterController'
         }).otherwise('/register');
     
}]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.factory('authInterceptorService', ['$q', '$location', 'localStorageService', function ($q, $location, localStorageService) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        config.headers = config.headers || {};

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
        }

        return config;
    }

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            $location.path('/register');
        }
        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);

app.controller('TabController', function(){
this.tab = 1;

this.selectTab = function(setTab){
this.tab = setTab;
};

this.isSelected = function(checkTab){
return this.tab ===checkTab;
};
});

app.controller('StoreController', ['$scope', '$http', 'uiCalendarConfig', function ($scope, $http, uiCalendarConfig){

var isFirstTime = true;

$scope.events = [];

$scope.event = {};

$scope.eventSources = [$scope.events];

    //Load event from server
function load() {
    //clearCalendar();
        $http.get('/Home/GetEvents', {
        cache: true,
        params: {}
    }).then(function (data) {
        $scope.events.slice(0, $scope.events.length);
        angular.forEach(data.data, function (value) {
            $scope.events.push({
                id: value.Id,
                title: value.NameDay,
                description: value.Description,
                start: new Date(parseInt(value.StartDate.substr(6))),
                end: new Date(parseInt(value.EndDate.substr(6))),
                allDay: value.IsFullDay,
                stick: true
            });
        });
    });
};
load();
    //configure calendar
$scope.uiConfig = {
    calendar: {
        height: 450,
        editable: true,
        displayEventTime: false,
        header: {
            //left: 'month basicWeek basicDay agendaWeek agendaDay',
            left: 'month,basicWeek,basicDay',
            center: 'title',
            right: 'today prev,next'
        },
      
        eventAfterAllRender: function () {
            if ($scope.events.length > 0 && isFirstTime) {
                uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start);
                isFirstTime = false;
            }
        }
    }
};

    $scope.Add = function () {
     $http({
            method: 'POST',
            url: '/api/Event/SaveEvent',
            data: {
                    NameDay: $scope.event.title,
                    Description: $scope.event.description,
                    StartDate: new Date($scope.event.start),
                    EndDate: new Date($scope.event.end),
                    IsFullDay : false 
                }
        }).then(function (data) {
            $scope.events.push($scope.event);
            $scope.event = data;
            $scope.event = {};
        }),function (data) {
            console.log('Error:', data);
        };
      };

    $scope.getEdit = function () {
        $scope.ev = $scope.events[this.$index];
        return true;
    };

    $scope.editEvent = function () {
        $http({
            method: 'POST',
            url: '/api/Event/EditEvent',
            params: { 'Id': $scope.ev.id },
            data: {
                Id: $scope.ev.id,
                NameDay: $scope.ev.title,
                Description: $scope.ev.description,
                StartDate: new Date($scope.ev.start),
                EndDate: new Date($scope.ev.end),
                IsFullDay: false
            }
        }).then(function (response) {
            $scope.ev = {};
        }), function (response) {
            console.log('Error:', data);
        };
        
    };

    $scope.deleteEvent = function () {
        
        $http({
            method: 'POST',
            url: '/api/Event/DeleteEvent',
            params: { 'Id': this.event.id }
        }).then(function (response) {
            $scope.events.splice(this.$index, 1);
         }), function (response) {
            console.log('Error:', data);
           };
    };

}]);

app.factory('registerfactory', ['$location', 'localStorageService', function ($location,localStorageService) {
    var authServiceFactory = {};
    var _authentication = {
        isAuth: false,
        userName: ""
    };

    var _submit = function () {
        var data = {
            Email: $('#email').val(),
            Password: $('#password').val(),
            ConfirmPassword: $('#confirmpassword').val()
        };

        $.ajax({
            type: 'POST',
            url: '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).success(function (data) {
            alert("registration is done");
        }).fail(function (data) {
            alert("registration is fail");
        });
    };
    var tokenKey = "tokenInfo";
    var _submitLogin = function () {
       var loginData = {
            grant_type: 'password',
            username: $('#emailLogin').val(),
            password: $('#passwordLogin').val()
        };

        $.ajax({
            type: 'POST',
            url: '/Token',
            data: loginData
        }).success(function (data) {
            $('.userName').text(data.userName);
            $('.userInfo').css('display', 'block');
            $('.loginForm').css('display', 'none');
            _authentication.isAuth = true;
            _authentication.userName = data.userName;
            // сохраняем в хранилище sessionStorage токен доступа
            sessionStorage.setItem(tokenKey, data.access_token);
            console.log(data.access_token);
         }).fail(function (data) {
            alert('login is fail');
        });
    };

    var _logOut = function () {
        sessionStorage.removeItem(tokenKey);
        $('.userInfo').css('display', 'none');
        $('.loginForm').css('display', 'block');
        _authentication.isAuth = false;
        _authentication.userName = "";
    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
        }
    };

    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.submitLogin = _submitLogin;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.submit = _submit;
    authServiceFactory.authentication = _authentication;

    return authServiceFactory;
}]);

app.controller("RegisterController", ['$scope', 'registerfactory', function ($scope, registerfactory) {

    $scope.logOut = function () {
        registerfactory.logOut();
    };

    $scope.submit = function () {
        registerfactory.submit();
    };

    $scope.submitLogin = function () {
        registerfactory.submitLogin();
        $scope.authentication = registerfactory.authentication;
        $scope.authentication.isAuth = true;
    };

}]);

app.controller('indexController', ['$scope', '$location', 'registerfactory', function ($scope, $location, registerfactory) {

    $scope.logOut = function () {
        registerfactory.logOut();
        $location.path('/register');
    }

    $scope.authentication = registerfactory.authentication;

}]);