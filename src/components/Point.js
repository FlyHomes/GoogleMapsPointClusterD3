// Import the MarkerWithLabel library.
import MarkerWithLabel from 'markerwithlabel';
import OverlappingMarkerSpiderfier from '../services/spider-marker';
import Popper from '../services/popper';

export class Point {

  constructor(map, collection) {
    this.map = map;
    this.collection = collection;
    this.markerListeners = []
    this.setExternalMouseEvents();
    this.oms = new OverlappingMarkerSpiderfier(this.map, {
      markersWontMove: true,
      markersWontHide: true,
      nearbyDistance: 10,
      keepSpiderfied: true,
      legWeight: 3,
      usualLegZIndex: 25000
    });
  }

  print() {
    var self = this;
    this.markers = [];
    this.collection.forEach(function(o, i) {
      if (i === 0) {
        console.log(o)
      }
      let lat = o.lat || o.location.latitude;
      let lng = o.lng || o.location.longitude;
      var m = new MarkerWithLabel({
        position: new google.maps.LatLng(lat, lng),
        map: self.map,
        hoverContent: o.hoverData || "",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0
        },
        draggable: false,
        labelAnchor: new google.maps.Point(10, 10),
        labelClass: 'marker-point'
      });

      self.markers.push(m);

      self.oms.addMarker(m)

    });

    self.setEvents(false);

    this.setOmsEvents();

  }

  setOmsEvents() {
    var self = this;

    this.oms.addListener('click', function(marker, event) {
      self.removePopper();
    });

    this.oms.addListener('spiderfy', function(markers, event) {
      self.removePopper();
      self.markers.forEach(function(marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass + " fadePins"
        });
      })
      markers.forEach(function(marker) {
        self.removeListeners();
        self.setEvents(true);
        marker.setOptions({
          zIndex: 20000,
          labelClass: marker.labelClass.replace(" fadePins", "")
        });
      });
    });

    this.oms.addListener('unspiderfy', function(markers, event) {
      self.removePopper();
      self.markers.forEach(function(marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass.replace(" fadePins", "")
        });
      });
      self.setEvents(false);
    });

  }

  setExternalMouseEvents() {
    var self = this;
    document.addEventListener('mouseover', function(e) {
      if (e.target.className === 'PinResult') {
        // console.log(self.markers, self.markers.length)
        if (!self.markers[parseInt(e.target.getAttribute('data-pinindex'))]) {
          return false;
        }
        self.markers[parseInt(e.target.getAttribute('data-pinindex'))].setOptions({
          zIndex: 10000,
          labelClass: self.markers[parseInt(e.target.getAttribute('data-pinindex'))].labelClass + " PointHoverState"
        });
      }
    });
    document.addEventListener('mouseout', function(e) {
      if (e.target.className === 'PinResult') {
        if (!self.markers[parseInt(e.target.getAttribute('data-pinindex'))]) {
          return false;
        }
        self.markers[parseInt(e.target.getAttribute('data-pinindex'))].setOptions({
          zIndex: 100,
          labelClass: self.markers[parseInt(e.target.getAttribute('data-pinindex'))].labelClass.replace(" PointHoverState", "")
        });
      }
    });
  }

  setEvents(ignoreZindex=false) {
    var self = this;
    this.markers.forEach(function(marker) {
      var mouseOverListener = marker.addListener('mouseover', function(e) {
        var target = e.target || e.srcElement;
        var m = this;

        // First, set the hover state of the marker
        marker.setOptions({
          zIndex: 10000,
          labelClass: this.labelClass + " PointHoverState"
        });

        // Determine where to place popper right/left
        var mapDivHalfWidth = self.map.getDiv().offsetWidth / 2;
        var markerLeftPos = target.offsetLeft;
        var popperPlacement = (markerLeftPos > mapDivHalfWidth) ? 'top' : 'top';

        var popper = new Popper(
          target, {
            content: m.get('hoverContent'),
            allowHtml: true,
          }, {
            placement: popperPlacement,
            boundariesElement: self.map.getDiv()
          }
        );
        if (!ignoreZindex) {
          this.setZIndex(5000);
        }
      });
      var mouseOutListener = marker.addListener('mouseout', function() {
        // First, remove the hover state of the marker
        marker.setOptions({
          zIndex: 100,
          labelClass: this.labelClass.replace(" PointHoverState", "")
        });
        self.removePopper();
        if (!ignoreZindex) {
          this.setZIndex(1000);
        }
      });
      self.markerListeners.push(mouseOverListener)
      self.markerListeners.push(mouseOutListener)
    });
  }

  removeListeners() {
    for (var i = 0; i < this.markerListeners.length; i++) {
      google.maps.event.removeListener(this.markerListeners[i]);
    }
    this.markerListeners = [];
  }

  remove() {
    this.removeListeners();
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    // this.markers = [];
  }

  removePopper() {
    var popper = document.querySelector('.popper');
    if (popper) {
      popper.remove();
    }
  }

}
