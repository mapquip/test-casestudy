(function(){
  var $assetsTable = $('#assetsTable');
  var tableObj;
  
  $(document).ready(function(){
    $('#submit').on('click', GetUser);
  });

  var map = L.map('map');  
  //var markers;
  var markers = L.markerClusterGroup({ chunkedLoading: true });

  /* Please replace this with your personal mapbox access token */ 
  var access_token = 'pk.eyJ1IjoiZ3JlZ2lzbSIsImEiOiJiNjMwMWE5MWUwOThjOGUxYjIxMzk5Njk3ODBkM2ZjZiJ9.WjgpibCLDnpbg3vjS0MLKw';

  //Create map layer
  var mainMap = L.tileLayer(
    'http://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + access_token,
    {}
  ).addTo(map);

  map.setView([29.7604, -95.3698], 5);

  function make_basic_auth(user, password) {
    var tok = user + ':' + password;
    var hash = Base64.encode(tok);
    return "Basic " + hash;
  }

  function GetUser() {
     jQuery.support.cors = true;
     var auth = make_basic_auth(document.getElementById('UserId').value, document.getElementById('Pwd').value);
     $.ajax({
       url: 'http://demo.rastrac.net/RtAPI_v0_2/api/State/',
       type: 'GET',
       dataType: 'json',
       success: function (data) {
        WriteResponse(data);
        $('#login').hide();
       },
       beforeSend : function(req) {
        req.setRequestHeader('Authorization', auth);
       },
       error: function (x, y, z) {
        console.log(x);
        console.log(y);
        console.log(z);
        //alert('The User not found in the List for the given ID');
       }
    });
  }

  function addMarkers(markerList){
    markers.clearLayers();
    markers.addLayers(markerList);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds(),{padding:[20,20]});
  }

  function showAssets(rows){
    var markerList = [];
    //$alertBox.text('Mapping people')
    
    rows.forEach(function(asset){
      var id = asset.ID;
      var marker;
      if(asset.Latitude && asset.Longitude){
        marker = L.marker(L.latLng(asset.Latitude, asset.Longitude), { title: id });
      
        marker.bindPopup(id);
        markerList.push(marker);
        //addZip(marker);
        addMarkers(markerList);

      }
    });
  }

  function filterResults(data, search){
    search = search.toLowerCase();
    var filtered = data.filter(function(row){
      return row.Street.toLowerCase().indexOf(search) !== -1 || row.City.toLowerCase().indexOf(search) !== -1 || row.Province.toLowerCase().indexOf(search) !== -1;
    });
    showAssets(filtered);
  }

  function WriteResponse(data){
    var ids = [];
    data = _.uniq(data,function(item){return JSON.stringify(item);});
    tableObj = $assetsTable.DataTable({
      data: data.filter(function(row){
        return row.Longitude && row.Latitude;
      }),
      "columns": [
            { "data": "ID" },
            { "data": "Street" },
            { "data": "City" },
            { "data": "Province" }
        ]
    });
    $assetsTable.show();
    showAssets(data);

    tableObj.on( 'search.dt', function (e) {
      filterResults(data, tableObj.search());
    });
  }
}());


    