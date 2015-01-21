/**
 * Created by margintan on 15/1/11.
 */
(function (win, doc){
    var _touchObject;

    _touchObject =  {};


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
        var isHasEvent;

        isHasEvent = {
            "tap": [],
            "slideUp": []
        };

        getFireEvent._popUp(e.target, _elementRepresent, isHasEvent);

        return isHasEvent ? isHasEvent : false;
    }

    getFireEvent._createRex = function (_nodeName, _id, _className) {
        var _classNameArr = _className && _className.split("."),
            _rex;

        _rex = "[" + _nodeName + "]*";

        if (_id) {
            _rex = _rex + "[" + _id + "]{0,1}"
        }

        if (_classNameArr) {
            _rex = _rex + "[";

            _classNameArr.forEach(function(value){
                if (value) {
                    value = "." + value + "|";
                    _rex = _rex + value;
                }
            });
            _rex  = _rex + "]*";
        }

        return _rex.replace(/\-/g, "\\-");
    };

    getFireEvent._popUp = function (target, _elementRepresent, isHasEvent) {
        var _element, _touchEventObject, _id, _className, _nodeName, _REX;

        _element = target;

        _id = _element.id && "#" + _element.id;
        _nodeName = _element.nodeName.toLocaleLowerCase();
        _className = _element.className && ("." + _element.className.replace(/\s/g, "."));

        _touchEventObject = _touchObject[_elementRepresent].elementHasEvent;

        _REX =  new RegExp(getFireEvent._createRex(_nodeName, _id, _className));

        for (var i in _touchEventObject) {
            if ( i  == i.match(_REX)[0]) {
                for (var k in _touchEventObject[i]) {
                    for (var z in _touchEventObject[i][k]) {
                        isHasEvent.target = target;
                        isHasEvent[k].push(_touchEventObject[i][k][z]);
                    }
                }
            }
        }

        if (target.parentNode) {
            getFireEvent._popUp(target.parentNode, _elementRepresent, isHasEvent);
        }else{
            return false;
        }

    };

    function Touch(_elementRepresents, _element, _event, _proxy, _callback) {
        var _elementRepresent, thisActionType, startX, startY, endX, endY, _slideUpFireDistance;

        _elementRepresent = _elementRepresents;

        _touchObject[_elementRepresent] = {};
        _touchObject[_elementRepresent].elementHasEvent = {};
        _touchObject[_elementRepresent]._touchObject = this;

        _slideUpFireDistance = 20;

        function handleStart (e) {
            e.preventDefault();
            var _eToucheObject;

            _eToucheObject = e.touches[0];
            thisActionType = {};
            thisActionType.start = e.type;

            startX = _eToucheObject.clientX;
            startY = _eToucheObject.clientY;
        }

        function handleMove (e) {
            e.preventDefault();
            thisActionType.move = e.type;
        }

        function handleEnd (e) {
            e.preventDefault();
            var isHasEvent, _eTouchObject, _slideUpDistance;
            thisActionType.end = e.type;

            _eTouchObject = e.changedTouches[0];

            isHasEvent = getFireEvent(e, _elementRepresent);

            endX = _eTouchObject.clientX;
            endY = _eTouchObject.clientY;

            _slideUpDistance = startY - endY;

            if (!isHasEvent) return;

            if (!thisActionType.move && isHasEvent.tap[0]) {
                Touch._fireEvent.call(isHasEvent.tap, e, isHasEvent.target);
                return false;
            }

            if (thisActionType.move && _slideUpDistance > _slideUpFireDistance && isHasEvent.slideUp[0]) {
                Touch._fireEvent.call(isHasEvent.slideUp, e, isHasEvent.target);
            }
        }

        _element.addEventListener("touchstart", handleStart, false);
        _element.addEventListener("touchmove", handleMove, false);
        _element.addEventListener("touchend", handleEnd, false);

        addCallbackTo(_elementRepresent, _event, _proxy, _callback);
    }

    Touch._fireEvent = function (e, target) {
        this.forEach(function (value) {
            value.call(target, e);
        })
    };

    var _Touch = function (_element, _event, _proxy, _callback) {
        var _elementRepresent = combinationNodeNameIdClassNameByElement(_element);
        if (_touchObject[_elementRepresent]) {
            addCallbackTo(_elementRepresent, _event, _proxy, _callback);
            return _touchObject[_elementRepresent]._touchObject;
        }else{
            return new Touch(_elementRepresent, _element, _event, _proxy, _callback);
        }
    };

    SX.Touch = _Touch;
})(window, document);