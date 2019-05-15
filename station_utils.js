var date_sort = function (date1, date2) {
  if (date1 > date2) return 1;
  if (date1 < date2) return -1;
  return 0;
};
var station_sort = function (station1, station2) {
  if (station1.name > station2.name) return 1;
  if (station1.name < station1.name) return -1;
  return 0;
};

function proj(long, lat) {
  return projection([parseFloat(long), parseFloat(lat)]);
}


//TODO id is being treated as a string, its OK as long as its consistent.  
function Station(id, long, lat, name) {
  this.id = id;
  this.geo = [parseFloat(long), parseFloat(lat)];
  this.name = name;
  this.bikesIn = [];
  this.bikesOut = [];
}

function stationInsert(station, startVal, endVal){
  var length = stations.length;
  var start = typeof(startVal) != 'undefined' ? startVal : 0;
  var end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
  var m = start + Math.floor((end - start)/2);
  if(length == 0){
    stations.push(station);
  } else if(station.id > stations[end].id){
    stations.splice(end + 1, 0, station);
  } else if(station.id < stations[start].id){//!!
    stations.splice(start, 0, station);
  } else if(start >= end){ // I know it looks odd
  } else if(station.id < stations[m].id){
    stationInsert(station, start, m - 1);
  } else if(station.id > stations[m].id){
    stationInsert(station, m + 1, end);
  } 
}

function stationFind(stationId, startVal, endVal){
  var length = stations.length;
  var start = typeof(startVal) != 'undefined' ? startVal : 0;
  var end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
  var m = start + Math.floor((end - start)/2);
  if(length == 0 || stationId > stations[end].id || stationId < stations[start].id || start >= end) {
    return null;
  } else if(stationId < stations[m].id){
    return stationFind(stationId, start, m - 1);
  } else if(stationId > stations[m].id){
    return stationFind(stationId, m + 1, end);
  } 
  return stations[m];
}

function addStationStart(id, long, lat, name, startTime){
  if(lat != null && long != null) {
    station = stationFind(id);
    if(station == null) {
      station = new Station(id, long, lat, name);
      stationInsert(station);
    }
    station.bikesOut.push(startTime);
    station.bikesOut.sort(date_sort);
  }
}

function addStationEnd(id, long, lat, name, endTime){
  if(lat != null && long != null) {
    station = stationFind(id);
    if(station == null) {
      station = new Station(id, long, lat, name);
      stationInsert(station);
    }
    station.bikesIn.push(endTime);
    station.bikesIn.sort(date_sort);
  }
}

function calculateDeltas(station) {
  idxIn = 0;
  idxOut = 0;
  currentDate = minDate;
  currentDelta = 0;
  station.deltas = []
  maxDelta = 0;
  minDelta = 0;
  station.deltas.push([minDate, currentDelta]);
  while(idxIn < station.bikesIn.length && idxOut < station.bikesOut.length) {
    if(station.bikesIn[idxIn] < station.bikesOut[idxOut]) {
      currentDelta++;
      station.deltas.push([station.bikesIn[idxIn], currentDelta]);
      idxIn++;
    } else if(station.bikesIn[idxIn] > station.bikesOut[idxOut]) {
      currentDelta--;
      station.deltas.push([station.bikesOut[idxOut], currentDelta]);
      idxOut++;
    } else {
      idxIn++;
      idxOut++;
    }
    if(currentDelta > maxDelta) {
      maxDelta = currentDelta;
    }
    if(currentDelta < minDelta) {
      minDelta = currentDelta;
    }
  }
  station.deltas.push([maxDate, currentDelta]);
  return station.deltas;
}


