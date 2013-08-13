requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/javascripts/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        jquery: 'jquery/jquery-1.10.2.min',
        googleMaps: '//maps.googleapis.com/maps/api/js?key=AIzaSyC69q4cWqAg7oJHdYNu9ZTl2C6zSaTrUeA&sensor=false',
        jqueryUI: 'jquery-ui/jquery-ui-1.10.3.custom.min',
        leaflet: 'leaflet/leaflet',
        leafletProviders: 'leaflet/plugins/leaflet-providers',
        leafletControlFullScreen: 'leaflet/plugins/fullscreen/Control.FullScreen',
        leafletGoogleTiles: 'leaflet/plugins/layer/tile/Google',
        leafletBingTiles: 'leaflet/plugins/layer/tile/Bing',
        bootstrap: 'bootstrap/bootstrap.min',
        kendo: 'kendo/kendo.web.min',
        kendoSpanishCulture: 'kendo/cultures/kendo.culture.es-CO.min',
        knockout: 'knockout/knockout-2.3.0',
        knockoutKendoUI: 'knockout-kendoui/knockout-kendo.min',
        customScrollBar: 'custom-scrollbar/jquery.mCustomScrollbar.min',
        customScrollBarMouseWheel: 'custom-scrollbar/jquery.mousewheel.min'
    }
});

//requirejs(["googleMaps"]);
//requirejs(["jquery"]);
//requirejs(["jqueryUI"]);
//requirejs(["leaflet"]);
//requirejs(["leafletProviders"]);
//requirejs(["leafletControlFullScreen"]);

// Load the main app module to start the app
requirejs(["app/main"]);