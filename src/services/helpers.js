const jsts = require('jsts');

export class Helpers {
  constructor() {

  }

  clone(o) {
    var n = {}.toString.apply(o) == "[object Array]" ? [] : {};
    for (var i in o)
      n[i] = typeof o[i] == 'object' ? this.clone(o[i]) : o[i];
    return n;
  }

  returnClusterClassObject(length) {
    var classSize,
        offset;
    if (length >= 3) {
      classSize = 'large';
      offset = 25;
    } else if (length == 2) {
      classSize = 'medium';
      offset = 20;
    } else {
      classSize = 'small';
      offset = 15;
    }

    return {
      classSize: classSize,
      offSet: offset
    }

  }

  returnMapProjections(map) {

    var bounds = new google.maps.LatLngBounds(),
        projection = map.getProjection();

    return {
      bounds: bounds,
      projection: projection,
      topRight: projection.fromLatLngToPoint(map.getBounds().getNorthEast()),
      bottomLeft: projection.fromLatLngToPoint(map.getBounds().getSouthWest()),
      scale: Math.pow(2, map.getZoom())
    }
  }

  createJstsPolygon(polygon) {
    const geometryFactory = new jsts.geom.GeometryFactory();
    var path = polygon.getPath();
    var coordinates = path.getArray().map(function name(coord) {
      return new jsts.geom.Coordinate(coord.lat(), coord.lng());
    });
    if(coordinates[0].compareTo(coordinates[coordinates.length-1]) != 0)
      coordinates.push(coordinates[0]);
    var shell = geometryFactory.createLinearRing(coordinates);
    return geometryFactory.createPolygon(shell);
  }

}
