/**
 * Created by alei on 2014/6/12.
 * See:http://kjs.mep.gov.cn/hjbhbz/bzwb/dqhjbh/jcgfffbz/201203/W020120410332725219541.pdf
 */
jQuery.aqi = {
  aqi: function (aqiType) {
    var BP_ELEMENTS = {'so2_24': 'so2_24', 'so2': 'so2', 'no2_24': 'no2_24', 'no2': 'no2', 'pm10_24': 'pm10_24', 'co_24': 'co_24', 'co': 'co', 'o3': 'o3', 'o3_8': 'o3_8', 'pm25_24': 'pm25_24'};
    var basic = {};
    basic.iaqi = [ 0, 50, 100, 150, 200, 300, 400, 500 ];
    //so2_24
    basic[BP_ELEMENTS.so2_24] = [ 0, 50, 150, 475, 800, 1600, 2100, 2620 ];
    //so2
    basic[BP_ELEMENTS.so2] = [ 0, 150, 500, 650, 800 ];
    //no2_24
    basic[BP_ELEMENTS.no2_24] = [ 0, 40, 80, 180, 280, 565, 750, 940 ];
    //no2
    basic[BP_ELEMENTS.no2] = [ 0, 100, 200, 700, 1200, 2340, 3090, 3840 ];
    //pm10_24
    basic[BP_ELEMENTS.pm10_24] = [ 0, 50, 150, 250, 350, 420, 500, 600 ];
    //co_24
    basic[BP_ELEMENTS.co_24] = [ 0, 2, 4, 14, 24, 36, 48, 60 ];
    //co
    basic[BP_ELEMENTS.co] = [ 0, 5, 10, 35, 60, 90, 120, 150 ];
    //o3
    basic[BP_ELEMENTS.o3] = [ 0, 160, 200, 300, 400, 800, 1000, 1200 ];
    //o3_8
    basic[BP_ELEMENTS.o3_8] = [ 0, 100, 160, 215, 265, 800 ];
    //pm25_24
    basic[BP_ELEMENTS.pm25_24] = [ 0, 35, 75, 115, 150, 250, 350, 500 ];

    var aqiInfoTypes = {
      //'so2_24', 'no2_24', 'pm10_24', 'co_24',  'o3', 'o3_8', 'pm25_24'
      daily: [BP_ELEMENTS.so2_24, BP_ELEMENTS.no2_24, BP_ELEMENTS.pm10_24, BP_ELEMENTS.co_24, BP_ELEMENTS.o3, BP_ELEMENTS.o3_8, BP_ELEMENTS.pm25_24],
      //'so2', 'no2', 'pm10_24', 'co', 'o3', 'o3_8', 'pm25_24'
      hour: [BP_ELEMENTS.so2, BP_ELEMENTS.no2, BP_ELEMENTS.pm10_24, BP_ELEMENTS.co, BP_ELEMENTS.o3, BP_ELEMENTS.o3_8, BP_ELEMENTS.pm25_24]
    };
    if (aqiType === undefined) {
      aqiType = 'daily';
    }
    var aqiElements = aqiInfoTypes[aqiType];
    var aqInfo = {};
    aqInfo.iaqi = basic.iaqi;
    for (var i = 0; i < aqiElements.length; i++) {
      aqInfo[aqiElements[i]] = basic[aqiElements[i]];
    }

    function getIAQILoAndHi(lowIndex, hiIndex) {
      return {lo: aqInfo.iaqi[lowIndex], hi: aqInfo.iaqi[hiIndex]};
    }

    function getBPLoAndHi(element, cp) {
      var _bp = aqInfo[element];
      for (var i = 0; i < _bp.length; i++) {
        if (cp <= _bp[i]) {
          if (i === 0) {
            return null;
          }
          var _loIndex = i - 1;
          return {loIndex: _loIndex, lo: _bp[_loIndex], hiIndex: i, hi: _bp[i]};
        }
      }
      return null;
    }

    function getPriPol(maxElements) {
      var _priPol = [];
      if (maxElements.length <= 0) {
        return _priPol;
      }
      if (maxElements[0].value <= 50) {
        return _priPol;
      }
      var j = 0;
      for (var i = 0; i < maxElements.length; i++) {
        var _name = getElementName(maxElements[i].element);
        if (_name === '') {
          continue;
        }
        _priPol[j++] = _name;
      }
      return _priPol;
    }

    function getElementName(element) {
      switch (element) {
        case BP_ELEMENTS.so2_24:
        case BP_ELEMENTS.so2:
          return 'SO2';
        case  BP_ELEMENTS.no2_24:
        case BP_ELEMENTS.no2:
          return 'NO2';
        case BP_ELEMENTS.pm10_24:
          return 'PM10';
        case BP_ELEMENTS.co_24:
        case BP_ELEMENTS.co:
          return 'CO';
        case BP_ELEMENTS.o3:
        case BP_ELEMENTS.o3_8:
          return 'O3';
        case BP_ELEMENTS.pm25_24:
        case BP_ELEMENTS.pm25:
          return 'PM2.5';
      }
      return '';
    }

    return {
      getPrimaryPollutant: function (data) {
        var _maxElements = [];
        for (var _key in aqInfo) {
          var _dataKey = _key.replace("_24", "");
          if (data[_key] === undefined || _key == 'iaqi') {
            continue;
          }
          var _cp = data[_dataKey];
          var _bp = getBPLoAndHi(_key, _cp);
          if (_bp === null) {
            continue;
          }
          var _iaqi = getIAQILoAndHi(_bp.loIndex, _bp.hiIndex);
          var _iaqip = (_iaqi.hi - _iaqi.lo) / (_bp.hi - _bp.lo) * (_cp - _bp.lo) + _iaqi.lo;
          var _length = _maxElements.length;
          var _curElement = {element: _key, value: _iaqip};
          if (_length === 0) {
            _maxElements[0] = _curElement;
          } else {
            if (_maxElements[0].value == _iaqip) {
              _maxElements[_length] = _curElement;
            } else if (_maxElements[0].value < _iaqip) {
              _maxElements = [_curElement];
            }
          }
        }
        return getPriPol(_maxElements);
      }, getAqi: function (data) {
        var _aqi = 0;
        for (var _key in aqInfo) {
          if (data[_key] === undefined || _key == 'iaqi') {
            continue;
          }
          var _cp = data[_key];
          var _bp = getBPLoAndHi(_key, _cp);
          if (_bp === null) {
            continue;
          }
          var _iaqi = getIAQILoAndHi(_bp.loIndex, _bp.hiIndex);
          var _iaqip = (_iaqi.hi - _iaqi.lo) / (_bp.hi - _bp.lo) * (_cp - _bp.lo) + _iaqi.lo;
          if (_aqi < _iaqip) {
            _aqi = _iaqip;
          }
        }
        return _aqi;
      }
    };
  }
};