(function($){
  $(function(){


    console.log("lol");

    // Create Map
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGV5amVmZnNoYXciLCJhIjoiY2lpMnFhdzBiMDBzanQza2ZndGw1bW0wNyJ9.0EtBJMFisJpHLKHF_1z5iQ';
    var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/heyjeffshaw/ciulemmrk00502jod300sqyqd', //stylesheet location
    center: [-90.4949413, 38.5774431], // starting position
    zoom: 16 // starting zoom
    });

  }); // end of document ready
})(jQuery); // end of jQuery name space
