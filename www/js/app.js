/**
 * Created by praveen on 12.09.15.
 */

angular.module('PraveenApp', ['ngMaterial', 'ngRoute', 'angular-timeline', 'angularTypewrite',
    'angularUtils.directives.dirDisqus', 'angulartics', 'angulartics.google.analytics', 'ngLoadScript']);

// Constants setup
angular.module('PraveenApp').constant('config', {
    baseUrl : 'https://pkp.io',      // Baseurl to load site resources
    blogUrl : 'https://blog.pkp.io'  // Api url for blog
});

// Theme setup
angular.module('PraveenApp').config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('blue');
});

// Auto page title setup
angular.module('PraveenApp').run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.title;
    });
}]);

// Disable caching for all HTTP requests
angular.module('PraveenApp').config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

// Remote data fetching service
angular.module('PraveenApp').factory('remote', function($rootScope, $http, $q, config) {
    var observerCallbacks = [];
    var progress = 0;
    var notifyFetchProgressAs = function(prog){
        progress = prog;
        angular.forEach(observerCallbacks, function(callback){
            callback();
        });
    };
    var fetchData = function(url) {
        notifyFetchProgressAs(1);
        var req = {
            method: 'GET',
            url: url
        };
        var deferred = $q.defer();
        $http(req)
            .then(
            function (response) { // Success callback
                deferred.resolve(response.data);
                notifyFetchProgressAs(0);
            },
            function (response) { //Error callback
                console.log(response.toString());
                deferred.reject(response.toString());
                notifyFetchProgressAs(-1);
            }
        );
        return deferred.promise;
    };
    this.fetchSiteData = function(relativeUrl) {
        return fetchData(config.baseUrl + relativeUrl);
    };
    this.fetchBlogData = function(relativeUrl) {
        return fetchData(config.blogUrl + relativeUrl);
    };
    this.registerProgressObserver = function(callback){
        observerCallbacks.push(callback);
    };
    this.getProgress = function() {
        return progress;
    };
    return this;
});

// Main App controller
angular.module('PraveenApp').controller('AppCtrl', function($scope, remote) {
    var updateProgress = function(){
        $scope.progress = remote.getProgress();
    };
    remote.registerProgressObserver(updateProgress);
    $scope.menuItems = [
        {
            class: "fa-user",
            text: "About",
            url: "/about"
        },
        {
            class: "fa-graduation-cap",
            text: "Academia",
            url: "/academia"
        },
        {
            class: "fa-user-secret",
            text: "Work",
            url: "/work"
        },
        {
            class: "fa-code",
            text: "Projects",
            url: "/projects"
        },
        {
            class: "fa-pencil",
            text: "Blog",
            url: "/blog"
        }
    ];
});

// Route setup
angular.module('PraveenApp').config(function($routeProvider, $locationProvider) {
    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    $routeProvider
        .when('/about',{
            title       : 'Praveen\'s profile',
            templateUrl : 'view/about.html',
            controller  : 'AboutCtrl'
        })
        .when('/academia',{
            title       : 'Praveen\'s studies',
            templateUrl : 'view/academics.html',
            controller  : 'AcadCtrl'
        })
        .when('/work',{
            title       : 'Praveen\'s work',
            templateUrl : 'view/work.html',
            controller  : 'WorkCtrl'
        })
        .when('/projects',{
            title       : 'Praveen\'s projects',
            templateUrl : 'view/project.html',
            controller  : 'ProjectCtrl'
        })
        .when('/blog',{
            title       : 'Praveen\'s blog',
            templateUrl : 'view/blog.html',
            controller  : 'BlogCtrl'
        })
        .when('/blog/category/:category',{
            title       : 'Praveen\'s blog category',
            templateUrl : 'view/blog.html',
            controller  : 'BlogCtrl'
        })
        .when('/blog/post/:posturl*\/',{
            title       : 'Praveen\'s blog post',
            templateUrl : 'view/post.html',
            controller  : 'BlogPostCtrl'
        })
        .when('/blog/:posturl*\/',{
            title       : 'Praveen\'s blog post',
            templateUrl : 'view/post.html',
            controller  : 'BlogPostCtrl'
        })
        .when('/',{
            title       : 'Praveen\'s site',
            templateUrl : 'view/intro.html',
            controller  : 'IntroCtrl'
        })
        .when('/index.html',{
            title       : 'Praveen\'s site',
            templateUrl : 'view/intro.html',
            controller  : 'IntroCtrl'
        })
        .otherwise({
            title       : 'Praveen\'s site - 404 not found!',  // This title is not taken by the routeProvider
            templateUrl : 'view/404.html',
            controller  : 'ErrorCtrl'
        });
});
