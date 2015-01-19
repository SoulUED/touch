/**
 * Created by margintan on 15/1/11.
 */
(function (win, doc){
    var _touchObject, _forEach;

    _touchObject =  {};
    _forEach = Array.prototype.forEach;


    function combinationNodeNameIdClassNameByElement (_element) {
        var _id, _className,_nodeName;

        _nodeName = _element.nodeName.toLocaleLowerCase();

        _id = _element.id;
        _id = (_id && "#" + _id) || "";

        _className = _element.className && ("." + _element.className.replace(/\s/g, "."));


        return _nodeName + _id  + _className;
    }

    function replaceAllWhiteSpace (_string) {
        return _string.replace(/\s*/g, "");
    }

    function addCallbackTo (_elementRepresent, _event, _proxy, _callback) {
        var _stringCallback;

        if (!_callback) {

            if (!_touchObject[_elementRepresent].elementHasEvent[_elementRepresent]) {
                _touchObject[_elementRepresent].elementHasEvent[_elementRepresent] = {}
            }
            if (!_touchObject[_elementRepresent].elementHasEvent[_elementRepresent][_event]) {
                _touchObject[_elementRepresent].elementHasEvent[_elementRepresent][_event] = {}
            }

            _stringCallback = replaceAllWhiteSpace(_proxy.toString());
            _touchObject[_elementRepresent].elementHasEvent[_elementRepresent][_event][_stringCallback] = _proxy;
        }else{
            if (!_touchObject[_elementRepresent].elementHasEvent[_proxy]) {
                _touchObject[_elementRepresent].elementHasEvent[_proxy] = {}
            }
            if (!_touchObject[_elementRepresent].elementHasEvent[_proxy][_event]) {
                _touchObject[_elementRepresent].elementHasEvent[_proxy][_event] = {}
            }
            _stringCallback = replaceAllWhiteSpace(_callback.toString());

            _touchObject[_elementRepresent].elementHasEvent[_proxy][_event][_stringCallback] = _callback;
        }
    }

    /**
     *
     * @param func
     * @param wait
     * @param immediate
     * @returns {Function}
     * the method comes from underscore
     */
    function debounce (func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = Date.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    }

    function getFireEvent (e, _elementRepresent) {
        var _element, _touchEventObject, isHasEvent, _id, _className, _nodeName, _prototypeString, _REX;

        isHasEvent = {
            "tap": []
        };

        _element = e.target;

        _id = _element.id && "#" + _element.id;
        _nodeName = _element.nodeName.toLocaleLowerCase();
        _className = _element.className && ("." + _element.className.replace(/\s/g, "."));

        _touchEventObject = _touchObject[_elementRepresent].elementHasEvent;

        /*_REX = "/\w*#{0,1}\w*[.\w*]*";*/

        _REX =  new RegExp(getFireEvent._createRex(_nodeName, _id, _className));

        for (var i in _touchEventObject) {
            if ( i  == i.match(_REX)[0]) {
                for (var k in _touchEventObject[i]) {
                    for (var z in _touchEventObject[i][k]) {
                        isHasEvent[k].push(_touchEventObject[i][k][z]);
                    }

                }
            }
        }

        return isHasEvent ? isHasEvent : false;
    }

    getFireEvent._createRex = function (_nodeName, _id, _className) {
        var _classNameArr = _className.split("."),
            _rex;

        _rex = "[" + _nodeName + "]*";

        if (_id) {
            _rex = _rex + "[" + _id + "]{0,1}"
        }

        _rex = _rex + "[";
        _classNameArr.forEach(function(value){
            if (value) {
                value = "." + value + "|";
                _rex = _rex + value;
            }
        });

        _rex  = _rex + "]*";

        return _rex;
    };


    function Touch(_elementRepresents, _element, _event, _proxy, _callback) {
        var _elementRepresent = _elementRepresents, thisActionType;

        _touchObject[_elementRepresent] = {};
        _touchObject[_elementRepresent].elementHasEvent = {};
        _touchObject[_elementRepresent]._touchObject = this;


        function handleStart (e) {
            thisActionType = {};
            thisActionType.start = e.type;
        }

        var handleMove = debounce(function (e) {
            thisActionType.move = e.type;
        }, 100);

        function handleEnd (e) {
            var isHasEvent;
            thisActionType.end = e.type;

            isHasEvent = getFireEvent(e, _elementRepresent);

            if (!isHasEvent) return;

            if (!thisActionType.move && isHasEvent.tap) {
                isHasEvent.tap.forEach(function (value){
                    value.call(e.target, e);
                });
                return false;
            }

            if (thisActionType.move) {

            }
        }

        _element.addEventListener("touchstart", handleStart, false);
        _element.addEventListener("touchmove", handleMove, false);
        _element.addEventListener("touchend", handleEnd, false);

        addCallbackTo(_elementRepresent, _event, _proxy, _callback);

    }


    var _Touch = function (_element, _event, _proxy, _callback) {
        var _elementRepresent = combinationNodeNameIdClassNameByElement(_element);

        if (_touchObject[_elementRepresent]) {
            addCallbackTo(_elementRepresent, _event, _proxy, _callback);
            return _touchObject[_elementRepresent]._touchObject;
        }else{
            return new Touch(_elementRepresent, _element, _event, _proxy, _callback);
        }
    };

    _Touch(document.body, "tap", function (){
        alert("123");
    });
    _Touch(document.body, "tap", ".test", function (){
        alert("123");
    });
    _Touch(document.body, "tap", "p#test.test.test1.test3.test4", function (){
        alert("123");
    });
    _Touch(document.body, "tap", "p#test", function (){
        alert("123");
    });



})(window, document);