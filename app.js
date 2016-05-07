/*
 * 福井道の駅一覧
 *
 * Copyright 2015 8am.
 * http://8am.jp/
 *
 */

$(function() {
    var map;
    var marker;
    var directionsDisplay;
    var directionsService;
    var infowindow;
    var data = {};
    var list = [];
    var origin = {lat:36.062128, lng:136.223321}; // 福井駅
    var $infowindow = $("<div><h1/><p/></div>").addClass("infowindow");
    $infowindow.find("h1").eq(0).addClass("title");
    $infowindow.find("p").eq(0).addClass("address");
    var $_dt = $("<dt><span><a/></span><span/></dt>");
    $_dt.find("span").eq(0).addClass("title");
    $_dt.find("span").eq(1).addClass("distance");

    $(window).on("load orientationchange resize", function() {
        adjust();
    });

    init();

    function adjust() {
        var h = $(window).height() - $("#header").outerHeight();
        $("#map").height(h);
        $("#list").height(h);
    }

    function getData() {
        var deferred = new $.Deferred;
        $.ajax(
            "./json.php",
            {
                dataType: "jsonp",
                jsonpCallback: "mitinoeki"
            }
        )
        .done(function( json ) {
            data = json;
            deferred.resolve();
        });
        return deferred.promise();
    }

    function setList() {
        $.each( list, function(i, e) {
            e.distance = 6378.137 * Math.acos(Math.sin(origin.lat * Math.PI / 180) * Math.sin(e.lat * Math.PI / 180) + Math.cos(origin.lat * Math.PI / 180) * Math.cos(e.lat * Math.PI / 180) * Math.cos(e.lng * Math.PI / 180 - origin.lng * Math.PI / 180));
        });
        list.sort(function(a, b) {
            return (a.distance < b.distance) ? -1 : 1;
        });
        $("#list").empty();
        var $dl = $("<dl/>");
        $.each( list, function(i, e) {
            var $dt = $_dt.clone();
            $dt.find(".title").text(e.name);
            $dt.find(".distance").text( (e.distance < 1) ? e.distance.toFixed(3) * 1000 + "m" : e.distance.toFixed(3) + "km" );

            $dt.click(function () {
                var request = {
                    origin:    new google.maps.LatLng(origin.lat, origin.lng),
                    destination:    new google.maps.LatLng(e.lat, e.lng),
                    travelMode: google.maps.TravelMode.DRIVING,
                    avoidHighways: true
                };
                directionsService.route(request, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(result);
                    }
                });

                marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(e.lat, e.lng),
                    visible: false
                });

                $infowindow.find(".title").text(e.name);
                $infowindow.find(".address").text(e.address);
                infowindow.setContent($infowindow.html());
                infowindow.open(map, marker);
            });
            $dl.append($dt);
        });
        $("#list").append($dl);
    }

    function init() {
        getData()
        .done(function() {
            map = new google.maps.Map($("#map")[0], {
                zoom: 8,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer({
                map: map
            });
            infowindow = new google.maps.InfoWindow({
                maxWidth: 300
            });
            $.each( data, function(i, e) {
                var marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(e.lat, e.lng)
                });
                list.push(e);
            });
            navigator.geolocation.getCurrentPosition( function (p) {
                origin = {lat:p.coords.latitude, lng:p.coords.longitude};
                setList();
            });
            map.setCenter(new google.maps.LatLng(origin.lat, origin.lng)); // 現在位置が取得できればそれを中心に、できなければ福井駅を中心に
        });
        adjust();
    }
});